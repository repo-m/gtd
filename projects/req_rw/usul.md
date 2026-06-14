# usul.md — How to build Req.rw with the Huntley approach

> This file is for you only. The AI must not load it.

---

## What lives where

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
  src/            Source code — created by the loop over time
  tests/          Test suite — generated from specs, used as the gate
```

---

## One-time setup

- [x] Confirm `claude` CLI is installed and authenticated (`claude --version`)
- [x] Confirm `loop.sh` is executable (`chmod +x loop.sh`)
- [ ] Read `README.md` once end-to-end so you know the spec map
- [x] Confirm `npm test` is wired in `package.json` (Jest)
- [x] Confirm `python -m pytest tests/` works (pytest in `pyproject.toml` or `uv`)
- [ ] Read `test_concept.md` — understand the test layers and generation order

---

## Per-task workflow

### 1. Pick a task

- [ ] Open `README.md` — find the JTBD group relevant to what you want to build
- [ ] Choose one spec file as the primary target
- [ ] Confirm the task fits one sentence without the word "and"

### 2. Write `PROMPT.md`

- [ ] **Task:** one sentence, single responsibility
- [ ] **Specs to load:** list only what the task needs (use `→` cross-refs in README to find boundaries)
- [ ] **Acceptance criteria:** 2–5 items, each objectively verifiable
- [ ] **Done when:** one condition — what does "finished" look like exactly?
- [ ] **Gate command:** the shell command that must exit 0 to close this task (e.g. `npm test -- --testPathPattern=serialisation`). Omit to use the full default gate.
- [ ] **Out of scope:** list anything the agent might be tempted to do but shouldn't

### 3. Reset `fix_plan.md`

- [ ] Delete previous content
- [ ] Set `STATUS: IN PROGRESS` on line 1
- [ ] Add the task steps as empty checkboxes (copy from PROMPT.md acceptance criteria)

### 4. Run the loop

```bash
bash loop.sh
```

The loop now runs the gate command automatically after every agent iteration:

- **Gate red** → test output is injected into the agent's next prompt; loop continues
- **Gate green + STATUS: DONE** → loop auto-commits and exits cleanly
- **STATUS: BLOCKED** → loop halts; resolve manually then re-run

You do not need to watch the output closely. Come back when it exits.

### 5. Review the output

- [ ] Read the auto-commit message — confirm it describes the right change
- [ ] Read `fix_plan.md` — confirm all steps are checked
- [ ] Optional: run the app and smoke-test the specific feature (`uv run src/backend/req.py --dev` or `npm run web`)

Manual testing is no longer the gate — the test suite is. Only smoke-test if you want confidence beyond what the tests cover.

### 6. Close the task

- [ ] Clear `PROMPT.md` back to the template (keep the structure, wipe the content)
- [ ] Leave `fix_plan.md` as-is with `STATUS: DONE` (it becomes a log)
- [ ] Go back to step 1

---

## Handling a blocker

- [ ] Read `fix_plan.md` — find the blocker description
- [ ] Resolve it yourself (missing file, ambiguous spec, wrong assumption)
- [ ] If the spec is wrong or incomplete → update the spec file first (see below)
- [ ] Update `PROMPT.md` if the task scope needs adjusting
- [ ] Set `fix_plan.md` STATUS back to `IN PROGRESS`
- [ ] Run `bash loop.sh` again

---

## When to update a spec vs just implement

| Situation | Action |
|-----------|--------|
| Implementation detail not mentioned in spec | Implement — no spec update needed |
| Spec says X but X is clearly wrong | Update spec first, then implement |
| Discovered a missing feature | Write a new PROMPT.md for it later — finish current task first |
| Two specs contradict each other | Resolve in specs first, then implement |

---

## Writing a good PROMPT.md — quick rules

- **One sentence test:** read the task aloud. If you need "and" to describe it, split it.
- **Minimum specs:** load only what the task touches. Use `→` in README to spot boundaries.
- **Concrete criteria:** "the file saves to disk" ✓ — "it works correctly" ✗
- **Explicit exclusions:** anything adjacent the agent might reasonably touch — name it as out of scope.
- **Gate command:** scope it to only the tests relevant to this task. A narrow gate (`--testPathPattern=X`) is faster and gives cleaner failure output than the full suite.

---

## Test bootstrap (first time only)

Before the gate can work, the test infrastructure must exist. Follow the generation order in `test_concept.md`:

1. Write a PROMPT.md for "generate test fixtures" with gate command `tsc --noEmit`
2. Work through each layer in order — each loop task generates one test file
3. After all test files exist, the default gate (`npm test && python -m pytest tests/`) becomes the standard
