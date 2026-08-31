STATUS: DONE

## Steps

- [x] `domain`: `FlightZone`, `TfrAdvisory` models; `IrvineBbox` constant (four computed values); `ZoneRepository`/`TfrAdvisoryRepository` interfaces — zero Android imports
- [x] `data.faa`: `FaaUasfmApi` + `NetworkZoneRepository` — paginated fetch (2000/page), `attributes`+`geometry.rings[0]` → `FlightZone`
- [x] `data.faa`: `FaaTfrApi` + `NetworkTfrAdvisoryRepository` — full fetch, `state == "CA"` filter, verbatim → `TfrAdvisory`
- [x] Error handling: malformed response → distinct error/empty result per repository; mid-pagination failure → whole fetch fails, no partial grid
- [x] `BboxTest.kt` (Layer 1)
- [x] `NetworkZoneRepositoryTest.kt` (Layer 2: pagination loop, malformed response, mid-pagination failure)
- [x] `NetworkTfrAdvisoryRepositoryTest.kt` (Layer 2: CA filter, malformed response)
- [x] Gate green: `./gradlew test connectedAndroidTest` → exit 0, re-verified 2026-08-30 on the `Pixel_3a_API_34_extension_level_7_x86_64` AVD (15 unit tests, 0 failures, confirmed with `--rerun-tasks`; `MainActivityTest` green). See the gate-environment note below before trusting a later red run.

## What was built

`app/src/main/java/com/two49gmap/app/domain/` — `LatLng`, `BoundingBox` + `IrvineBbox`,
`FlightZone`, `TfrAdvisory`, `FetchResult`, `ZoneRepository`, `TfrAdvisoryRepository`.

`app/src/main/java/com/two49gmap/app/data/faa/` — `FaaUasfmApi`, `FaaTfrApi`, their DTOs +
mappers, `NetworkZoneRepository`, `NetworkTfrAdvisoryRepository`, `FaaServices` (manual
Retrofit wiring, base URLs overridable so tests point production config at MockWebServer).

Build: added Retrofit 3.0.0 + `converter-kotlinx-serialization`, OkHttp 4.12.0,
kotlinx-serialization-json, the Kotlin serialization plugin; `mockwebserver` and
`kotlinx-coroutines-test` on the test classpath; `unitTests.isReturnDefaultValues = true`
(the repositories log failures via `android.util.Log`); `INTERNET` permission (v1 is
online-only, both feeds are fetched at runtime).

### Decisions worth carrying forward

- Repositories return `FetchResult<T>` (`Success`/`Error`), not a bare list or a thrown
  exception, so "the feed could not be read" is distinguishable from "there is nothing
  here". A fabricated or silently-truncated grid reads to a pilot as unrestricted airspace.
- `domain.LatLng` is our own type, not the Maps SDK's — the boundary rule forbids an
  Android dependency in `domain`; the UI converts at its edge (`20-map-view` Job).
- `NetworkTfrAdvisoryRepository.getAdvisories(bbox)` takes the bbox but resolves it to the
  single state `"CA"` via a private helper. A bbox spanning state lines would need a real
  state lookup there — out of scope while the bbox is a fixed constant.

### Verified against the live feeds (manually, outside the gate)

Both endpoints were re-queried live on 2026-08-30: the UASFM page returned 2000 features,
all `UNIT == "Feet"`, all single-ring, matching the DTOs exactly; `exportTfrList` returned
116 entries, 13 `state == "CA"`, no entry missing a specced field. Per `test_concept.md`
the gate itself never touches the network — this was a one-off sanity check.

## Out-of-scope findings

- `AGENT.md` §8 says to stamp `implemented`/`tested` on *every* spec listed in `PROMPT.md`.
  Only `specs/10-flight-zone-data.md` was stamped. `specs/00-system-architecture.md` was
  left blank on purpose: it was a load-on-demand reference for this Job, and most of what
  it specifies (`MapScreen`, `MapViewModel`, `ZoneLookup`, `DeviceLocationProvider`) does
  not exist yet — stamping it implemented would mislead the next iteration. Stamp it once
  the UI/ViewModel/location Jobs land.
- **Gate-environment note (the earlier caveat, now resolved).** The earlier red run was
  environmental, never a code failure: the Mac was out of disk and the physical Pixel had
  dozed onto its lock screen, so `MainActivityTest` could not foreground the Activity
  ("No compose hierarchies found in the app"). Both conditions have since cleared — ~6.5 GB
  free, and the `Pixel_3a_API_34_extension_level_7_x86_64` AVD is up and unlocked. A fresh
  `./gradlew test connectedAndroidTest` exits 0, and `./gradlew test --rerun-tasks` (to
  defeat the up-to-date cache) reports 15 unit tests, 0 failures, 0 errors across
  `BboxTest` (1), `NetworkZoneRepositoryTest` (7), `NetworkTfrAdvisoryRepositoryTest` (5)
  and the pre-existing `PackageBoundaryTest` (2), with `MainActivityTest` green on the AVD.
  Kept here because the failure signature is misleading if it recurs: low disk surfaces as
  "Error while dexing" on unrelated prebuilt jars (espresso, compose-runtime), which looks
  like a dependency problem and is not one, and the AVD then refuses to start with "Not
  enough disk space to run AVD". Note `adb` is not on `PATH`; it lives at
  `~/Library/Android/sdk/platform-tools/adb`.
