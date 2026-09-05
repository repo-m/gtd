package com.two49gmap.app.data.faa

import com.two49gmap.app.domain.BoundingBox
import com.two49gmap.app.domain.FetchResult
import com.two49gmap.app.domain.FlightZone
import com.two49gmap.app.domain.LatLng
import kotlinx.coroutines.test.runTest
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

/**
 * Layer 2. Drives [NetworkZoneRepository] against a [MockWebServer] serving the ArcGIS
 * response shape confirmed live in `10-flight-zone-data.md` — no live FAA calls in the gate.
 */
class NetworkZoneRepositoryTest {

    private lateinit var server: MockWebServer
    private lateinit var repository: NetworkZoneRepository

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
        // FaaLog.None: the repositories log failures through an injected seam, so these
        // tests need no android.util.Log stubbing — they assert on FetchResult instead.
        repository = NetworkZoneRepository(FaaServices.uasfmApi(server.url("/").toString()), FaaLog.None)
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun `maps attributes and rings0 into a FlightZone, converting lon-lat pairs to LatLng`() = runTest {
        server.enqueue(
            jsonResponse(
                """
                {
                  "geometryType": "esriGeometryPolygon",
                  "spatialReference": {"wkid": 4326},
                  "exceededTransferLimit": false,
                  "fields": [{"name": "OBJECTID", "type": "esriFieldTypeOID"}],
                  "features": [
                    {
                      "attributes": {"OBJECTID": 46292, "CEILING": 300, "UNIT": "Feet"},
                      "geometry": {"rings": [[[-117.808348, 33.616672], [-117.808348, 33.625005], [-117.800015, 33.625005], [-117.800015, 33.616672], [-117.808348, 33.616672]]]}
                    }
                  ]
                }
                """.trimIndent()
            )
        )

        val zones = repository.getZones(bbox).successOrFail()

        assertEquals(
            listOf(
                FlightZone(
                    id = 46292,
                    ceilingFeet = 300,
                    polygon = listOf(
                        LatLng(33.616672, -117.808348),
                        LatLng(33.625005, -117.808348),
                        LatLng(33.625005, -117.800015),
                        LatLng(33.616672, -117.800015),
                        LatLng(33.616672, -117.808348),
                    ),
                )
            ),
            zones,
        )
    }

    @Test
    fun `sends the bbox as an esri envelope and the specced page size`() = runTest {
        server.enqueue(jsonResponse(pageOf(featureCount = 0, firstId = 1)))

        repository.getZones(bbox).successOrFail()

        val url = server.takeRequest().requestUrl!!
        assertEquals("-118.9051,32.7863,-116.7479,34.5829", url.queryParameter("geometry"))
        assertEquals("esriGeometryEnvelope", url.queryParameter("geometryType"))
        assertEquals("2000", url.queryParameter("resultRecordCount"))
        assertEquals("0", url.queryParameter("resultOffset"))
    }

    @Test
    fun `pages until a page comes back short and accumulates every page`() = runTest {
        server.enqueue(jsonResponse(pageOf(featureCount = UASFM_PAGE_SIZE, firstId = 1)))
        server.enqueue(jsonResponse(pageOf(featureCount = UASFM_PAGE_SIZE, firstId = 1 + UASFM_PAGE_SIZE)))
        server.enqueue(jsonResponse(pageOf(featureCount = 500, firstId = 1 + 2 * UASFM_PAGE_SIZE)))

        val zones = repository.getZones(bbox).successOrFail()

        assertEquals(2 * UASFM_PAGE_SIZE + 500, zones.size)
        // Every page's features are kept, in order, not just the last page's.
        assertEquals(1, zones.first().id)
        assertEquals(2 * UASFM_PAGE_SIZE + 500, zones.last().id)

        assertEquals(3, server.requestCount)
        val offsets = (1..3).map { server.takeRequest().requestUrl!!.queryParameter("resultOffset") }
        assertEquals(listOf("0", "2000", "4000"), offsets)
    }

    @Test
    fun `a page failing mid-pagination fails the whole fetch, never a truncated grid`() = runTest {
        server.enqueue(jsonResponse(pageOf(featureCount = UASFM_PAGE_SIZE, firstId = 1)))
        server.enqueue(MockResponse().setResponseCode(500))

        val result = repository.getZones(bbox)

        assertTrue(
            "A failed second page must fail the fetch, not return page 1 as if complete, but was $result",
            result is FetchResult.Error,
        )
        assertEquals(2, server.requestCount)
    }

    @Test
    fun `a malformed response is an error, never a fabricated zone`() = runTest {
        server.enqueue(
            jsonResponse("""{"error": {"code": 400, "message": "Invalid or missing input parameters."}}""")
        )

        val result = repository.getZones(bbox)

        assertTrue("Malformed response must not be reported as success, but was $result", result is FetchResult.Error)
    }

    @Test
    fun `a cell that is not in feet is an error rather than a silently coerced ceiling`() = runTest {
        server.enqueue(
            jsonResponse(
                """
                {"features": [
                  {"attributes": {"OBJECTID": 1, "CEILING": 100, "UNIT": "Meters"},
                   "geometry": {"rings": [[[-117.8, 33.6], [-117.8, 33.7], [-117.7, 33.7], [-117.8, 33.6]]]}}
                ]}
                """.trimIndent()
            )
        )

        val result = repository.getZones(bbox)

        assertTrue("A non-feet ceiling must fail loudly, but was $result", result is FetchResult.Error)
    }

    @Test
    fun `a multi-ring cell is an error rather than a silently truncated polygon`() = runTest {
        server.enqueue(
            jsonResponse(
                """
                {"features": [
                  {"attributes": {"OBJECTID": 1, "CEILING": 100, "UNIT": "Feet"},
                   "geometry": {"rings": [
                     [[-117.8, 33.6], [-117.8, 33.7], [-117.7, 33.7], [-117.8, 33.6]],
                     [[-117.6, 33.6], [-117.6, 33.7], [-117.5, 33.7], [-117.6, 33.6]]
                   ]}}
                ]}
                """.trimIndent()
            )
        )

        val result = repository.getZones(bbox)

        assertTrue("A multi-ring cell must fail loudly, but was $result", result is FetchResult.Error)
    }

    private fun jsonResponse(body: String): MockResponse =
        MockResponse().setHeader("Content-Type", "application/json").setBody(body)

    /** A response page of [featureCount] single-ring cells with sequential `OBJECTID`s. */
    private fun pageOf(featureCount: Int, firstId: Int): String =
        (0 until featureCount).joinToString(
            separator = ",",
            prefix = """{"exceededTransferLimit": true, "features": [""",
            postfix = "]}",
        ) { index ->
            val id = firstId + index
            val lon = -117.8 + index * 0.001
            """
            {"attributes": {"OBJECTID": $id, "CEILING": 400, "UNIT": "Feet"},
             "geometry": {"rings": [[[$lon, 33.6], [$lon, 33.61], [${lon + 0.001}, 33.61], [${lon + 0.001}, 33.6], [$lon, 33.6]]]}}
            """.trimIndent()
        }

    private fun FetchResult<List<FlightZone>>.successOrFail(): List<FlightZone> = when (this) {
        is FetchResult.Success -> data
        is FetchResult.Error -> throw AssertionError("Expected success, got error: $message", cause)
    }
}
