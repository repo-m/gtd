package com.two49gmap.app.data.faa

import com.two49gmap.app.domain.FlightZone
import com.two49gmap.app.domain.LatLng
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * One page of the Esri ArcGIS `query` response documented in `10-flight-zone-data.md`.
 * `features` has no default: a response missing it (an ArcGIS `{"error": ...}` body, say)
 * is malformed, and must surface as an error rather than as an empty page — which the
 * pagination loop would read as "last page reached".
 */
@Serializable
data class UasfmQueryResponse(
    val features: List<UasfmFeature>,
)

@Serializable
data class UasfmFeature(
    val attributes: UasfmAttributes,
    val geometry: UasfmGeometry,
)

@Serializable
data class UasfmAttributes(
    @SerialName("OBJECTID") val objectId: Int,
    @SerialName("CEILING") val ceiling: Int,
    @SerialName("UNIT") val unit: String,
)

@Serializable
data class UasfmGeometry(
    /** `[ring][vertex][lon, lat]`. Every observed cell is a single simple rectangle. */
    val rings: List<List<List<Double>>>,
)

/** The only unit the FAA feed is specced to report ceilings in. */
private const val CEILING_UNIT_FEET = "Feet"

/**
 * Maps one feature to a [FlightZone]: `rings[0]` is the outer boundary and each of its
 * `[lon, lat]` pairs becomes `LatLng(lat, lon)`.
 *
 * @throws FaaMappingException if the feature violates the shape the spec confirmed live.
 */
fun UasfmFeature.toFlightZone(): FlightZone {
    if (attributes.unit != CEILING_UNIT_FEET) {
        throw FaaMappingException(
            "UASFM cell ${attributes.objectId} reports ceiling unit '${attributes.unit}', expected '$CEILING_UNIT_FEET'"
        )
    }
    if (geometry.rings.size != 1) {
        throw FaaMappingException(
            "UASFM cell ${attributes.objectId} has ${geometry.rings.size} rings, expected exactly 1"
        )
    }
    val polygon = geometry.rings[0].map { point ->
        if (point.size < 2) {
            throw FaaMappingException(
                "UASFM cell ${attributes.objectId} has a vertex with ${point.size} coordinates, expected [lon, lat]"
            )
        }
        LatLng(latitude = point[1], longitude = point[0])
    }
    return FlightZone(
        id = attributes.objectId,
        ceilingFeet = attributes.ceiling,
        polygon = polygon,
    )
}
