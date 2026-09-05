package com.two49gmap.app.domain

import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Layer 1. Pins the fixed v1 envelope to the four values computed in
 * `10-flight-zone-data.md` ("Bbox constant") from Irvine civic center (33.6846, -117.8265)
 * and a 100km radius. These are safety-relevant: shrinking the box silently drops airspace
 * from the fetch, so any change to them has to be a deliberate spec change, not a typo.
 */
class BboxTest {

    @Test
    fun `IrvineBbox matches the coordinates computed in the spec`() {
        assertEquals(32.7863, IrvineBbox.minLat, 0.0)
        assertEquals(34.5829, IrvineBbox.maxLat, 0.0)
        assertEquals(-118.9051, IrvineBbox.minLon, 0.0)
        assertEquals(-116.7479, IrvineBbox.maxLon, 0.0)
    }
}
