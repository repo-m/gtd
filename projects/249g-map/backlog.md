# Backlog

Queued multi-iteration efforts, in build order. Normally a human copies the topmost item into `PROMPT.md` per iteration (`usul.md` steps 1-3); `scheduler.sh` now also draws from here unattended (see `AGENT.md`-adjacent `scheduler.sh` at the repo root) — it always takes the **first** entry, drafts `PROMPT.md`/`fix_plan.md` from it, and deletes the entry once drafted. Keep entries self-contained enough for that: one task, the spec(s) it needs, and any notes an unattended drafting pass should know.

Each entry is either a **spec-writing** task (produces a `specs/NN-*.md` file, no code) or a **build** task (implements against an already-written spec). Per `README.md`'s Job list, a spec must exist before its build task is queued behind it.

---

## 1. Implement the flight-zone data layer

**Type:** build
**Job:** View flight zones
**Depends on:** `specs/10-flight-zone-data.md` (written)
**Notes:** `NetworkZoneRepository` (UASFM → `FlightZone`, paginated per the spec) and `NetworkTfrAdvisoryRepository` (TFR text feed → `TfrAdvisory`, `state == "CA"` filter) — two independent repositories, not a merge. `test_concept.md` Layer 1 (`BboxTest.kt`) and Layer 2 (`NetworkZoneRepositoryTest.kt`, plus a TFR-advisory-repository equivalent) coverage. No UI in this task.

## 2. Write `specs/20-map-view.md`

**Type:** spec-writing
**Job:** View flight zones
**Notes:** `MapScreen`, `ZoneOverlay` rendering (UASFM grid cells only — no TFR polygons, see `00-system-architecture.md`'s TFR data-precision note), `TfrAdvisoryList` (plain-text panel, not map geometry), legend/coloring. First task that pulls in the Google Maps Compose dependency named in `00-system-architecture.md`.

## 3. Implement the map view

**Type:** build
**Job:** View flight zones
**Depends on:** #2 (`specs/20-map-view.md` must exist)
**Notes:** Renders `FlightZone` list from the repository (#1) on the map, and `TfrAdvisory` list in `TfrAdvisoryList`. Layer 4 instrumented test: `ZoneOverlayTest.kt`.

## 4. Write `specs/21-location.md`

**Type:** spec-writing
**Job:** Locate myself on the map
**Notes:** Location permission flow, `DeviceLocationProvider`, recenter button, bbox-center fallback on denial.

## 5. Implement location

**Type:** build
**Job:** Locate myself on the map
**Depends on:** #4
**Notes:** Layer 4 instrumented test: `LocationPermissionFlowTest.kt` (grant + deny paths, per `test_concept.md`).

## 6. Write `specs/22-zone-query.md`

**Type:** spec-writing
**Job:** Check a specific location
**Notes:** Tap-to-query interaction, `ZoneLookup` (UASFM grid only — never TFRs, per `00-system-architecture.md`), `ZoneQuerySheet` result display.

## 7. Implement tap-to-query

**Type:** build
**Job:** Check a specific location
**Depends on:** #6
**Notes:** `ZoneLookupTest.kt` (Layer 1, write before the implementation per `test_concept.md`'s TDD ordering) and `ZoneQuerySheetTest.kt` (Layer 4).

---

## Future (not v1 — do not pull these into `PROMPT.md` until the items above are done)

- Offline caching of zone data (architecture already leaves room for this — see `00-system-architecture.md`'s repository boundary note).
- EU regulatory data source and coverage.
- User-adjustable area (beyond the fixed Irvine+100km bbox).
- Precise TFR geometry, if a source is ever found/paid for that actually covers hazard-type TFRs (not just national-defense + stadium) — see `00-system-architecture.md`'s TFR data-precision note.
