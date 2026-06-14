#!/usr/bin/env bash
# Ralph loop — runs PROMPT.md against Claude Code until the gate is green and STATUS: DONE.
# Usage: bash loop.sh
set -euo pipefail

PROMPT_FILE="PROMPT.md"
PLAN_FILE="fix_plan.md"
MAX_ITERATIONS=20

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "ERROR: $PROMPT_FILE not found." >&2
  exit 1
fi

# Refuse to run on a blank or placeholder prompt
if ! grep -qE "^[^#<[:space:]]" "$PROMPT_FILE"; then
  echo "ERROR: $PROMPT_FILE appears to be empty or a template. Fill in the task first." >&2
  exit 1
fi

# Extract gate command from PROMPT.md (first non-empty, non-comment line after "## Gate command")
GATE_CMD=$(awk '/^## Gate command/{found=1; next} found && NF && !/^[#`]/{gsub(/`/,""); print; exit}' "$PROMPT_FILE")
if [[ -z "$GATE_CMD" ]]; then
  GATE_CMD="npm test && python -m pytest tests/"
  echo "No gate command in PROMPT.md — using default: $GATE_CMD"
fi

GATE_LOG=$(mktemp)
trap 'rm -f "$GATE_LOG"' EXIT

echo "Gate:             $GATE_CMD"
echo "Max iterations:   $MAX_ITERATIONS"
echo "----------------------------------------"

INJECT_FAILURES=""

for i in $(seq 1 "$MAX_ITERATIONS"); do
  echo ""
  echo "=== Iteration $i / $MAX_ITERATIONS ==="
  echo ""

  REMINDER=$(printf '\n\n---\nMANDATORY before finishing this iteration: Read fix_plan.md. Mark each verified criterion [x]. If every criterion is satisfied, set line 1 of fix_plan.md to exactly: STATUS: DONE')

  if [[ -n "$INJECT_FAILURES" ]]; then
    AGENT_PROMPT=$(printf 'The gate command failed. Fix every failure below, then the gate will re-run automatically.\n\n```\n%s\n```\n\n---\nOriginal task:\n%s%s' \
      "$INJECT_FAILURES" "$(cat "$PROMPT_FILE")" "$REMINDER")
  else
    AGENT_PROMPT=$(printf '%s%s' "$(cat "$PROMPT_FILE")" "$REMINDER")
  fi

  claude --dangerously-skip-permissions -p "$AGENT_PROMPT"

  # Auto-close: if agent checked all boxes but forgot to write STATUS: DONE
  if ! grep -q "^STATUS: DONE" "$PLAN_FILE" 2>/dev/null && \
     ! grep -q "^- \[ \]" "$PLAN_FILE" 2>/dev/null && \
       grep -q "^- \[x\]" "$PLAN_FILE" 2>/dev/null; then
    echo "(auto-close: all criteria checked — writing STATUS: DONE)"
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' 's/^STATUS: IN PROGRESS/STATUS: DONE/' "$PLAN_FILE"
    else
      sed -i 's/^STATUS: IN PROGRESS/STATUS: DONE/' "$PLAN_FILE"
    fi
  fi

  if grep -q "^STATUS: BLOCKED" "$PLAN_FILE" 2>/dev/null; then
    echo ""
    echo "=== Loop halted (STATUS: BLOCKED in $PLAN_FILE) ==="
    echo "Check $PLAN_FILE for the blocker and resolve it manually."
    exit 1
  fi

  # --- Gate ---
  echo ""
  echo "--- Running gate: $GATE_CMD ---"
  INJECT_FAILURES=""

  if eval "$GATE_CMD" > "$GATE_LOG" 2>&1; then
    echo "--- Gate: GREEN ---"

    if grep -q "^STATUS: DONE" "$PLAN_FILE" 2>/dev/null; then
      TASK_TITLE=$(awk '/^# Task/{found=1; next} found && NF && !/^[#<]/{print; exit}' "$PROMPT_FILE")
      echo ""
      echo "=== Gate green + STATUS: DONE — committing ==="
      git add -A
      git commit -m "$(printf '%s\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>' \
        "${TASK_TITLE:-Complete task}")"
      echo "=== Loop complete ==="
      exit 0
    fi

    # Gate green but task not yet done — continue loop with clean prompt

  else
    echo "--- Gate: RED — injecting failures into next prompt ---"
    INJECT_FAILURES=$(cat "$GATE_LOG")
    echo ""
    cat "$GATE_LOG"
  fi

done

echo ""
echo "=== Loop reached max iterations ($MAX_ITERATIONS) without completing. ==="
echo "Review $PLAN_FILE for current state."
exit 1
