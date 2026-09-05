package com.two49gmap.app.data.faa

import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

/**
 * Manual Retrofit wiring for the two FAA feeds — no DI framework in v1, per
 * `00-system-architecture.md`. Base URLs are overridable so tests can point the same
 * production configuration (including the JSON leniency settings) at a local server.
 */
object FaaServices {

    const val UASFM_BASE_URL =
        "https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/arcgis/rest/services/"

    const val TFR_BASE_URL = "https://tfr.faa.gov/"

    /** Both feeds carry more fields than we map; unknown ones are ignored, missing ones are not. */
    private val json = Json { ignoreUnknownKeys = true }

    fun uasfmApi(baseUrl: String = UASFM_BASE_URL): FaaUasfmApi =
        retrofit(baseUrl).create(FaaUasfmApi::class.java)

    fun tfrApi(baseUrl: String = TFR_BASE_URL): FaaTfrApi =
        retrofit(baseUrl).create(FaaTfrApi::class.java)

    private fun retrofit(baseUrl: String): Retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
}
