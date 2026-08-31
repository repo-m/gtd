# usul.md — How to build 249g-map with the Huntley approach

> Shared workflow guide — read by both the human and the agent.

Carried over from Req.rw's `usul.md` — that loop worked with no major complaints. Same three-step outer loop, same review-gate/bugs.md cycle. Only additions are marked **(new)**.

---

## Per-task workflow

**(new)** Split into two modes: an interactive discussion session (you + agent, conversational), then an unattended loop run (agent alone, via `loop.sh`). Steps 1–3 happen in the discussion session — or are skipped entirely when `scheduler.sh` drafts a task from `backlog.md` unattended. Step 4 happens after you say go and now finishes fully on its own, no manual step required to close it out. Step 5 (manual testing) is deliberately **decoupled** from all of that — see below.

### 1. Discuss the next step (interactive session)

- [ ] Talk through what the next feature/task should be with the agent — not a solo checklist, a conversation
- [ ] Land on: the task (one sentence, one responsibility), which spec(s) in `README.md` it touches (update them if needed), and what `test_concept.md` coverage it needs
- [ ] If the task touches flight-zone data, confirm the spec names an actual data source — not "TBD"

### 2. Agent writes `PROMPT.md`

Output of the discussion, produced by the agent, not filled in by hand:

- [ ] **Task:** one sentence, single responsibility → becomes the commit message
- [ ] **Specs to load:** minimum needed, via README `→` cross-refs
- [ ] **Acceptance criteria:** 2–5 objectively verifiable items
- [ ] **Done when:** one condition
- [ ] **Gate command:** must exit 0 to close the task
- [ ] **Out of scope:** what the agent might be tempted to do but shouldn't

### 3. Agent resets `fix_plan.md`

- [ ] `STATUS: IN PROGRESS` on line 1
- [ ] Task steps as empty checkboxes (copy from acceptance criteria)

### 4. Run the loop (unattended)

```bash
bash loop.sh
```

Runs until gate green + `STATUS: DONE` (and, if a review is due, the review gate approves), or `STATUS: BLOCKED` halts it for a human. Review gate (every 5 commits) is automatic — nothing to do, check `git tag -l last-reviewed` and `bugs.md` occasionally.

On success, `loop.sh` **finishes the task completely on its own**: it clears `PROMPT.md` back to the placeholder and appends the task (title, specs touched, acceptance criteria) to `test_queue.md`, in its own commit. Nothing is left for a human to do before the next task can start — that's what makes batching work. Fill `backlog.md` with several items, then either re-run `bash loop.sh` yourself for each one in turn, or let `scheduler.sh` chain straight through all of them unattended (see "Unattended mode" below). Manual testing never blocks this — see step 5.

### 5. Manual testing — decoupled, whenever you have time

Not tied to any single task finishing, and not a gate on anything. Work through `test_queue.md` at your own pace, in whatever order:

- [ ] Run the app on a real device or emulator and check the entry's acceptance criteria — the automated gate can't fully substitute for this on mobile.
- [ ] Works as expected → delete the entry from `test_queue.md`.
- [ ] Doesn't → file it in `bugs.md`, delete the entry from `test_queue.md`, and if it needs a dedicated fix, queue one in `backlog.md`.

Then go fill more of `backlog.md`, or spend a cycle on `bugs.md` per the cycle below.

---

## Bug cycle (unchanged from Req.rw)

Two mechanisms feed `bugs.md`:

- **Automatic review gate** (`AGENT.md` §4a) — every 5 commits, a fresh-context reviewer checks the diff against specs. REJECT blocks the loop until fixed; APPROVE moves `last-reviewed` and files non-blocking nits into `bugs.md`. Nothing for you to trigger — happens inside `loop.sh`.
- **Manual bug cycle** — periodically (human-triggered, no fixed interval), review the code against specs yourself, let the agent build/update `bugs.md` for anything the review gate wouldn't catch, then spend loop iterations closing entries — same pattern as Req.rw's `BUG-NNN` commits.

---

## Unattended mode: `scheduler.sh` + launchd

Token limits mean the interactive loop has to sit idle waiting for a reset. `scheduler.sh` (repo root) covers those gaps: a launchd job fires it every 6h, independent of any Claude Code session, and it either resumes a paused `loop.sh` or — once the current task is `STATUS: DONE` (which, per step 4 above, `loop.sh` reaches and cleans up after fully on its own, never waiting on manual testing) — drafts `PROMPT.md`/`fix_plan.md` from `backlog.md`'s next entry and starts a fresh `loop.sh` run. This is exactly what lets a `backlog.md` filled with 10 items get chained straight through unattended while `test_queue.md` piles up behind it for you to work through separately. Full decision logic is in `scheduler.sh`'s own header comment; it never invents scope, never auto-resumes a `STATUS: BLOCKED` loop (that's AGENT.md §6's hard stop — needs a human), and skips the cycle cleanly if the Mac has no internet.

`com.249g-map.scheduler.plist` (repo root) is the source of truth for the launchd job. To (re)install after editing it:

```bash
cp com.249g-map.scheduler.plist ~/Library/LaunchAgents/
launchctl unload ~/Library/LaunchAgents/com.249g-map.scheduler.plist 2>/dev/null
launchctl load ~/Library/LaunchAgents/com.249g-map.scheduler.plist
launchctl list | grep 249g-map   # confirm it's loaded
```

To remove it: `launchctl unload ~/Library/LaunchAgents/com.249g-map.scheduler.plist && rm ~/Library/LaunchAgents/com.249g-map.scheduler.plist`.

Logs land in `.scheduler/` (gitignored — `scheduler.log` for its own decisions, `loop_output.log`/`prep_*.log` for what it kicked off, `launchd.{out,err}.log` for launchd itself). `tail -f .scheduler/scheduler.log` to watch it live.

Currently loop iterations and the review gate both run on `--model opus` (set in `loop.sh`); `scheduler.sh`'s own drafting pass does too.

---

## Before any of this: `SETUP.md`

Req.rw never needed a separate setup phase — stack and data model were already decided. This project does not have that yet (platform, flight-zone data source, and gate definition are all still open). Resolve `SETUP.md`'s checklist first; it feeds directly into `README.md`'s Job list and `specs/00-system-architecture.md`.

---

## Structure

```
249g-map/
  CLAUDE.md       AI boot file
  AGENT.md        Loop rules — hard guardrails
  SETUP.md        Open decisions to resolve before specs/ can be written
  PROMPT.md       Your task
  fix_plan.md     Loop state
  loop.sh         The runner
  scheduler.sh    Unattended launchd-fired orchestrator (see "Unattended mode" above)
  com.249g-map.scheduler.plist  launchd job source of truth for scheduler.sh
  README.md       Spec map — routing index
  usul.md         This file
  test_concept.md Test strategy
  backlog.md      Queued multi-iteration efforts
  test_queue.md   Finished tasks awaiting manual test — decoupled, see step 5 above
  bugs.md         Review-gate findings log
  specs/          Numbered spec files
  app/            Source + tests (once SETUP.md is resolved)
```
