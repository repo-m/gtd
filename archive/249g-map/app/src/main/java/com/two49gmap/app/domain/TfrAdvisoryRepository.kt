package com.two49gmap.app.domain

/**
 * Source of active TFR text advisories relevant to a bbox. Independent of
 * [ZoneRepository]: one feed failing must never block or corrupt the other
 * (`00-system-architecture.md`, data-flow note).
 */
interface TfrAdvisoryRepository {

    /** Active TFRs plausibly relevant to [bbox]. Text only — this feed has no geometry. */
    suspend fun getAdvisories(bbox: BoundingBox): FetchResult<List<TfrAdvisory>>
}
