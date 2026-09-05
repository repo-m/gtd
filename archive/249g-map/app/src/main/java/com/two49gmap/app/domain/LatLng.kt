package com.two49gmap.app.domain

/**
 * A WGS84 geographic point. Deliberately a domain type rather than the Maps SDK's
 * `com.google.android.gms.maps.model.LatLng`: per `00-system-architecture.md`'s boundary
 * rule, `domain` takes no Android-specific dependency, so the UI layer converts at its
 * own edge.
 */
data class LatLng(
    val latitude: Double,
    val longitude: Double,
)
