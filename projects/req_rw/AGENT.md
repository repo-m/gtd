# AGENT.md — Operational Rules

Hard guardrails for loop mode. Follow unconditionally.

---

## 1. Boot sequence

Every iteration must begin with this exact order:

1. Read `PROMPT.md`. If it is empty or a placeholder, halt and output: `PROMPT.md has no active task. Stopping.`
2. Load only the spec files listed in `PROMPT.md` under **Specs to load**. Load nothing else.

---

## 2. Context isolation

- Never preemptively load the full spec set.
- If a task touches a boundary between two specs, use the `→` cross-references in `README.md` to identify the minimum additional spec needed.
- `README.md` is a routing index — do not treat it as a spec.
- `00-system-architecture.md` is load-on-demand, not a default preamble.

---

## 3. Iteration protocol

Before exiting each iteration, update `fix_plan.md`:

- Mark completed steps `[x]`.
- Record any partial state or blockers clearly enough that the next iteration can resume without reading history.
- If the task is fully complete, write `STATUS: DONE` on the first line of `fix_plan.md`.

---

## 4. Test gate

The binary completion condition is the gate command in `PROMPT.md`, not self-assessment.

- `loop.sh` runs the gate automatically after every iteration.
- If the gate is **red**: the raw test output is injected as your next prompt. Read it literally — fix every failing assertion before doing anything else.
- If the gate is **green** and `STATUS: DONE`: `loop.sh` commits and exits. You are done.
- Do not write `STATUS: DONE` unless you are confident the gate will pass.
- Do not modify test files to make tests pass — fix the implementation.

### 4a. Review gate (every 5 commits)

After each commit, `loop.sh` counts commits since the `last-reviewed` git tag (or all of `HEAD` if that tag doesn't exist yet). Below 5, nothing changes: the loop prints "Loop complete" and exits as usual.

At 5 or more, `loop.sh` spawns a second, one-shot `claude -p` reviewer before letting the loop finish:

- The reviewer sees only `git diff last-reviewed..HEAD` (or the diff from the repo's root commit, if `last-reviewed` doesn't exist yet) and the repo itself — never the implementer's reasoning or this conversation.
- It uses `README.md`'s routing index to load only the specs relevant to the files the diff touches, the same context-isolation principle as this file's boot sequence (§1–2).
- It ends its output with `VERDICT: APPROVE` or `VERDICT: REJECT` as the last line, with any findings above it.

**REJECT:** `last-reviewed` does not move. The loop does not exit — the reviewer's findings are injected as the next iteration's prompt (parallel to how a red test gate injects `INJECT_FAILURES`), framed explicitly as review feedback so you know to address every finding, not re-run the gate command. The loop keeps iterating (subject to the same `MAX_ITERATIONS` cap as any other failure path) until a later review passes.

**APPROVE:** `git tag -f last-reviewed HEAD` resets the count to 0. Any non-blocking nits the reviewer included get appended to `bugs.md` in the existing entry format (`## BUG-NNN — <title>` etc.); if there were no findings, `bugs.md` is left untouched. The loop then proceeds exactly as the sub-5 case: "Loop complete", exit 0.

---

## 5. Scope discipline

- Implement only what `PROMPT.md` specifies.
- Do not fix adjacent bugs, refactor unrelated code, or add unrequested features.
- If you find an out-of-scope issue, append it to `fix_plan.md` under `## Out-of-scope findings` and leave the code untouched.

---

## 6. Hard stops

Stop and output a clear error message if:

- `PROMPT.md` is ambiguous and you cannot identify a single valid interpretation.
- A spec file listed in `PROMPT.md` does not exist in `specs/`.
- Completing the task requires touching more than 3 spec domains simultaneously — this signals a scope problem in `PROMPT.md`.

---

## 8. Spec frontmatter maintenance

Every spec file in `specs/` carries a YAML frontmatter block with three fields: `updated`, `implemented`, `tested`.

**When you modify a spec file:**
- Set `updated` to today's date in ISO 8601 format (e.g. `2026-06-20`).
- Clear `implemented` and `tested` (empty string).

**When you write `STATUS: DONE`:**
- For each spec listed in PROMPT.md under **Specs to load**, set `implemented` and `tested` to today's date.

---

## 7. Forbidden actions

- Do not modify spec files unless `PROMPT.md` explicitly says to update specs.
- Do not rename or restructure files in `specs/`.
- Do not delete or truncate `fix_plan.md`.
- Do not clear or overwrite `PROMPT.md` — that is the human's responsibility.
- Do not read or load `usul.md` — it is a human-only workflow guide.
- Do not modify test files to force a green gate — fix the implementation.
