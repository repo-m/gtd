package com.two49gmap.app.data.faa

import android.util.Log

/**
 * Where the FAA repositories report a fetch or mapping failure.
 *
 * Injected rather than calling [android.util.Log] straight from the repositories: under
 * plain JVM unit tests `android.jar` is an unimplemented stub, and the only way to make a
 * direct `Log.w` call survive was the module-wide `unitTests.isReturnDefaultValues` switch
 * — which silently no-ops *every* Android method in *every* unit test, present and future.
 * A one-method seam keeps that stubbing down to this one call.
 */
fun interface FaaLog {

    fun warn(message: String, cause: Throwable)

    companion object {
        /** Production: logcat, under [tag]. */
        fun android(tag: String): FaaLog = FaaLog { message, cause -> Log.w(tag, message, cause) }

        /** For unit tests, which assert on the returned [com.two49gmap.app.domain.FetchResult] instead. */
        val None: FaaLog = FaaLog { _, _ -> }
    }
}
