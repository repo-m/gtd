# 249g-map — Claude Code Project File

Spec-driven repo, same approach as Req.rw. No app code yet — resolve `SETUP.md` first.

## Operational rules

Read `AGENT.md` before doing any work. It defines boot sequence, context isolation, iteration protocol, and hard constraints.

A launchd job runs `scheduler.sh` every 6h to keep the loop moving across token-reset waits unattended — see `usul.md`'s "Unattended mode" section.

## What 249g-map is

A mobile app showing allowed flight zones for sub-250g ("249g") drones, scoped to US + EU regulations. Platform, data source, and test-gate definition are open — see `SETUP.md`.

## Spec system layout

```
SETUP.md        Open decisions to resolve first
README.md       Spec map — routing index (skeleton until SETUP.md resolved)
PROMPT.md       Active task directive
AGENT.md        Hard operational guardrails
fix_plan.md     Mutable state: progress, blockers, next step
test_concept.md Test strategy
backlog.md      Queued multi-iteration efforts
bugs.md         Review-gate findings log
specs/          Numbered spec files (empty until SETUP.md resolved)
```
