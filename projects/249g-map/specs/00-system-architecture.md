---
updated: 2026-08-30
implemented: 2026-08-30
tested: 2026-08-30
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

---

## Component overview

```
┌──────────────────────────────────────────────────────────┐
│  Android app (single Gradle module, Kotlin)               │
│                                                            │
│  MainActivity                                             │
│   └─ MapScreen (Compose)                                  │
│       ├─ ZoneOverlay        — colored grid cells / TFR     │
│       │                       polygons drawn on the map    │
│       ├─ MyLocationButton   — recenter on device GPS       │
│       └─ ZoneQuerySheet     — bottom sheet: tap a point,   │
│                                 show max altitude / status │
│                                                            │
│  MapViewModel                                              │
│   ├─ zones: StateFlow<List<FlightZone>>                   │
│   ├─ location: StateFlow<LatLng?>                          │
│   └─ selectedZoneInfo: StateFlow<ZoneInfo?>                │
│                                                            │
│  Domain                                                     │
│   ├─ ZoneRepository (interface)  — fetch zones for a bbox  │
│   ├─ ZoneLookup                  — point → ZoneInfo         │
│   └─ models: FlightZone, ZoneInfo, AltitudeCeiling          │
│                                                            │
│  Data                                                        │
│   ├─ NetworkZoneRepository  — impl of ZoneRepository        │
│   │    ├─ FaaUasfmApi  (Retrofit — LAANC altitude grid)     │
│   │    └─ FaaTfrApi    (Retrofit — active TFR/NOTAM feed)   │
│   └─ DeviceLocationProvider (FusedLocationProviderClient)   │
└──────────────────────────────────────────────────────────┘
```

---

## Modules / packages

| Package | Responsibility |
|---|---|
| `ui.map` | `MapScreen`, `ZoneOverlay`, `MyLocationButton`, `ZoneQuerySheet` — Compose only, no network/location calls |
| `ui.MapViewModel` | Holds UI state as `StateFlow`; calls domain layer only |
| `domain` | `ZoneRepository` interface, `ZoneLookup` (point-in-cell / point-in-polygon logic), domain models |
| `data.faa` | `NetworkZoneRepository`, `FaaUasfmApi`, `FaaTfrApi`, DTO → domain mapping |
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

Both FAA feeds are queried by bounding box (the fixed Irvine+100km bbox for v1, hardcoded as a config constant — not user-adjustable in v1). Exact endpoint URLs and query parameters are **not specified here** — they belong in a future `specs/10-flight-zone-data.md` and must be confirmed against the live FAA services when that spec is written, not assumed. Per `AGENT.md` §6, don't invent or approximate regulatory data or endpoints.

- `FaaUasfmApi` → LAANC altitude grid cells for the bbox → mapped to `FlightZone` (cell geometry + max altitude).
- `FaaTfrApi` → currently active TFRs intersecting the bbox → mapped to `FlightZone` (polygon + restricted/no-fly status).
- `ZoneLookup.query(point)` merges both: a TFR always overrides the UASFM grid ceiling for a point it covers.

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
3. `MapViewModel` calls `ZoneRepository.getZones(bbox)` → `NetworkZoneRepository` fires both FAA requests in parallel → maps DTOs to `FlightZone` list → emits on `zones: StateFlow`.
4. `MapScreen` renders `ZoneOverlay` from `zones`, centers the map on `location`.

## Data flow: tap-to-query

1. User taps a point on the map.
2. `MapViewModel` calls `ZoneLookup.query(point)` against the already-fetched `zones` (no new network call).
3. Result (`ZoneInfo`: allowed / max altitude / TFR-restricted) emitted on `selectedZoneInfo` → `ZoneQuerySheet` shows it.
