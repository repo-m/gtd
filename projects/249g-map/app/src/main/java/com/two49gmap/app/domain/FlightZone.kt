package com.two49gmap.app.domain

/**
 * One UASFM / LAANC altitude grid cell: the polygon it covers and the ceiling, in feet,
 * a sub-250g flight may reach inside it. Mapped from the FAA UASFM feed
 * (`10-flight-zone-data.md`). This is the only input to `ZoneLookup` — TFRs never
 * become `FlightZone`s.
 */
data class FlightZone(
    /** `attributes.OBJECTID` */
    val id: Int,
    /** `attributes.CEILING`, always feet — a cell reporting another unit is a mapping error. */
    val ceilingFeet: Int,
    /** `geometry.rings[0]`, each `[lon, lat]` pair converted to `LatLng(lat, lon)`. */
    val polygon: List<LatLng>,
)
