package com.two49gmap.app.data.faa

import com.two49gmap.app.domain.BoundingBox
import com.two49gmap.app.domain.FetchResult
import com.two49gmap.app.domain.TfrAdvisory
import com.two49gmap.app.domain.TfrAdvisoryRepository
import kotlin.coroutines.cancellation.CancellationException

/**
 * The one state the v1 bbox lies in. `10-flight-zone-data.md` confirmed the Irvine+100km
 * envelope never crosses a state line, and `state` is the only structured field this feed
 * offers, so it is the relevance filter.
 *
 * A constant, not a function of the bbox: the bbox genuinely does not enter into it today.
 * A bbox that spanned state lines would need a real state lookup here — out of scope while
 * the bbox is a fixed constant, and a lookup that ignored its argument would only disguise
 * that.
 */
private const val BBOX_STATE = "CA"

private const val TAG = "NetworkTfrAdvisory"

/**
 * [TfrAdvisoryRepository] backed by [FaaTfrApi].
 *
 * The endpoint has no bbox parameter — it returns every active TFR nationwide — so the
 * full list is fetched and filtered client-side to [BBOX_STATE], the one state the v1 bbox
 * lies in. The bbox stays in the signature because the interface is bbox-driven and a
 * later, finer filter will need it. This is deliberately a
 * *coarse* filter: a CA TFR 600km up the coast still passes it. v1 favours over-inclusion
 * and lets the pilot read the FAA's own description text over a false precision this feed
 * cannot back.
 */
class NetworkTfrAdvisoryRepository(
    private val api: FaaTfrApi,
    private val log: FaaLog = FaaLog.android(TAG),
) : TfrAdvisoryRepository {

    override suspend fun getAdvisories(bbox: BoundingBox): FetchResult<List<TfrAdvisory>> {
        val all = try {
            api.listTfrs()
        } catch (cancellation: CancellationException) {
            throw cancellation
        } catch (failure: Exception) {
            val message = "TFR list fetch failed: ${failure.message}"
            log.warn(message, failure)
            return FetchResult.Error(message, failure)
        }

        val relevant = all.filter { it.state == BBOX_STATE }.map(TfrDto::toTfrAdvisory)
        return FetchResult.Success(relevant)
    }
}
