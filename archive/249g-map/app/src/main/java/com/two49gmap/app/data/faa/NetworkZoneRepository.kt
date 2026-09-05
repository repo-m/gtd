package com.two49gmap.app.data.faa

import com.two49gmap.app.domain.BoundingBox
import com.two49gmap.app.domain.FetchResult
import com.two49gmap.app.domain.FlightZone
import com.two49gmap.app.domain.ZoneRepository
import kotlin.coroutines.cancellation.CancellationException

/** The layer's own `maxRecordCount`, confirmed live — so pagination is mandatory, not an edge case. */
const val UASFM_PAGE_SIZE = 2000

/**
 * Sanity bound on the pagination loop. The Irvine bbox returns ~7300 cells (4 pages), so
 * this is ~50x headroom; it exists only so a server that ignores `resultOffset` and keeps
 * handing back full pages fails loudly instead of looping forever into memory.
 */
const val UASFM_MAX_PAGES = 200

private const val TAG = "NetworkZoneRepository"

/**
 * [ZoneRepository] backed by [FaaUasfmApi].
 *
 * Pages the ArcGIS query endpoint with `resultOffset` / `resultRecordCount` until a page
 * comes back short, accumulating every page into one list — the Irvine bbox alone returns
 * ~7300 cells against a 2000-record cap.
 *
 * If any page fails, or any feature fails to map, the *whole* fetch fails: a truncated
 * grid would show missing cells as unrestricted airspace, which is a safety defect rather
 * than a cosmetic one (`10-flight-zone-data.md`, error handling).
 */
class NetworkZoneRepository(
    private val api: FaaUasfmApi,
    private val log: FaaLog = FaaLog.android(TAG),
) : ZoneRepository {

    override suspend fun getZones(bbox: BoundingBox): FetchResult<List<FlightZone>> {
        val zones = mutableListOf<FlightZone>()
        var offset = 0
        repeat(UASFM_MAX_PAGES) {
            val page = try {
                api.query(
                    geometry = bbox.toEsriEnvelope(),
                    resultOffset = offset,
                    resultRecordCount = UASFM_PAGE_SIZE,
                )
            } catch (cancellation: CancellationException) {
                throw cancellation
            } catch (failure: Exception) {
                return fail("UASFM page at offset $offset failed: ${failure.message}", failure)
            }

            try {
                page.features.mapTo(zones, UasfmFeature::toFlightZone)
            } catch (mapping: FaaMappingException) {
                return fail("UASFM page at offset $offset could not be mapped: ${mapping.message}", mapping)
            }

            if (page.features.size < UASFM_PAGE_SIZE) return FetchResult.Success(zones.toList())
            offset += UASFM_PAGE_SIZE
        }
        return fail(
            "UASFM pagination did not terminate within $UASFM_MAX_PAGES pages " +
                "(${zones.size} features so far) — refusing to return a possibly truncated grid.",
            IllegalStateException("resultOffset appears to be ignored by the server"),
        )
    }

    private fun fail(message: String, cause: Throwable): FetchResult.Error {
        log.warn(message, cause)
        return FetchResult.Error(message, cause)
    }
}

/** `minLon,minLat,maxLon,maxLat`, the order the ArcGIS envelope parameter expects. */
internal fun BoundingBox.toEsriEnvelope(): String = "$minLon,$minLat,$maxLon,$maxLat"
