---
updated: 2026-08-30
implemented:
tested:
---

# System Architecture

## What it is

**249g-map** is a native Android app (Kotlin + Jetpack Compose) that shows sub-250g drone pilots where they are legally allowed to fly. v1 scope: **Irvine, CA + 100km radius, US/FAA rules only, online-only.** EU rules and offline caching are planned extensions, not precluded by this architecture but not built in v1.

---

## v1 scope constraints

| Constraint | v1 value | Rationale |
|---|---|---|
| Geography | Fixed bbox centered on Irvine, CA, ~100km radius | First iteration; see `SETUP.md` |
| Regulatory source | US (FAA) only | EU deferred |
| Connectivity | Online-only, no local persistence of zone data | Offline deferred; see below |
| Data source | FAA UAS Facility Maps (LAANC altitude grid) + FAA TFR/NOTAM feed | Free, official; see `SETUP.md` |

**Offline note:** v1 does no local persistence, but the data layer is a `ZoneRepository` interface behind the domain layer specifically so a future local-cache implementation can be swapped in without touching UI or domain code. Don't let a UI or domain layer take a direct dependency on the network client.

**TFR data-precision note (confirmed while writing `10-flight-zone-data.md`):** the free, unauthenticated FAA TFR feed has no structured geometry — only a free-text description (see that spec). Only two narrow TFR categories (national-defense security areas, recurring stadium events) have free geometry, and neither covers the wildfire/hazard TFRs that are both the most common type and the most relevant near Irvine. Per `AGENT.md` §6 (never approximate regulatory data), v1 does **not** attempt polygon intersection or point-in-TFR checks for the text-only majority — `ZoneLookup` only ever reasons about the UASFM altitude grid. TFRs surface as a separate, clearly-labeled **text advisory list**, never merged into the allowed/restricted verdict. See the sections below and `10-flight-zone-data.md` for the full reasoning.

---

## Component overview

```
┌───────────────────────────────────────────────────────────────────┐
│ Android app (single Gradle module, Kotlin)                        │
│                                                                   │
│ MainActivity                                                      │
│  └─ MapScreen (Compose)                                           │
│      ├─ ZoneOverlay       — UASFM grid cells only, no TFR shapes  │
│      ├─ MyLocationButton  — recenter on device GPS                │
│      ├─ ZoneQuerySheet    — tap result: altitude / status         │
│      └─ TfrAdvisoryList   — plain-text panel, FAA's own wording,  │
│                              not checked against any tapped point │
│                                                                   │
│ MapViewModel                                                      │
│  ├─ zones: StateFlow<List<FlightZone>>                            │
│  ├─ location: StateFlow<LatLng?>                                  │
│  ├─ selectedZoneInfo: StateFlow<ZoneInfo?>                        │
│  └─ tfrAdvisories: StateFlow<List<TfrAdvisory>>                   │
│                                                                   │
│ Domain                                                            │
│  ├─ ZoneRepository (interface)     — UASFM zones for a bbox       │
│  ├─ ZoneLookup — point → ZoneInfo, UASFM grid only, never TFRs    │
│  ├─ TfrAdvisoryRepository (interface) — TFR text feed             │
│  └─ models: FlightZone, ZoneInfo, AltitudeCeiling, TfrAdvisory    │
│                                                                   │
│ Data                                                              │
│  ├─ NetworkZoneRepository — impl of ZoneRepository                │
│  │    └─ FaaUasfmApi (Retrofit — LAANC altitude grid)             │
│  ├─ NetworkTfrAdvisoryRepository — impl of TfrAdvisoryRepository  │
│  │    └─ FaaTfrApi (Retrofit — active TFR text feed)              │
│  └─ DeviceLocationProvider (FusedLocationProviderClient)          │
└───────────────────────────────────────────────────────────────────┘
```

---

## Modules / packages

| Package | Responsibility |
|---|---|
| `ui.map` | `MapScreen`, `ZoneOverlay`, `MyLocationButton`, `ZoneQuerySheet`, `TfrAdvisoryList` — Compose only, no network/location calls |
| `ui.MapViewModel` | Holds UI state as `StateFlow`; calls domain layer only |
| `domain` | `ZoneRepository` interface, `ZoneLookup` (point-in-cell logic, UASFM grid only), `TfrAdvisoryRepository` interface, domain models |
| `data.faa` | `NetworkZoneRepository` (implements `ZoneRepository`), `NetworkTfrAdvisoryRepository` (implements `TfrAdvisoryRepository`), `FaaUasfmApi`, `FaaTfrApi`, DTO → domain mapping |
| `data.location` | `DeviceLocationProvider` wrapping `FusedLocationProviderClient` |

Boundary rule: `ui.*` depends only on `domain`; `data.*` depends only on `domain` (implements its interfaces). `domain` depends on nothing Android-specific — keeps `ZoneLookup` unit-testable without an emulator.

---

## Map rendering

**Decision: Google Maps Compose** (Maps SDK for Android, Jetpack Compose wrapper) — the standard choice for professional native Android map UIs.

Requires a Google Maps API key (Google Cloud Console, "Maps SDK for Android", free tier covers dev use). **Action item for the human:** provision this key before the map screen can be built; it is not something an agent can self-serve.

---

## Networking & DI

- **Retrofit + OkHttp**, response bodies via `kotlinx.serialization` — standard professional stack, minimal boilerplate.
- **No DI framework in v1.** One `ViewModel`, manually wired via a `ViewModelFactory`. This is a normal, idiomatic Android pattern at this scale — Hilt is the natural next step if/when more screens or repositories are added, not required for a single-screen v1.

---

## Location

`ACCESS_FINE_LOCATION` runtime permission requested on first launch, standard Android permission flow. `DeviceLocationProvider` wraps `FusedLocationProviderClient` (Google Play services) — the common choice over the raw `LocationManager` API.

---

## Data layer detail

Exact endpoint URLs, query parameters, and response shapes are specified in `specs/10-flight-zone-data.md` — verified against the live FAA services while writing it, not assumed, per `AGENT.md` §6.

- `FaaUasfmApi` → LAANC altitude grid cells intersecting the bbox (the fixed Irvine+100km bbox for v1, hardcoded as a config constant — not user-adjustable) → mapped to `FlightZone` (cell geometry + max altitude). This is the **only** input to `ZoneLookup`.
- `FaaTfrApi` → currently active TFRs, filtered to the ones plausibly relevant to the bbox → mapped to `TfrAdvisory` (plain text: FAA's own description, dates, NOTAM id). **Never** mapped to `FlightZone`, never geometry, never merged into `ZoneLookup` — see the TFR data-precision note under "v1 scope constraints" above for why.
- `ZoneLookup.query(point)` only ever reasons about the UASFM grid. It does not know about TFRs and must never be asked to.

---

## Testing layers

See `test_concept.md` for the full breakdown. Summary: `domain` (`ZoneLookup`, coordinate math) is plain JUnit unit tests; `data`/`ui` integration is emulator/instrumented tests (`androidTest`) per the resolved test gate in `SETUP.md`.

---

## Build toolchain

| Tool | Role |
|---|---|
| Gradle (Kotlin DSL) | Build system |
| Kotlin + Jetpack Compose | Language + UI toolkit |
| Retrofit + OkHttp + kotlinx.serialization | Networking |
| Google Maps SDK for Android (Compose wrapper) | Map rendering |
| Google Play services location | GPS |
| JUnit + Espresso/Compose UI Test | Test gate (see `test_concept.md`) |

---

## Data flow: app launch

1. `MainActivity` starts → requests `ACCESS_FINE_LOCATION` if not yet granted.
2. `MapViewModel` calls `DeviceLocationProvider` for last known location (or falls back to bbox center if denied/unavailable).
3. `MapViewModel` calls `ZoneRepository.getZones(bbox)` → `NetworkZoneRepository` queries `FaaUasfmApi` → maps DTOs to `FlightZone` list → emits on `zones: StateFlow`. Independently, `MapViewModel` calls `TfrAdvisoryRepository.getAdvisories(bbox)` → `NetworkTfrAdvisoryRepository` queries `FaaTfrApi` → emits on `tfrAdvisories: StateFlow`. Two unrelated calls, two unrelated `StateFlow`s — a TFR feed failure never blocks or corrupts the zone grid.
4. `MapScreen` renders `ZoneOverlay` from `zones` and `TfrAdvisoryList` from `tfrAdvisories`, centers the map on `location`.

## Data flow: tap-to-query

1. User taps a point on the map.
2. `MapViewModel` calls `ZoneLookup.query(point)` against the already-fetched `zones` (no new network call).
3. Result (`ZoneInfo`: allowed / max altitude, UASFM grid only) emitted on `selectedZoneInfo` → `ZoneQuerySheet` shows it. `TfrAdvisoryList` is a separate, always-visible panel — tapping a point never queries it.
