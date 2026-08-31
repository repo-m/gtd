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
- [x] Review-gate REJECT on the `f4c65a2` batch addressed (see `## Review-gate round 1` below); gate re-run after those changes → exit 0, 15 unit tests / 0 failures / 0 errors, `MainActivityTest` green on the same AVD

## What was built

`app/src/main/java/com/two49gmap/app/domain/` — `LatLng`, `BoundingBox` + `IrvineBbox`,
`FlightZone`, `TfrAdvisory`, `FetchResult`, `ZoneRepository`, `TfrAdvisoryRepository`.

`app/src/main/java/com/two49gmap/app/data/faa/` — `FaaUasfmApi`, `FaaTfrApi`, their DTOs +
mappers, `NetworkZoneRepository`, `NetworkTfrAdvisoryRepository`, `FaaServices` (manual
Retrofit wiring, base URLs overridable so tests point production config at MockWebServer).

Build: added Retrofit 3.0.0 + `converter-kotlinx-serialization`, OkHttp 4.12.0,
kotlinx-serialization-json, the Kotlin serialization plugin; `mockwebserver` and
`kotlinx-coroutines-test` on the test classpath; `INTERNET` permission (v1 is
online-only, both feeds are fetched at runtime). No module-wide unit-test stubbing:
the repositories log through the injected `FaaLog` seam instead (review round 1, nit 4).

### Decisions worth carrying forward

- Repositories return `FetchResult<T>` (`Success`/`Error`), not a bare list or a thrown
  exception, so "the feed could not be read" is distinguishable from "there is nothing
  here". A fabricated or silently-truncated grid reads to a pilot as unrestricted airspace.
- `domain.LatLng` is our own type, not the Maps SDK's — the boundary rule forbids an
  Android dependency in `domain`; the UI converts at its edge (`20-map-view` Job).
- `NetworkTfrAdvisoryRepository.getAdvisories(bbox)` takes the bbox because the interface is
  bbox-driven, but filters on the `BBOX_STATE = "CA"` constant: the bbox genuinely does not
  enter into it yet. A bbox spanning state lines would need a real state lookup there — out of
  scope while the bbox is a fixed constant.
- Failure logging goes through `FaaLog`, injected per repository (`FaaLog.android(TAG)` in
  production, `FaaLog.None` in tests), so no unit test needs `android.util.Log` stubbed.

### Verified against the live feeds (manually, outside the gate)

Both endpoints were re-queried live on 2026-08-30: the UASFM page returned 2000 features,
all `UNIT == "Feet"`, all single-ring, matching the DTOs exactly; `exportTfrList` returned
116 entries, 13 `state == "CA"`, no entry missing a specced field. Per `test_concept.md`
the gate itself never touches the network — this was a one-off sanity check.

## Review-gate round 1 — REJECT on the `f4c65a2` batch, addressed

**Blocking finding — cleared `PROMPT.md` read as an active task, so unattended chaining never advanced.**
The placeholder template's two bare ``` fence lines matched `grep -qE "^[^#<[:space:]]"`, the
emptiness regex that `loop.sh` and `scheduler.sh` each carried their own copy of. `scheduler.sh`
step 2 therefore kept re-launching `loop.sh` instead of reaching `backlog.md`, and `loop.sh`
accepted the template and pulled `GATE_CMD` out of an HTML comment — a gate that can only be red,
for up to 20 unattended iterations.

Fixed by removing the duplication rather than patching two regexes:

- **`prompt_state.sh` (new)** — single source of truth. Holds `prompt_placeholder_template`
  (the literal, verified byte-identical to the heredoc it replaced) plus the three readers:
  `prompt_task_title`, `prompt_has_active_task`, `prompt_gate_cmd`. Emptiness is now decided by
  "does `# Task` have a real body line before the next `##`?", not by scanning for any
  prose-looking line — the template is mostly comments and fences, which is what broke the old
  test. `prompt_gate_cmd` also excludes `<`, so a commented-out gate is an *absent* gate.
- **`test_prompt_state.sh` (new)** — runs the readers against the literal template, asserts a
  filled-in prompt still parses (title + gate), asserts a commented-out gate reads as absent, and
  asserts neither script keeps a private copy of the template or of the old regex. `loop.sh` and
  `scheduler.sh` both run it at startup and refuse to act if it fails. This is the tie the review
  asked for: the template and its readers cannot drift apart silently again.
- Verified end to end: against a cleared `PROMPT.md`, `scheduler.sh`'s step 2 now falls through to
  step 3 (pull next backlog entry), and `loop.sh` exits 1 with "appears to be empty or a template"
  instead of burning iterations.

**Non-blocking nits, also addressed:**

1. `git add -A` → `git add -A -- .` at both `loop.sh` sites (and in `scheduler.sh`'s prep-prompt
   instructions), matching the `-- .` scoping the rest of the batch already used. Unscoped, it
   stages the whole monorepo regardless of cwd.
3. `NetworkZoneRepository.getZones` now bounds the pagination loop at `UASFM_MAX_PAGES = 200`
   (~50x the ~7300 features the bbox actually returns) and fails loudly past it, so a server that
   ignores `resultOffset` can't loop forever into memory.
4. `unitTests.isReturnDefaultValues = true` removed from `app/build.gradle.kts`. The single
   `android.util.Log` call it existed for is now behind `FaaLog`, a one-method seam injected into
   both repositories (`FaaLog.android(TAG)` in production, `FaaLog.None` in the tests). The
   module-wide switch silently no-opped every `android.jar` method in every present and future
   unit test; the seam keeps the stubbing to one call. Test assertions are unchanged — only the
   construction line in each `@Before`.
5. `git tag -f last-reviewed HEAD` now runs *after* `finish_and_queue_for_test`, not before, so
   the cleanup commit lands inside the batch it belongs to. Previously it always became commit #1
   of the next batch, making reviews fire every 4 substantive commits instead of 5.
6. `ensure_device` prefers the AVD the gate is actually verified against
   (`Pixel_3a_API_34_extension_level_7_x86_64`, overridable via `LOOP_AVD`) and only falls back to
   the first-listed one with a warning. An emulator *this run* booted is now shut down via
   `adb emu kill` on exit (including failed/interrupted runs); one a human already had running is
   left alone.
7. `NetworkTfrAdvisoryRepository`'s receiver-ignoring `BoundingBox.relevantState()` extension is
   gone — the filter reads `it.state == BBOX_STATE` against the documented constant, which is
   honest about the bbox not entering into it yet.

Nit 2 could not be fixed here — see `## Out-of-scope findings`. Nit 8 was explicitly not a finding.

## Out-of-scope findings

- **Review nit 2 — `exceededTransferLimit` is ignored.** Filed as `bugs.md` BUG-002 and queued as
  `backlog.md` entry #7, code untouched. The reviewer agreed this is a spec issue, not an
  implementation one: `NetworkZoneRepository` follows `10-flight-zone-data.md`'s stated algorithm
  (`size < 2000 -> break`) literally. But if the FAA lowers that layer's `maxRecordCount` below
  2000, page 1 comes back short *with* `exceededTransferLimit: true`, pagination stops, and the
  grid is silently truncated — the exact safety defect the spec names. The fix has to start in the
  spec, and `AGENT.md` §7 forbids editing a spec `PROMPT.md` did not list for editing; changing the
  code alone would desync implementation from spec, which is worse.
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
