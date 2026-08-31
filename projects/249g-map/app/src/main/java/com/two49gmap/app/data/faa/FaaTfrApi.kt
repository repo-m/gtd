package com.two49gmap.app.data.faa

import retrofit2.http.GET

/**
 * FAA active-TFR text feed. Takes no bbox: it returns *every* active TFR nationwide as a
 * flat JSON array, unpaginated and unauthenticated (`10-flight-zone-data.md`). Relevance
 * filtering happens client-side, in [NetworkTfrAdvisoryRepository].
 */
interface FaaTfrApi {

    @GET("tfrapi/exportTfrList?format=JSON")
    suspend fun listTfrs(): List<TfrDto>
}
