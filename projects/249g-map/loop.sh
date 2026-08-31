#!/usr/bin/env bash
# Ralph loop — runs PROMPT.md against Claude Code until the gate is green and STATUS: DONE.
# Usage: bash loop.sh
set -euo pipefail

cd "$(dirname "$0")"

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
  echo "ERROR: no gate command in PROMPT.md, and no project-wide default is set yet (see SETUP.md)." >&2
  echo "Fill in PROMPT.md's Gate command, or set a default here once the test stack is chosen." >&2
  exit 1
fi

GATE_LOG=$(mktemp)
REVIEW_LOG=$(mktemp)
trap 'rm -f "$GATE_LOG" "$REVIEW_LOG"' EXIT

echo "Gate:             $GATE_CMD"
echo "Max iterations:   $MAX_ITERATIONS"
echo "----------------------------------------"

INJECT_FAILURES=""
INJECT_REVIEW=""

for i in $(seq 1 "$MAX_ITERATIONS"); do
  echo ""
  echo "=== Iteration $i / $MAX_ITERATIONS ==="
  echo ""

  REMINDER=$(printf '\n\n---\nMANDATORY before finishing this iteration: Read fix_plan.md. Mark each verified criterion [x]. If every criterion is satisfied, set line 1 of fix_plan.md to exactly: STATUS: DONE')

  if [[ -n "$INJECT_FAILURES" ]]; then
    AGENT_PROMPT=$(printf 'The gate command failed. Fix every failure below, then the gate will re-run automatically.\n\n```\n%s\n```\n\n---\nOriginal task:\n%s%s' \
      "$INJECT_FAILURES" "$(cat "$PROMPT_FILE")" "$REMINDER")
  elif [[ -n "$INJECT_REVIEW" ]]; then
    AGENT_PROMPT=$(printf 'A code review rejected the last batch of commits. Address every finding below, then the review will re-run automatically.\n\n```\n%s\n```\n\n---\nOriginal task:\n%s%s' \
      "$INJECT_REVIEW" "$(cat "$PROMPT_FILE")" "$REMINDER")
  else
    AGENT_PROMPT=$(printf '%s%s' "$(cat "$PROMPT_FILE")" "$REMINDER")
  fi

  claude --dangerously-skip-permissions --model opus -p "$AGENT_PROMPT"

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
  INJECT_REVIEW=""

  if (eval "$GATE_CMD") > "$GATE_LOG" 2>&1; then
    echo "--- Gate: GREEN ---"

    if grep -q "^STATUS: DONE" "$PLAN_FILE" 2>/dev/null; then
      TASK_TITLE=$(awk '/^# Task/{found=1; next} found && NF && !/^[#<]/{print; exit}' "$PROMPT_FILE")
      echo ""
      echo "=== Gate green + STATUS: DONE — committing ==="
      git add -A
      git commit -m "$(printf '%s\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>' \
        "${TASK_TITLE:-Complete task}")"

      if git rev-parse -q --verify refs/tags/last-reviewed >/dev/null; then
        REVIEW_COUNT=$(git rev-list --count last-reviewed..HEAD)
      else
        REVIEW_COUNT=$(git rev-list --count HEAD)
      fi

      if [[ "$REVIEW_COUNT" -lt 5 ]]; then
        echo "=== Loop complete ==="
        exit 0
      fi

      # --- Review gate: every 5 commits, a fresh-context reviewer checks the batch ---
      echo ""
      echo "--- Review gate: $REVIEW_COUNT commits since last review — spawning reviewer ---"

      if git rev-parse -q --verify refs/tags/last-reviewed >/dev/null; then
        REVIEW_RANGE="last-reviewed..HEAD"
      else
        REVIEW_RANGE="$(git rev-list --max-parents=0 HEAD)..HEAD"
      fi

      REVIEW_PROMPT=$(printf 'You are reviewing a batch of commits in this repository before it is allowed to land.

Run `git diff %s` yourself to see the accumulated diff. You have not been given the implementer'"'"'s reasoning or conversation — only the repo as it stands. Do not assume anything beyond that.

Use README.md'"'"'s routing index to load only the specs relevant to the files touched by that diff, the same context-isolation principle AGENT.md uses for its normal boot sequence. Check the diff against those specs for correctness and scope compliance.

End your output with exactly one of these two lines, as the very last line of your output:
VERDICT: APPROVE
VERDICT: REJECT

If REJECT, list the findings that must be fixed above that line. If APPROVE but you noticed non-blocking nits, list them above that line too — they will be filed for later, not treated as blockers.' "$REVIEW_RANGE")

      claude --dangerously-skip-permissions --model opus -p "$REVIEW_PROMPT" > "$REVIEW_LOG" 2>&1
      REVIEW_OUTPUT=$(cat "$REVIEW_LOG")
      echo "$REVIEW_OUTPUT"

      REVIEW_FINDINGS=$(grep -vE '^VERDICT: (APPROVE|REJECT)[[:space:]]*$' <<< "$REVIEW_OUTPUT" || true)

      if grep -qE '^VERDICT: APPROVE[[:space:]]*$' <<< "$REVIEW_OUTPUT"; then
        echo "--- Review gate: APPROVE ---"
        git tag -f last-reviewed HEAD

        if [[ -n "$(tr -d '[:space:]' <<< "$REVIEW_FINDINGS")" ]]; then
          LAST_BUG=$(grep -oE '^## BUG-[0-9]+' bugs.md 2>/dev/null | grep -oE '[0-9]+' | sort -n | tail -1 || true)
          NEXT_BUG=$(printf 'BUG-%03d' $(( 10#${LAST_BUG:-0} + 1 )))
          {
            echo ""
            echo "---"
            echo ""
            echo "## $NEXT_BUG — Review gate nits ($REVIEW_RANGE)"
            echo ""
            echo "**Files:** see diff range \`$REVIEW_RANGE\`"
            echo ""
            echo "**What the code does:**"
            echo '```'
            echo "$REVIEW_FINDINGS"
            echo '```'
            echo ""
            echo "**What it should do:** Non-blocking — noted by the automated review gate for later cleanup."
          } >> bugs.md
        fi

        echo "=== Loop complete ==="
        exit 0
      else
        if grep -qE '^VERDICT: REJECT[[:space:]]*$' <<< "$REVIEW_OUTPUT"; then
          echo "--- Review gate: REJECT — injecting findings into next prompt ---"
        else
          echo "--- Review gate: no parseable verdict — treating as REJECT ---"
        fi
        INJECT_REVIEW="$REVIEW_FINDINGS"
        # last-reviewed tag does not move; loop continues to the next iteration
      fi
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
