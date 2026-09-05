#!/usr/bin/env bash
# prompt_state.sh — single source of truth for PROMPT.md's placeholder template
# and for every "what state is PROMPT.md in?" question.
#
# Sourced by loop.sh and scheduler.sh; not executable on its own.
#
# Why this file exists: loop.sh and scheduler.sh each carried their own copy of
# an "is PROMPT.md still a real task?" regex (`grep -qE "^[^#<[:space:]]"`),
# while the template those regexes had to recognize lived in a third place
# (loop.sh's heredoc). They drifted. The template grew two bare ``` fence lines,
# a backtick is not #/</whitespace, so a freshly cleared PROMPT.md read as an
# *active task* at both sites: scheduler.sh re-launched loop.sh forever instead
# of pulling the next backlog.md entry, and loop.sh accepted the template and
# ran iterations against a gate it had extracted from an HTML comment.
#
# So: one template, one set of readers, and test_prompt_state.sh asserts the
# readers agree with the template. Both scripts run that test at startup, so the
# three can never drift apart silently again.

# The literal PROMPT.md placeholder. loop.sh's finish_and_queue_for_test writes
# exactly this — and nothing else may hold a second copy of it.
prompt_placeholder_template() {
  cat <<'PLACEHOLDER'
<!-- Template — filled in per usul.md §2, cleared back to this after each task closes. -->

# Task

<!-- One sentence, single responsibility. Becomes the commit message. -->

## Specs to load

<!-- Minimum needed — use README.md's → cross-refs to find the boundary. -->

## Acceptance criteria

<!-- 2–5 objectively verifiable items. -->

## Done when

<!-- One condition. -->

## Gate command

```
<!-- Shell command that must exit 0 to close this task. -->
```

## Out of scope

<!-- What the agent might be tempted to do but shouldn't. -->
PLACEHOLDER
}

# The task's one-sentence title: the first line under `# Task`, before the next
# `##` section, that is not blank, a heading, or an HTML comment. The placeholder
# has only a comment there, so this comes back empty for a cleared PROMPT.md.
# Doubles as the commit message (usul.md §2).
prompt_task_title() {
  awk '
    /^# Task/                 { in_task = 1; next }
    in_task && /^## /         { exit }
    in_task && NF && !/^[#<]/ { print; exit }
  ' "$1"
}

# True when PROMPT.md holds a real task rather than the cleared placeholder.
# Deliberately keyed on the task body, not on "any line that looks like prose":
# the template is mostly comments and fences, and the fences are what broke the
# old regex.
prompt_has_active_task() {
  [[ -n "$(prompt_task_title "$1")" ]]
}

# The gate command: the first line under `## Gate command`, before the next `##`
# section, ignoring blanks, ``` fences, headings and HTML comments. A
# commented-out gate — which is all the placeholder has — is an *absent* gate,
# not a command to run.
prompt_gate_cmd() {
  awk '
    /^## Gate command/           { in_gate = 1; next }
    in_gate && /^## /            { exit }
    in_gate && NF && !/^[#`<]/   { gsub(/^`+|`+$/, ""); print; exit }
  ' "$1"
}
