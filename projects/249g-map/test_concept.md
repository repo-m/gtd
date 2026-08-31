# Test Strategy — 249g-map

## Philosophy

Tests are **back-pressure** on the agent loop (Huntley). They are the binary gate that replaces human verification in `loop.sh`. A test must be:

- **Deterministic** — same input, same result, always
- **Spec-derived** — every test traces back to a named spec requirement; nothing is invented
- **Honest about safety-critical logic** — `ZoneLookup` decides what a pilot believes is legal airspace; its tests are never skipped or weakened to make the gate pass (`AGENT.md` §4, §6)

Resolved test gate (`SETUP.md`): **unit + emulator/instrumented.** Both run every iteration.

---

## What we do NOT test (in the automated gate)

| Layer | Why |
|---|---|
| Google Maps SDK rendering internals (tile drawing, pan/zoom gestures) | Not ours to test; trust the SDK |
| Exact pixel/visual polish of overlays | Not deterministic; manual QA |
| Live FAA network calls | Non-deterministic, rate-limited, network-dependent — mocked instead (`MockWebServer` / fake `Retrofit` service) |
| OS permission dialog chrome | Side-effectful system UI; permission *handling logic* is tested, the dialog itself is not |
| Real-device GPS accuracy | Hardware-dependent; `DeviceLocationProvider` is tested against a fake, not real satellites |

Per `test_concept.md`'s job here mirroring Req.rw: whatever is manual-only stays explicit, not silently skipped. Manual, real-device, real-airspace verification is `usul.md`'s step 5 and is never claimed as covered by the automated gate.

---

## Test layers (ordered by priority)

### Layer 1 — Domain (pure Kotlin, no Android dependency, highest priority)

`domain/` has no Android imports (see `00-system-architecture.md`'s boundary rule), so these run as plain JVM unit tests — fastest layer, covers the safety-critical logic.

| Module | Spec |
|---|---|
| `ZoneLookup.query(point)` — point-in-cell (UASFM grid only; TFRs are text-only advisories, never part of this lookup — see `00-system-architecture.md`'s TFR data-precision note) | `22-zone-query` *(planned)* |
| Bbox constant (Irvine + 100km) coordinate math | `00-system-architecture` |
| DTO → `FlightZone` mapping (UASFM), DTO → `TfrAdvisory` mapping (TFR text feed) | `10-flight-zone-data` |

**Tooling:** JUnit 5 (or JUnit4, whichever the Gradle template defaults to), Kotlin — `app/src/test/`

---

### Layer 2 — Data layer with fakes (medium priority)

`NetworkZoneRepository` against a fake HTTP layer — no real network, no device.

| Scenario | Spec |
|---|---|
| `getZones(bbox)` paginates `FaaUasfmApi` (2000-record page cap, confirmed live) into one `FlightZone` list | `10-flight-zone-data` |
| Malformed/partial FAA response → repository returns error state, does not crash or fabricate a zone | `10-flight-zone-data` |
| `getAdvisories(bbox)` filters `FaaTfrApi`'s full list down to the bbox's state(s) | `10-flight-zone-data` |
| `FaaUasfmApi` and `FaaTfrApi` are independent — one failing never blocks or corrupts the other's result | `10-flight-zone-data` |

**Tooling:** JUnit + `MockWebServer` (OkHttp) or a fake `FaaUasfmApi`/`FaaTfrApi` implementation — `app/src/test/`

---

### Layer 3 — ViewModel (medium priority)

`MapViewModel` against fake `ZoneRepository` / `DeviceLocationProvider` implementations, using a coroutine test dispatcher.

| Scenario | Spec |
|---|---|
| App launch → `zones` StateFlow populated from repository | `00-system-architecture` |
| Location denied/unavailable → falls back to bbox center, does not crash | `21-location` *(planned)* |
| Tap point → `selectedZoneInfo` reflects `ZoneLookup.query` result, no new network call | `22-zone-query` *(planned)* |

**Tooling:** JUnit + `kotlinx-coroutines-test` — `app/src/test/`

---

### Layer 4 — Instrumented / emulator (required by the resolved test gate)

Runs on a connected device or emulator (`connectedAndroidTest`). Per `AGENT.md` §6: if no device/emulator is configured when this layer is due, say so rather than guessing pass/fail — do not skip silently.

| Scenario | Spec |
|---|---|
| Location permission flow: grant → map centers on device location | `21-location` *(planned)* |
| Location permission flow: deny → map centers on bbox fallback, no crash | `21-location` *(planned)* |
| `ZoneOverlay` renders a colored region for each `FlightZone` in view state | `20-map-view` *(planned)* |
| Tap on map → `ZoneQuerySheet` appears with the expected altitude/status text | `22-zone-query` *(planned)* |

**Tooling:** Compose UI Test + Espresso — `app/src/androidTest/`. Runs against a connected emulator or a USB-debugging-enabled physical device (see current session: Pixel 11 connected).

---

### Layer 5 — Structural / architectural gate (low cost, high value)

Machine-enforceable rules derived from `specs/00-system-architecture.md`.

| Rule | How enforced |
|---|---|
| `domain/` has zero Android SDK imports | Grep-based check or a small JVM test asserting the package's classpath has no `android.*` |
| `ui/` never imports `data.*` directly (only `domain`) | Grep-based check (`import com.*.data.` inside `ui/`) |
| `data/` implements `domain.ZoneRepository`, never bypassed by `ui`/`MapViewModel` | Grep-based check |

**Tooling:** a small Gradle task or shell script running grep assertions — kept in `app/src/test/` as an ordinary JVM test for simplicity.

---

## Gate command (used in `loop.sh`)

```bash
./gradlew test connectedAndroidTest
```

`test` runs Layers 1, 2, 3, 5 (fast, no device). `connectedAndroidTest` runs Layer 4 (needs a connected device/emulator — hard stop per `AGENT.md` §6 if none is available). Both must exit 0 for the loop to advance; either failure pipes the full output back to the agent as the next prompt.

---

## File layout for tests (once code exists)

```
app/src/test/java/.../
  domain/
    ZoneLookupTest.kt
    BboxTest.kt
  data/
    NetworkZoneRepositoryTest.kt
  ui/
    MapViewModelTest.kt
  arch/
    PackageBoundaryTest.kt   # Layer 5 grep-based checks

app/src/androidTest/java/.../
  ui/
    LocationPermissionFlowTest.kt
    ZoneOverlayTest.kt
    ZoneQuerySheetTest.kt
```

---

## Generation order (agent task sequence)

Tests are generated alongside the spec/feature they cover, not in a batch upfront — same as Req.rw. First tasks, once `10-flight-zone-data.md` and `20-map-view.md` exist:

1. `ZoneLookupTest.kt` (Layer 1) — write before `ZoneLookup` implementation, per usual TDD ordering
2. `BboxTest.kt` (Layer 1)
3. `NetworkZoneRepositoryTest.kt` (Layer 2)
4. `PackageBoundaryTest.kt` (Layer 5) — wire early so boundary violations fail fast from the first feature commit
5. `MapViewModelTest.kt` (Layer 3)
6. `LocationPermissionFlowTest.kt`, `ZoneOverlayTest.kt`, `ZoneQuerySheetTest.kt` (Layer 4) — once their respective UI exists
7. Wire `./gradlew test connectedAndroidTest` into `loop.sh`'s gate

Each step is a separate loop iteration. The gate runs after each step.
