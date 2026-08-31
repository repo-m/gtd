---
updated: 2026-08-30
implemented: 2026-08-30
tested: 2026-08-30
---

# Flight-Zone Data

Fetch and map both FAA feeds named in `SETUP.md` for the fixed Irvine+100km bbox. Everything below (endpoints, parameters, response shapes, record counts) was queried live against the production FAA services on 2026-08-30 — nothing here is assumed or approximated, per `AGENT.md` §6.

**Does not cover:** `ZoneLookup`'s point-in-cell logic (→ `22-zone-query`, not yet written), rendering (→ `20-map-view`, not yet written), the Retrofit/DI wiring pattern (→ `00-system-architecture.md`).

---

## Bbox constant

Center: Irvine, CA civic center, **33.6846°N, -117.8265°W**. The 100km radius is approximated as an axis-aligned rectangular envelope, not a circle — both FAA feeds below work in terms of an envelope or a coarser filter, not a true circle. The box is sized so it always fully **contains** the 100km circle (its corners extend up to ~40km beyond the circle at the diagonal) — an intentional over-fetch, never an under-fetch, which is the correct direction to err in for a safety tool.

```
Δlat = 100 / 111.32           = 0.8983°
Δlon = 100 / (111.32 × cos(33.6846°)) = 1.0786°

minLat = 32.7863   maxLat = 34.5829
minLon = -118.9051  maxLon = -116.7479
```

Define once as a `domain` constant (e.g. `IrvineBbox`); both repositories below take it as a parameter, never hardcode it themselves.

---

## `FaaUasfmApi` — UASFM / LAANC altitude grid

The **only** input to `ZoneLookup` (see `00-system-architecture.md`'s TFR data-precision note — TFRs never feed into it).

**Endpoint (confirmed live, free, unauthenticated):**
```
GET https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/arcgis/rest/services/FAA_UAS_FacilityMap_Data/FeatureServer/0/query
```

Standard Esri ArcGIS REST `query` operation. Query parameters:

| Param | Value |
|---|---|
| `geometry` | `minLon,minLat,maxLon,maxLat` (the bbox above) |
| `geometryType` | `esriGeometryEnvelope` |
| `inSR` | `4326` |
| `spatialRel` | `esriSpatialRelIntersects` |
| `outFields` | `OBJECTID,CEILING,UNIT` |
| `returnGeometry` | `true` |
| `outSR` | `4326` |
| `f` | `json` |
| `resultOffset` | pagination, see below |
| `resultRecordCount` | `2000` (the server's own `maxRecordCount`, confirmed via `?f=json` on the layer) |

**Confirmed live for the Irvine bbox:** `returnCountOnly=true` → **7302 features**. Layer `maxRecordCount` is 2000, so a single query always sets `"exceededTransferLimit": true` and returns a partial page — **pagination is mandatory**, not an edge case.

**Pagination algorithm:**
```
offset = 0
all_features = []
loop:
  page = query(resultOffset = offset, resultRecordCount = 2000)
  all_features += page.features
  if page.features.size < 2000: break        // last page
  offset += 2000
```
If any page request fails mid-sequence, the whole fetch fails — never return a truncated grid silently. A missing cell would read as "no restriction here," which is a safety defect, not a UX one (see Error handling below).

**Confirmed response shape:**
```json
{
  "geometryType": "esriGeometryPolygon",
  "spatialReference": {"wkid": 4326},
  "exceededTransferLimit": true,
  "fields": [
    {"name": "OBJECTID", "type": "esriFieldTypeOID"},
    {"name": "CEILING", "type": "esriFieldTypeInteger"},
    {"name": "UNIT", "type": "esriFieldTypeString"}
  ],
  "features": [
    {
      "attributes": {"OBJECTID": 46292, "CEILING": 300, "UNIT": "Feet"},
      "geometry": {"rings": [[[-117.808348, 33.616672], [-117.808348, 33.625005], [-117.800015, 33.625005], [-117.800015, 33.616672], [-117.808348, 33.616672]]]}
    }
  ]
}
```

Every observed cell is a single simple rectangular ring. `rings[0]` is the outer boundary; a feature with more than one ring, or `UNIT != "Feet"`, is a mapping error — fail loudly (surface as an error state), don't silently coerce.

**→ `FlightZone` mapping:**

```kotlin
data class FlightZone(
    val id: Int,                 // attributes.OBJECTID
    val ceilingFeet: Int,        // attributes.CEILING
    val polygon: List<LatLng>,   // geometry.rings[0], each [lon, lat] → LatLng(lat, lon)
)
```

---

## `FaaTfrApi` — active TFR text feed

Feeds `TfrAdvisory` only, **never** `FlightZone` — this feed carries no geometry (confirmed below), so it cannot honestly back a map overlay or a point-in-zone check. See `00-system-architecture.md`'s TFR data-precision note for the full reasoning and the decision (plain text advisory list) it led to.

**Endpoint (confirmed live, free, unauthenticated):**
```
GET https://tfr.faa.gov/tfrapi/exportTfrList?format=JSON
```

No bbox parameter — returns **every** active TFR nationwide (116 on 2026-08-30) as a flat JSON array, no pagination, no auth.

**Confirmed response shape** (one entry, real data):
```json
{
  "notam_id": "6/9187",
  "type": "HAZARDS",
  "facility": "ZOA",
  "state": "CA",
  "description": "20NM SW KING CITY, CA, Sunday, August 30, 2026 through Sunday, September 13, 2026 UTC",
  "creation_date": "08/30/2026"
}
```
`type` observed values include `HAZARDS`, `SECURITY`, `VIP`, `AIR SHOWS/SPORTS`, `UAS PUBLIC GATHERING`. No coordinates, no altitude, no structured effective-date fields — the date range only exists inside `description`'s free text.

**Relevance filter:** the only structured field usable for bbox relevance is `state`. Confirmed the Irvine+100km bbox never crosses a state line (nearest non-CA airspace is well over 100km away), so filter the full list to `state == "CA"` (13 of 116 entries on 2026-08-30). This is a **coarse** filter, not a precise one — a CA TFR near the Oregon border (600km+ away) still passes it. That's an accepted v1 limitation: favor over-inclusion and let the pilot read FAA's own description text, rather than attempt a false precision this feed can't back.

**→ `TfrAdvisory` mapping:**

```kotlin
data class TfrAdvisory(
    val notamId: String,       // notam_id
    val type: String,          // type
    val facility: String,      // facility
    val description: String,   // description, shown verbatim — never parsed for coordinates or dates
    val creationDate: String,  // creation_date, raw MM/DD/YYYY string, shown verbatim
)
```

No date-range parsing in v1: `description`'s embedded date text ("through Tuesday, September 15, 2026 UTC") is unstructured prose, so reliably parsing it would itself be an approximation — show it verbatim instead.

---

## Error handling (backs `test_concept.md` Layer 2)

- Malformed/unparseable response from either API → that repository returns a distinct error/empty state, logged, never fabricates a zone or advisory.
- `FaaUasfmApi` and `FaaTfrApi` are called independently (`ZoneRepository.getZones` / `TfrAdvisoryRepository.getAdvisories`) — one feed failing never blocks or corrupts the other's `StateFlow` (see `00-system-architecture.md`'s data-flow note).
- `FaaUasfmApi` pagination failing partway through → the entire fetch fails; never surface a truncated grid.
