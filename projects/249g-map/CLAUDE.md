# ⛔ PROJECT ENDED — 2026-09-05

**This project is discontinued. Do not continue work on it, and do not resume the unattended loop.**

**Reason:** the architecture's map rendering choice — Google Maps SDK for Android, see
`specs/00-system-architecture.md` §"Map rendering" — requires a Google Maps API key, and Google
requires a billing account on the Cloud project to issue one. The owner chose not to take on that
cost. The map view is the core of the app, so it cannot be built as specified.

**State at end:** the flight-zone data layer (FAA UASFM altitude grid + TFR advisory feeds) is built
and tested — 15 unit tests green. There is no UI beyond an empty Compose scaffold. Everything else
in `backlog.md` is unstarted.

**Scheduler:** the launchd job (`com.249g-map.scheduler`) that advanced the loop unattended every 6h
was unloaded on 2026-09-05. Its plist still sits at `~/Library/LaunchAgents/com.249g-map.scheduler.plist`,
so it will load again at next login unless that file is removed.

---

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
