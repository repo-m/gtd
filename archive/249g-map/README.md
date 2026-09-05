# 249g-map: allowed flight zones for sub-250g drones

Native Android app (Kotlin + Jetpack Compose) showing where a sub-250g drone may legally fly. v1 scope: Irvine, CA + 100km radius, US/FAA rules, online-only. See `SETUP.md` for the resolved decisions and `specs/00-system-architecture.md` for the architecture.

## How to use this map

Load only the spec files directly relevant to your active task. Each entry states what the file covers and what it explicitly excludes. Do not load specs that are not needed.

## Spec frontmatter convention

Same as Req.rw:

```yaml
---
updated: 2026-08-30
implemented:
tested:
---
```

`updated` = human edit date. `implemented`/`tested` = agent-set on `STATUS: DONE`. Reset rule per `AGENT.md` §8.

## Foundational specs (load-on-demand)

- **[`specs/00-system-architecture.md`](specs/00-system-architecture.md)** — App module layout, map rendering choice, networking/DI stack, data flow.
  - *Covers:* `ui`/`domain`/`data` package boundaries, Google Maps Compose decision, Retrofit stack, location provider, build toolchain.
  - *Does not cover:* Exact FAA endpoint URLs/params (→ `10-flight-zone-data`, written), UI layout details (→ `20-map-view`, not yet written).

## Jobs

Spec files below are marked `(planned)` where they don't exist yet — this is the structure per `SETUP.md`'s "populate the Job list" step. Each gets its own numbered spec file under `specs/` before its first `PROMPT.md` task, per the numbering convention `00` foundational / `10s` data / `20s` map & UI.

### Job: View flight zones

User goal: see allowed/restricted drone airspace near the current location on a map.

- **[`specs/10-flight-zone-data.md`](specs/10-flight-zone-data.md)** — FAA UASFM (LAANC grid) + TFR text-feed endpoints, bbox query, pagination, DTO → `FlightZone`/`TfrAdvisory` mapping. TFRs are a text-only advisory list in v1, not map geometry — see the spec's own note and `00-system-architecture.md`'s TFR data-precision note for why.
- `specs/20-map-view.md` *(planned)* — `MapScreen`, `ZoneOverlay` rendering (UASFM grid cells only — no TFR polygons, per the TFR data-precision note above), `TfrAdvisoryList` (plain-text panel), legend/coloring.

### Job: Locate myself on the map

User goal: see my own position relative to flight zones.

- `specs/21-location.md` *(planned)* — Location permission flow, `DeviceLocationProvider`, recenter button.

### Job: Check a specific location

User goal: tap a point on the map and see whether/how high I can fly there.

- `specs/22-zone-query.md` *(planned)* — Tap-to-query interaction, `ZoneLookup`, `ZoneQuerySheet` result display.

### Future (not v1)

- Offline caching of zone data (architecture leaves room for this — see `00-system-architecture.md`'s repository boundary note).
- EU regulatory data source and coverage.
- User-adjustable area (beyond the fixed Irvine+100km bbox).
