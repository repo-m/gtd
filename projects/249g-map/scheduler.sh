#!/usr/bin/env bash
# scheduler.sh — every-6h unattended orchestrator, fired by launchd
# (~/Library/LaunchAgents/com.249g-map.scheduler.plist) independently of any
# interactive Claude Code session, so the project keeps moving across the
# waits between token resets.
#
# On each fire, in this order:
#   1. loop.sh already running?               -> nothing to do.
#   2. No internet reachable?                 -> log + exit, state untouched,
#                                                 next fire (or you) just retries.
#   3. PROMPT.md still has a real task in it (not the cleared placeholder)?
#      This, not fix_plan.md's STATUS line, is the authoritative "still in
#      flight" signal -- see the inline comment at this check for why.
#        - fix_plan.md says STATUS: BLOCKED -> hard stop (AGENT.md §6).
#          Never auto-resume. Log + exit.
#        - otherwise                        -> resume: bash loop.sh.
#   4. PROMPT.md is the cleared placeholder (loop.sh's own
#      finish_and_queue_for_test did that, which only runs once the gate --
#      and review gate, if due -- actually passed) -> take backlog.md's
#      first entry:
#        - Type: spec-writing -> a `claude -p` pass writes the spec file
#          directly and commits it. No loop.sh run (nothing to gate).
#        - Type: build        -> a `claude -p` pass drafts PROMPT.md and
#          resets fix_plan.md (usul.md steps 2-3), commits those doc changes,
#          then bash loop.sh runs the actual build.
#      Either way the consumed entry is deleted from backlog.md.
#   5. backlog.md has no entries left          -> log + exit, needs a human to
#                                                 queue more work.
#
# Documented in usul.md's "Unattended mode" section — see that file for the
# install/uninstall commands and the plist source of truth
# (com.249g-map.scheduler.plist, tracked here in the repo root).
#
# Never invents scope: the drafting pass is told explicitly to transcribe the
# backlog entry, not to decide what to build next.

set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

LOG_DIR="$PROJECT_DIR/.scheduler"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/scheduler.log"

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG_FILE"; }

CLAUDE_BIN="$(command -v claude || echo /Users/hm13/.local/bin/claude)"
export PATH="/usr/local/bin:/opt/homebrew/bin:$(dirname "$CLAUDE_BIN"):$PATH"

log "--- scheduler.sh fired ---"

# --- 1. Already running? ---
if pgrep -f "[l]oop\.sh" >/dev/null; then
  log "loop.sh already running — nothing to do."
  exit 0
fi

# --- No internet (offline Mac, no wifi, etc)? Don't burn a cycle finding
# that out via a failed `claude` call with a confusing error. State is
# untouched either way, so the next fire (or you, when back online) just
# tries again. ---
if ! curl -fsS --max-time 8 -o /dev/null https://api.anthropic.com 2>/dev/null; then
  log "No internet reachable (api.anthropic.com unreachable) — skipping this fire, will retry next interval."
  exit 0
fi

# --- 2. Is there an active task? PROMPT.md still holding real content (not
# the cleared placeholder) is the authoritative signal -- NOT fix_plan.md's
# STATUS line. STATUS: DONE only means the agent believes it's finished;
# it can be sitting there DONE with nothing committed if loop.sh's own gate
# check never got to run or finish (died mid-run for an environmental
# reason -- session/token limit, no device, disk full -- exactly the kind
# of thing this scheduler exists to retry). The only thing that reliably
# means "fully finished, safe to move on" is PROMPT.md being cleared, which
# only happens inside loop.sh's finish_and_queue_for_test, which only runs
# after the gate (and review gate, if due) actually passed. ---
STATUS_LINE=$(head -n1 fix_plan.md 2>/dev/null || true)

if grep -qE "^[^#<[:space:]]" PROMPT.md 2>/dev/null; then
  if [[ "$STATUS_LINE" == "STATUS: BLOCKED"* ]]; then
    log "fix_plan.md is BLOCKED — hard stop per AGENT.md §6. Not auto-resuming; resolve by hand."
    exit 0
  fi
  log "Active task still in PROMPT.md (fix_plan.md: ${STATUS_LINE:-no STATUS line}) — resuming: bash loop.sh."
  nohup bash loop.sh >> "$LOG_DIR/loop_output.log" 2>&1 &
  log "loop.sh restarted, pid $!."
  exit 0
fi

# --- 3. PROMPT.md is the cleared placeholder — pull the next backlog item ---
if ! grep -qE '^## [0-9]+\.' backlog.md 2>/dev/null; then
  log "backlog.md has no queued entries — needs a human to add more work. Exiting."
  exit 0
fi

log "Last task DONE (or no task yet). Preparing next backlog item via claude -p."

PREP_PROMPT_FILE="$LOG_DIR/prep_prompt.txt"
cat > "$PREP_PROMPT_FILE" <<'EOF'
You are running unattended, fired by a scheduler — there is no human in this
session to discuss the task with. Do the file-prep steps usul.md normally
splits across a human conversation, non-interactively:

1. Read backlog.md. Take its FIRST numbered entry only (## 1. ...). Do not
   invent scope beyond what that entry says; transcribe/expand it, don't
   redesign it.

2. `loop.sh` clears PROMPT.md back to its own template itself once a task
   fully completes (see the placeholder literal in loop.sh's
   finish_and_queue_for_test function), so it should already look like
   that. If it somehow doesn't (edge case, not the normal path), clear it
   to match that same template before drafting the new one.

3. Branch on the entry's Type:

   - Type: spec-writing
       Write the spec file it names, under specs/, following the structure
       and frontmatter convention (`updated`/`implemented`/`tested`) used by
       specs/00-system-architecture.md and README.md's "Spec frontmatter
       convention" section. Set `updated` to today, leave
       `implemented`/`tested` blank. Base it on SETUP.md's resolved
       decisions and the relevant Job description in README.md. Update
       README.md's entry for that spec file from "(planned)" to a real
       description if the file's own header changes what it covers.
       Leave PROMPT.md as the cleared placeholder (no loop.sh run needed —
       there's no gate for prose).
       Delete the consumed entry from backlog.md.
       git add -A && git commit for this spec file + backlog.md + any
       README.md update.
       End your output with exactly: SCHEDULER_RESULT: SPEC_WRITTEN

   - Type: build
       Confirm the spec(s) it depends on exist under specs/ (its "Depends
       on" note, if any). If a required spec is missing, do NOT invent one
       or guess scope — leave PROMPT.md as the cleared placeholder, leave
       the backlog entry in place, and end your output with exactly:
       SCHEDULER_RESULT: BLOCKED_MISSING_SPEC
       Otherwise, draft a new PROMPT.md per usul.md step 2's template
       (Task / Specs to load / Acceptance criteria / Done when / Gate
       command / Out of scope), scoped tightly to this one backlog entry.
       Reset fix_plan.md per usul.md step 3: `STATUS: IN PROGRESS` on line
       1, empty checkboxes copied from the acceptance criteria.
       Delete the consumed entry from backlog.md.
       git add -A && git commit for PROMPT.md + fix_plan.md + backlog.md.
       End your output with exactly: SCHEDULER_RESULT: PROMPT_DRAFTED

Follow every other constraint in AGENT.md and usul.md that still applies
(don't rename/restructure specs/, don't touch app/ code in this pass).
EOF

PREP_LOG="$LOG_DIR/prep_$(date '+%Y%m%d_%H%M%S').log"
"$CLAUDE_BIN" --dangerously-skip-permissions --model opus -p "$(cat "$PREP_PROMPT_FILE")" > "$PREP_LOG" 2>&1

if grep -q "SCHEDULER_RESULT: PROMPT_DRAFTED" "$PREP_LOG"; then
  log "PROMPT.md drafted for next build task — starting loop.sh."
  nohup bash loop.sh >> "$LOG_DIR/loop_output.log" 2>&1 &
  log "loop.sh started, pid $!."
elif grep -q "SCHEDULER_RESULT: SPEC_WRITTEN" "$PREP_LOG"; then
  log "Spec file written and committed directly (no gate to run). Will pick up the next backlog entry next fire."
elif grep -q "SCHEDULER_RESULT: BLOCKED_MISSING_SPEC" "$PREP_LOG"; then
  log "Next backlog entry's dependency spec is missing — left queued, needs a human look. See $PREP_LOG."
else
  log "Prep pass ended without a recognized SCHEDULER_RESULT line — needs a human look. See $PREP_LOG."
fi
