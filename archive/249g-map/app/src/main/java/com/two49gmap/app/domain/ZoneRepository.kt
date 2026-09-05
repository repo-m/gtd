package com.two49gmap.app.domain

/**
 * Source of UASFM altitude-grid cells for a bbox. An interface so a future local-cache
 * implementation can replace the network one without touching UI or domain code
 * (`00-system-architecture.md`, offline note).
 */
interface ZoneRepository {

    /**
     * All grid cells intersecting [bbox]. The bbox is always a parameter — never read
     * from a global — so the fixed v1 envelope stays a caller's choice.
     */
    suspend fun getZones(bbox: BoundingBox): FetchResult<List<FlightZone>>
}
