# Manual Test Queue

Decoupled from the build loop on purpose: `loop.sh` appends here automatically the moment a task's gate goes green and it's reviewed — it does not wait for you. That means the loop (whether driven by hand or by `scheduler.sh`) can chain straight through everything queued in `backlog.md` without pausing for manual QA between tasks.

Work through this at your own pace, in any order. For each entry:

- **Works as expected:** delete the entry. Git history + `bugs.md`'s review-gate nits are the record; this file is just the live to-do queue, same pattern as `backlog.md`.
- **Found a problem:** file it in `bugs.md` (format there), then delete the entry here. If it needs a dedicated fix task, add one to `backlog.md` too.

Entries are appended in completion order (oldest first).
