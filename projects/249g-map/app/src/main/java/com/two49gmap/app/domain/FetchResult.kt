package com.two49gmap.app.domain

/**
 * Outcome of a remote fetch. Modelled explicitly rather than as a thrown exception or a
 * bare empty list so that a malformed or failed response is *distinguishable* from a
 * genuinely empty one — per `10-flight-zone-data.md`'s error handling, a data layer that
 * cannot honestly answer must say so and must never fabricate a zone or advisory.
 */
sealed interface FetchResult<out T> {

    data class Success<out T>(val data: T) : FetchResult<T>

    data class Error(val message: String, val cause: Throwable? = null) : FetchResult<Nothing>
}
