# Task

Implement the flight-zone data layer: fetch and map both FAA feeds per `specs/10-flight-zone-data.md`, no UI.

## Specs to load

- `specs/10-flight-zone-data.md`
- `specs/00-system-architecture.md`

## Acceptance criteria

1. `domain` package (zero Android imports): `FlightZone` and `TfrAdvisory` data classes exactly as specced; an `IrvineBbox` constant with the four computed values (`minLat=32.7863, maxLat=34.5829, minLon=-118.9051, maxLon=-116.7479`); `ZoneRepository` and `TfrAdvisoryRepository` interfaces (`suspend fun getZones(bbox): List<FlightZone>` / `suspend fun getAdvisories(bbox): List<TfrAdvisory>`, or equivalent — your call on the exact signature, but bbox must be a parameter, never read from a global).
2. `data.faa` package: `FaaUasfmApi` (Retrofit) + `NetworkZoneRepository` implementing `ZoneRepository` — pages the ArcGIS query endpoint (`resultOffset`/`resultRecordCount=2000`) until a page returns fewer than 2000 features, accumulates every page into one `FlightZone` list, maps `attributes.OBJECTID`/`CEILING` + `geometry.rings[0]` (`[lon,lat]` pairs → `LatLng(lat, lon)`) exactly as specced.
3. `data.faa` package: `FaaTfrApi` (Retrofit) + `NetworkTfrAdvisoryRepository` implementing `TfrAdvisoryRepository` — fetches the full TFR list (no bbox param on this endpoint), filters to `state == "CA"`, maps to `TfrAdvisory` with `description`/`creationDate` copied verbatim (no date parsing, per the spec).
4. Error handling per the spec: a malformed/unparseable response from either API makes that repository return a distinct error/empty result, never a fabricated zone or advisory; a `FaaUasfmApi` page failing mid-pagination fails the whole fetch (no partial/truncated grid returned as if complete).
5. Test coverage, all in `app/src/test/`: `BboxTest.kt` (Layer 1 — asserts `IrvineBbox`'s four values) exactly; `NetworkZoneRepositoryTest.kt` and `NetworkTfrAdvisoryRepositoryTest.kt` (Layer 2, `MockWebServer` or a fake API implementation — no live network in the gate) covering: the multi-page pagination loop, the `state == "CA"` filter, a malformed-response case, and the mid-pagination-failure case.

## Done when

`./gradlew test connectedAndroidTest` exits 0 — the new unit tests pass and the existing instrumented test (`MainActivityTest`, unaffected by this task) still passes.

## Gate command

```
./gradlew test connectedAndroidTest
```

## Out of scope

- Any UI: `MapScreen`, `ZoneOverlay`, `TfrAdvisoryList`, `MyLocationButton`, `ZoneQuerySheet` (later Jobs, once their specs exist).
- `MapViewModel`, any `StateFlow` wiring — that's where the "two independent repositories, one feed failing never blocks the other" property gets exercised end-to-end; this task only needs each repository correct in isolation.
- `ZoneLookup` (point-in-cell query logic) — belongs to `22-zone-query`, not yet written.
- Google Maps SDK integration, location permission flow.
- Any attempt at TFR geometry/polygon handling — the spec is explicit that this feed has none; don't invent any.
- Parsing dates or coordinates out of `TfrAdvisory.description`'s free text.
