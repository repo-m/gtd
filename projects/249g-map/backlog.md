# Backlog

Queued multi-iteration efforts, in build order. Normally a human copies the topmost item into `PROMPT.md` per iteration (`usul.md` steps 1-3); `scheduler.sh` now also draws from here unattended (see `AGENT.md`-adjacent `scheduler.sh` at the repo root) — it always takes the **first** entry, drafts `PROMPT.md`/`fix_plan.md` from it, and deletes the entry once drafted. Keep entries self-contained enough for that: one task, the spec(s) it needs, and any notes an unattended drafting pass should know.

Each entry is either a **spec-writing** task (produces a `specs/NN-*.md` file, no code) or a **build** task (implements against an already-written spec). Per `README.md`'s Job list, a spec must exist before its build task is queued behind it.

---

## 1. Write `specs/20-map-view.md`

**Type:** spec-writing
**Job:** View flight zones
**Notes:** `MapScreen`, `ZoneOverlay` rendering (UASFM grid cells only — no TFR polygons, see `00-system-architecture.md`'s TFR data-precision note), `TfrAdvisoryList` (plain-text panel, not map geometry), legend/coloring. First task that pulls in the Google Maps Compose dependency named in `00-system-architecture.md`.

## 2. Implement the map view

**Type:** build
**Job:** View flight zones
**Depends on:** #1 (`specs/20-map-view.md` must exist)
**Notes:** Renders `FlightZone` list from `NetworkZoneRepository` on the map, and `TfrAdvisory` list in `TfrAdvisoryList`. Layer 4 instrumented test: `ZoneOverlayTest.kt`.

## 3. Write `specs/21-location.md`

**Type:** spec-writing
**Job:** Locate myself on the map
**Notes:** Location permission flow, `DeviceLocationProvider`, recenter button, bbox-center fallback on denial.

## 4. Implement location

**Type:** build
**Job:** Locate myself on the map
**Depends on:** #3
**Notes:** Layer 4 instrumented test: `LocationPermissionFlowTest.kt` (grant + deny paths, per `test_concept.md`).

## 5. Write `specs/22-zone-query.md`

**Type:** spec-writing
**Job:** Check a specific location
**Notes:** Tap-to-query interaction, `ZoneLookup` (UASFM grid only — never TFRs, per `00-system-architecture.md`), `ZoneQuerySheet` result display.

## 6. Implement tap-to-query

**Type:** build
**Job:** Check a specific location
**Depends on:** #5
**Notes:** `ZoneLookupTest.kt` (Layer 1, write before the implementation per `test_concept.md`'s TDD ordering) and `ZoneQuerySheetTest.kt` (Layer 4).

## 7. Revise `specs/10-flight-zone-data.md`'s pagination algorithm (BUG-002)

**Type:** spec-writing
**Job:** View flight zones (data correctness)
**Notes:** Closes `bugs.md` BUG-002. The specced loop stops at the first page with fewer than 2000 features, so if the FAA lowers the UASFM layer's `maxRecordCount` below 2000 the very first page ends the loop and the grid is silently truncated — the safety defect the spec itself names. Tighten the algorithm: carry ArcGIS's `exceededTransferLimit` in the response shape, and make `exceededTransferLimit && features.size < pageSize` a hard error rather than a normal end-of-pagination. Spec only — the matching change to `UasfmQueryResponse`/`NetworkZoneRepository` (plus a Layer 2 test for the short-page-with-flag case) is a build task to queue behind this one.

---

## Future (not v1 — do not pull these into `PROMPT.md` until the items above are done)

- Offline caching of zone data (architecture already leaves room for this — see `00-system-architecture.md`'s repository boundary note).
- EU regulatory data source and coverage.
- User-adjustable area (beyond the fixed Irvine+100km bbox).
- Precise TFR geometry, if a source is ever found/paid for that actually covers hazard-type TFRs (not just national-defense + stadium) — see `00-system-architecture.md`'s TFR data-precision note.
