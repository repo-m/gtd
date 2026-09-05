# Manual Test Queue

Decoupled from the build loop on purpose: `loop.sh` appends here automatically the moment a task's gate goes green and it's reviewed — it does not wait for you. That means the loop (whether driven by hand or by `scheduler.sh`) can chain straight through everything queued in `backlog.md` without pausing for manual QA between tasks.

Work through this at your own pace, in any order. For each entry:

- **Works as expected:** delete the entry. Git history + `bugs.md`'s review-gate nits are the record; this file is just the live to-do queue, same pattern as `backlog.md`.
- **Found a problem:** file it in `bugs.md` (format there), then delete the entry here. If it needs a dedicated fix task, add one to `backlog.md` too.

Entries are appended in completion order (oldest first).

## Implement the flight-zone data layer: fetch and map both FAA feeds per `specs/10-flight-zone-data.md`, no UI. — commit `d7674ad`

**Specs touched:**

- `specs/10-flight-zone-data.md`
- `specs/00-system-architecture.md`

**Verify manually:**

1. `domain` package (zero Android imports): `FlightZone` and `TfrAdvisory` data classes exactly as specced; an `IrvineBbox` constant with the four computed values (`minLat=32.7863, maxLat=34.5829, minLon=-118.9051, maxLon=-116.7479`); `ZoneRepository` and `TfrAdvisoryRepository` interfaces (`suspend fun getZones(bbox): List<FlightZone>` / `suspend fun getAdvisories(bbox): List<TfrAdvisory>`, or equivalent — your call on the exact signature, but bbox must be a parameter, never read from a global).
2. `data.faa` package: `FaaUasfmApi` (Retrofit) + `NetworkZoneRepository` implementing `ZoneRepository` — pages the ArcGIS query endpoint (`resultOffset`/`resultRecordCount=2000`) until a page returns fewer than 2000 features, accumulates every page into one `FlightZone` list, maps `attributes.OBJECTID`/`CEILING` + `geometry.rings[0]` (`[lon,lat]` pairs → `LatLng(lat, lon)`) exactly as specced.
3. `data.faa` package: `FaaTfrApi` (Retrofit) + `NetworkTfrAdvisoryRepository` implementing `TfrAdvisoryRepository` — fetches the full TFR list (no bbox param on this endpoint), filters to `state == "CA"`, maps to `TfrAdvisory` with `description`/`creationDate` copied verbatim (no date parsing, per the spec).
4. Error handling per the spec: a malformed/unparseable response from either API makes that repository return a distinct error/empty result, never a fabricated zone or advisory; a `FaaUasfmApi` page failing mid-pagination fails the whole fetch (no partial/truncated grid returned as if complete).
5. Test coverage, all in `app/src/test/`: `BboxTest.kt` (Layer 1 — asserts `IrvineBbox`'s four values) exactly; `NetworkZoneRepositoryTest.kt` and `NetworkTfrAdvisoryRepositoryTest.kt` (Layer 2, `MockWebServer` or a fake API implementation — no live network in the gate) covering: the multi-page pagination loop, the `state == "CA"` filter, a malformed-response case, and the mid-pagination-failure case.

**Done when:**

`./gradlew test connectedAndroidTest` exits 0 — the new unit tests pass and the existing instrumented test (`MainActivityTest`, unaffected by this task) still passes.
