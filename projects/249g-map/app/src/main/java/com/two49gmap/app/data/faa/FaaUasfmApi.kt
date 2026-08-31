package com.two49gmap.app.data.faa

import retrofit2.http.GET
import retrofit2.http.Query

/**
 * FAA UAS Facility Map (LAANC altitude grid), served as a standard Esri ArcGIS REST
 * `query` operation. Endpoint, parameters and response shape are the ones confirmed live
 * in `10-flight-zone-data.md`; the fixed parameters live in the URL, the varying ones
 * (envelope + pagination window) are arguments.
 */
interface FaaUasfmApi {

    @GET(
        "FAA_UAS_FacilityMap_Data/FeatureServer/0/query" +
            "?geometryType=esriGeometryEnvelope" +
            "&inSR=4326" +
            "&spatialRel=esriSpatialRelIntersects" +
            "&outFields=OBJECTID,CEILING,UNIT" +
            "&returnGeometry=true" +
            "&outSR=4326" +
            "&f=json"
    )
    suspend fun query(
        /** `minLon,minLat,maxLon,maxLat`. */
        @Query("geometry") geometry: String,
        @Query("resultOffset") resultOffset: Int,
        @Query("resultRecordCount") resultRecordCount: Int,
    ): UasfmQueryResponse
}
