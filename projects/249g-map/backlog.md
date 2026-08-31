# Backlog

Queued multi-iteration efforts, in build order. Normally a human copies the topmost item into `PROMPT.md` per iteration (`usul.md` steps 1-3); `scheduler.sh` now also draws from here unattended (see `AGENT.md`-adjacent `scheduler.sh` at the repo root) — it always takes the **first** entry, drafts `PROMPT.md`/`fix_plan.md` from it, and deletes the entry once drafted. Keep entries self-contained enough for that: one task, the spec(s) it needs, and any notes an unattended drafting pass should know.

Each entry is either a **spec-writing** task (produces a `specs/NN-*.md` file, no code) or a **build** task (implements against an already-written spec). Per `README.md`'s Job list, a spec must exist before its build task is queued behind it.

---

## 1. Write `specs/10-flight-zone-data.md`

**Type:** spec-writing
**Job:** View flight zones
**Notes:** Define the FAA UASFM (LAANC altitude grid) + TFR/NOTAM fetch, the Irvine+100km bbox query, and the DTO → `FlightZone`/`ZoneInfo` mapping, per `SETUP.md`'s resolved data-source decision and `00-system-architecture.md`'s repository boundary. Cover the malformed/partial-response and one-feed-fails behavior already anticipated in `test_concept.md` Layer 2.

## 2. Implement the flight-zone data layer

**Type:** build
**Job:** View flight zones
**Depends on:** #1 (`specs/10-flight-zone-data.md` must exist)
**Notes:** `NetworkZoneRepository`, DTOs, and the UASFM+TFR merge, with `test_concept.md` Layer 1 (`BboxTest.kt`) and Layer 2 (`NetworkZoneRepositoryTest.kt`) coverage. No UI in this task.

## 3. Write `specs/20-map-view.md`

**Type:** spec-writing
**Job:** View flight zones
**Notes:** `MapScreen`, `ZoneOverlay` rendering (grid cells + TFR polygons), legend/coloring. First task that pulls in the Google Maps Compose dependency named in `00-system-architecture.md`.

## 4. Implement the map view

**Type:** build
**Job:** View flight zones
**Depends on:** #3 (`specs/20-map-view.md` must exist)
**Notes:** Renders `FlightZone` list from the repository (#2) on the map. Layer 4 instrumented test: `ZoneOverlayTest.kt`.

## 5. Write `specs/21-location.md`

**Type:** spec-writing
**Job:** Locate myself on the map
**Notes:** Location permission flow, `DeviceLocationProvider`, recenter button, bbox-center fallback on denial.

## 6. Implement location

**Type:** build
**Job:** Locate myself on the map
**Depends on:** #5
**Notes:** Layer 4 instrumented test: `LocationPermissionFlowTest.kt` (grant + deny paths, per `test_concept.md`).

## 7. Write `specs/22-zone-query.md`

**Type:** spec-writing
**Job:** Check a specific location
**Notes:** Tap-to-query interaction, `ZoneLookup`, `ZoneQuerySheet` result display.

## 8. Implement tap-to-query

**Type:** build
**Job:** Check a specific location
**Depends on:** #7
**Notes:** `ZoneLookupTest.kt` (Layer 1, write before the implementation per `test_concept.md`'s TDD ordering) and `ZoneQuerySheetTest.kt` (Layer 4).

---

## Future (not v1 — do not pull these into `PROMPT.md` until the items above are done)

- Offline caching of zone data (architecture already leaves room for this — see `00-system-architecture.md`'s repository boundary note).
- EU regulatory data source and coverage.
- User-adjustable area (beyond the fixed Irvine+100km bbox).
