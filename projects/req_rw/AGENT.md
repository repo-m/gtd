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

## 7. Forbidden actions

- Do not modify spec files unless `PROMPT.md` explicitly says to update specs.
- Do not rename or restructure files in `specs/`.
- Do not delete or truncate `fix_plan.md`.
- Do not clear or overwrite `PROMPT.md` — that is the human's responsibility.
- Do not read or load `usul.md` — it is a human-only workflow guide.
- Do not modify test files to force a green gate — fix the implementation.
