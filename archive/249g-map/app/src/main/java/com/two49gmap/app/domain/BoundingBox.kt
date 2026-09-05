package com.two49gmap.app.domain

/** An axis-aligned WGS84 envelope. */
data class BoundingBox(
    val minLat: Double,
    val maxLat: Double,
    val minLon: Double,
    val maxLon: Double,
)

/**
 * The fixed v1 bbox: Irvine, CA civic center (33.6846, -117.8265) + 100km, as an
 * axis-aligned envelope that fully *contains* that circle — an intentional over-fetch,
 * never an under-fetch (`10-flight-zone-data.md`, "Bbox constant"):
 *
 * ```
 * Δlat = 100 / 111.32                           = 0.8983°
 * Δlon = 100 / (111.32 × cos(33.6846°))         = 1.0786°
 * ```
 *
 * Both repositories take a bbox as a parameter; neither hardcodes this constant itself.
 */
val IrvineBbox = BoundingBox(
    minLat = 32.7863,
    maxLat = 34.5829,
    minLon = -118.9051,
    maxLon = -116.7479,
)
