# AGENT.md — Operational Rules

Hard guardrails for loop mode. Follow unconditionally. (Carried over from Req.rw's AGENT.md — unchanged, it worked.)

---

## 1. Boot sequence

1. Read `PROMPT.md`. If empty/placeholder, halt: `PROMPT.md has no active task. Stopping.`
2. Load only the spec files listed in `PROMPT.md` under **Specs to load**. Load nothing else.

## 2. Context isolation

- Never preemptively load the full spec set.
- Cross a spec boundary only via the `→` refs in `README.md`.
- `README.md` is a routing index, not a spec.
- `00-system-architecture.md` is load-on-demand.

## 3. Iteration protocol

Before exiting each iteration, update `fix_plan.md`:
- Mark completed steps `[x]`.
- Record partial state/blockers clearly enough for a cold-start resume.
- If fully complete, write `STATUS: DONE` on line 1.

## 4. Test gate

Binary completion condition is the gate command in `PROMPT.md`, not self-assessment.
- `loop.sh` runs it after every iteration.
- Red gate: raw output injected as next prompt. Fix every failure first.
- Green gate + `STATUS: DONE`: `loop.sh` commits and exits.
- Never write `STATUS: DONE` unless confident the gate passes.
- Never modify tests to force green — fix the implementation.

### 4a. Review gate (every 5 commits)

Same mechanism as Req.rw: a fresh one-shot `claude -p` reviewer sees only `git diff last-reviewed..HEAD` + the repo, never this conversation. Ends with `VERDICT: APPROVE` or `VERDICT: REJECT`.
- REJECT: `last-reviewed` doesn't move; findings injected as next prompt.
- APPROVE: tag moves to `HEAD`; non-blocking nits appended to `bugs.md`.

## 5. Scope discipline

- Implement only what `PROMPT.md` specifies.
- No adjacent fixes, refactors, or unrequested features.
- Out-of-scope findings go under `fix_plan.md`'s `## Out-of-scope findings`, code untouched.

## 6. Hard stops

Stop with a clear error if:
- `PROMPT.md` is ambiguous.
- A spec file listed in `PROMPT.md` doesn't exist in `specs/`.
- The task touches more than 3 spec domains at once (signals a `PROMPT.md` scope problem).
- The task requires a real device/emulator run and none is configured — say so instead of guessing at pass/fail. *(New vs. Req.rw: mobile has a hardware layer web/desktop didn't.)*
- The task touches flight-zone/airspace data logic and no source-of-truth for that data is named in the spec — do not invent or approximate regulatory data. *(New: correctness here is a safety property, not a UX nit.)*

## 7. Forbidden actions

- Don't modify spec files unless `PROMPT.md` explicitly says to.
- Don't rename/restructure `specs/`.
- Don't delete or truncate `fix_plan.md`.
- Don't clear/overwrite `PROMPT.md` yourself, ever — including once you've written `STATUS: DONE`. Clearing it back to the placeholder is automatic (`loop.sh` does it once the gate is green and, if due, the review gate has approved), not something you do mid-task.
- Don't modify test files to force a green gate.

## 8. Spec frontmatter maintenance

Every spec file carries `updated` / `implemented` / `tested` (ISO 8601) frontmatter.
- On spec edit: set `updated` to today, clear `implemented`/`tested`.
- On `STATUS: DONE`: set `implemented`/`tested` to today for every spec listed in `PROMPT.md`.
