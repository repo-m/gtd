# usul.md — How to build Req.rw with the Huntley approach

> This file is for you only. The AI must not load it.

---

## Per-task workflow

- [ ] Decide the next task — one sentence, one responsibility

### 1. Define next step

- [ ] Specify the next task — one sentence, one responsibility
- [ ] Find the relevant spec in `README.md`; update or create it if needed
- [ ] Check if tests cover this task; consult `test_concept.md` and add any that are missing

### 2. Write `PROMPT.md`

- [ ] **Task:** one sentence, single responsibility — this becomes the git commit message
- [ ] **Specs to load:** list only what the task needs (use `→` cross-refs in README to find boundaries)
- [ ] **Acceptance criteria:** 2–5 items, each objectively verifiable
- [ ] **Done when:** one condition — what does "finished" look like exactly?
- [ ] **Gate command:** the shell command that must exit 0 to close this task. Replace with a narrower filter (e.g. `npm test -- --testPathPattern=serialisation`) to speed up the loop on a focused task.
- [ ] **Out of scope:** list anything the agent might be tempted to do but shouldn't

### 3. Reset `fix_plan.md`

- [ ] Set `STATUS: IN PROGRESS` on line 1
- [ ] Add the task steps as empty checkboxes (copy from PROMPT.md acceptance criteria)

### 4. Run the loop

```bash
bash loop.sh
```

The loop runs until gate is green + `STATUS: DONE`. If the agent writes `STATUS: BLOCKED`, the loop halts — check `fix_plan.md` for the blocker. All criteria marked `[x]` auto-promote to `STATUS: DONE`.

**Review gate (every 5 commits), automatic — nothing for you to do here.** After a commit, `loop.sh` counts commits since the `last-reviewed` git tag (or all of `HEAD` if that tag doesn't exist yet). Below 5, the loop finishes as usual. At 5 or more, it spawns a second, fresh-context `claude -p` reviewer over the accumulated diff before letting the loop finish — same context-isolation principle as the agent's own boot sequence, no access to any conversation, just the diff and the repo. Two outcomes:

- **REJECT** — the `last-reviewed` tag doesn't move, and the loop keeps iterating on its own with the reviewer's findings as the next prompt, just like a red test gate. You'll see extra iterations run past what a single `PROMPT.md` task would normally take; that's expected, not stuck. It stops once a later review passes (or `MAX_ITERATIONS` is hit).
- **APPROVE** — the `last-reviewed` tag moves to `HEAD`, resetting the count. Any non-blocking nits the reviewer noticed are appended to `bugs.md` (same entry format as the existing bugs there) instead of blocking you — check `bugs.md` occasionally, since nothing else surfaces them.

You don't drive this step; it just runs as part of `bash loop.sh`. The only thing worth knowing is that `git tag -l last-reviewed` tells you where the last approved batch ended.

### 5. Close the task

- [ ] Clear `PROMPT.md` back to the template (keep the structure, wipe the content)
- [ ] Leave `fix_plan.md` as-is with `STATUS: DONE` (it becomes a log)

---

## Structure

```
req_rw/
  CLAUDE.md       AI boot file — loaded every session
  AGENT.md        Loop rules — hard guardrails for the agent
  PROMPT.md       Your task — you write it, AI reads it
  fix_plan.md     Loop state — AI writes it, you read it
  loop.sh         The runner — agent + gate + auto-commit
  README.md       Spec map — routing index
  usul.md         This file
  test_concept.md Test strategy — layers, tooling, generation order
  specs/          Numbered spec files (the source of truth)
  app/
    src/          Source code
    tests/        Test suite — used as the gate
```