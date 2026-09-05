#!/usr/bin/env bash
# test_prompt_state.sh — self-check for prompt_state.sh.
#
# Run by loop.sh and scheduler.sh at startup (and standalone: `bash
# test_prompt_state.sh`). It exercises the *literal* placeholder template
# against the readers that have to recognize it, so the template and the
# "is this a cleared prompt?" logic cannot drift apart again — which is exactly
# how the earlier bug got in: a fence line added to the template silently made
# every cleared PROMPT.md read as an active task.
set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
source ./prompt_state.sh

failures=0
pass() { printf '  ok   %s\n' "$1"; }
fail() { printf '  FAIL %s\n' "$1" >&2; failures=$((failures + 1)); }

check_eq() { # check_eq <label> <expected> <actual>
  if [[ "$2" == "$3" ]]; then pass "$1"; else
    fail "$1"
    printf '       expected: %q\n       actual:   %q\n' "$2" "$3" >&2
  fi
}

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# --- The cleared placeholder, verbatim, must read as "no task here" ---
prompt_placeholder_template > "$TMP/placeholder.md"

if prompt_has_active_task "$TMP/placeholder.md"; then
  fail "placeholder is NOT an active task"
else
  pass "placeholder is NOT an active task"
fi
check_eq "placeholder has no task title" "" "$(prompt_task_title "$TMP/placeholder.md")"
check_eq "placeholder has no gate command" "" "$(prompt_gate_cmd "$TMP/placeholder.md")"

# --- A real filled-in prompt must read as an active task with its gate ---
cat > "$TMP/real.md" <<'REAL'
# Task

Implement the flight-zone data layer: fetch and map both FAA feeds.

## Specs to load

- `specs/10-flight-zone-data.md`

## Done when

The gate exits 0.

## Gate command

```
./gradlew test connectedAndroidTest
```

## Out of scope

- Any UI.
REAL

if prompt_has_active_task "$TMP/real.md"; then
  pass "filled-in prompt IS an active task"
else
  fail "filled-in prompt IS an active task"
fi
check_eq "task title extracted" \
  "Implement the flight-zone data layer: fetch and map both FAA feeds." \
  "$(prompt_task_title "$TMP/real.md")"
check_eq "gate command extracted, fences and backticks stripped" \
  "./gradlew test connectedAndroidTest" \
  "$(prompt_gate_cmd "$TMP/real.md")"

# --- A half-filled prompt (task written, gate still commented out) must not
# hand back the HTML comment as a runnable command. ---
cat > "$TMP/nogate.md" <<'NOGATE'
# Task

Do the thing.

## Gate command

```
<!-- Shell command that must exit 0 to close this task. -->
```
NOGATE
check_eq "commented-out gate reads as absent" "" "$(prompt_gate_cmd "$TMP/nogate.md")"

# --- The template must have exactly one home: loop.sh writes it by calling the
# shared function, and neither script may keep a private copy of the literal or
# of the old emptiness regex. ---
for script in loop.sh scheduler.sh; do
  if grep -q 'prompt_state\.sh' "$script"; then
    pass "$script sources prompt_state.sh"
  else
    fail "$script sources prompt_state.sh"
  fi
  if grep -q '\^\[\^#<\[:space:\]\]' "$script"; then
    fail "$script no longer uses the old placeholder regex"
  else
    pass "$script no longer uses the old placeholder regex"
  fi
done

if grep -q "<<'PLACEHOLDER'" loop.sh; then
  fail "loop.sh holds no second copy of the placeholder template"
else
  pass "loop.sh holds no second copy of the placeholder template"
fi

if grep -q 'prompt_placeholder_template' loop.sh; then
  pass "loop.sh writes PROMPT.md from the shared template"
else
  fail "loop.sh writes PROMPT.md from the shared template"
fi

if (( failures > 0 )); then
  echo "prompt_state self-check: $failures failure(s)." >&2
  exit 1
fi
echo "prompt_state self-check: all checks passed."
