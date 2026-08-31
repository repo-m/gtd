package com.two49gmap.app.data.faa

import com.two49gmap.app.domain.BoundingBox
import com.two49gmap.app.domain.FetchResult
import com.two49gmap.app.domain.TfrAdvisory
import kotlinx.coroutines.test.runTest
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

/**
 * Layer 2. Drives [NetworkTfrAdvisoryRepository] against a [MockWebServer] serving the
 * `exportTfrList` shape confirmed live in `10-flight-zone-data.md` — no live FAA calls in
 * the gate.
 */
class NetworkTfrAdvisoryRepositoryTest {

    private lateinit var server: MockWebServer
    private lateinit var repository: NetworkTfrAdvisoryRepository

    private val bbox = BoundingBox(
        minLat = 32.7863,
        maxLat = 34.5829,
        minLon = -118.9051,
        maxLon = -116.7479,
    )

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
        repository = NetworkTfrAdvisoryRepository(FaaServices.tfrApi(server.url("/").toString()))
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun `keeps only CA entries out of the nationwide list and copies their text verbatim`() = runTest {
        server.enqueue(
            jsonResponse(
                """
                [
                  {"notam_id": "6/9187", "type": "HAZARDS", "facility": "ZOA", "state": "CA",
                   "description": "20NM SW KING CITY, CA, Sunday, August 30, 2026 through Sunday, September 13, 2026 UTC",
                   "creation_date": "08/30/2026"},
                  {"notam_id": "6/1111", "type": "VIP", "facility": "ZFW", "state": "TX",
                   "description": "DALLAS, TX", "creation_date": "08/29/2026"},
                  {"notam_id": "6/2222", "type": "SECURITY", "facility": "ZLA", "state": "CA",
                   "description": "LOS ANGELES, CA", "creation_date": "08/28/2026"},
                  {"notam_id": "6/3333", "type": "AIR SHOWS/SPORTS", "facility": "ZNY", "state": "NY",
                   "description": "NEW YORK, NY", "creation_date": "08/27/2026"}
                ]
                """.trimIndent()
            )
        )

        val advisories = repository.getAdvisories(bbox).successOrFail()

        assertEquals(
            listOf(
                TfrAdvisory(
                    notamId = "6/9187",
                    type = "HAZARDS",
                    facility = "ZOA",
                    description = "20NM SW KING CITY, CA, Sunday, August 30, 2026 through Sunday, September 13, 2026 UTC",
                    creationDate = "08/30/2026",
                ),
                TfrAdvisory(
                    notamId = "6/2222",
                    type = "SECURITY",
                    facility = "ZLA",
                    description = "LOS ANGELES, CA",
                    creationDate = "08/28/2026",
                ),
            ),
            advisories,
        )
    }

    @Test
    fun `a nationwide list with no CA entries yields no advisories, not an error`() = runTest {
        server.enqueue(
            jsonResponse(
                """
                [{"notam_id": "6/1111", "type": "VIP", "facility": "ZFW", "state": "TX",
                  "description": "DALLAS, TX", "creation_date": "08/29/2026"}]
                """.trimIndent()
            )
        )

        assertEquals(emptyList<TfrAdvisory>(), repository.getAdvisories(bbox).successOrFail())
    }

    @Test
    fun `a malformed response is an error, never a fabricated advisory`() = runTest {
        server.enqueue(jsonResponse("""{"message": "service unavailable"}"""))

        val result = repository.getAdvisories(bbox)

        assertTrue("Malformed response must not be reported as success, but was $result", result is FetchResult.Error)
    }

    @Test
    fun `an entry missing a specced field is an error, not a partially filled advisory`() = runTest {
        server.enqueue(
            jsonResponse("""[{"notam_id": "6/9187", "type": "HAZARDS", "state": "CA"}]""")
        )

        val result = repository.getAdvisories(bbox)

        assertTrue("An incomplete entry must not be reported as success, but was $result", result is FetchResult.Error)
    }

    @Test
    fun `an HTTP failure is an error`() = runTest {
        server.enqueue(MockResponse().setResponseCode(503))

        val result = repository.getAdvisories(bbox)

        assertTrue("An HTTP failure must not be reported as success, but was $result", result is FetchResult.Error)
    }

    private fun jsonResponse(body: String): MockResponse =
        MockResponse().setHeader("Content-Type", "application/json").setBody(body)

    private fun FetchResult<List<TfrAdvisory>>.successOrFail(): List<TfrAdvisory> = when (this) {
        is FetchResult.Success -> data
        is FetchResult.Error -> throw AssertionError("Expected success, got error: $message", cause)
    }
}
