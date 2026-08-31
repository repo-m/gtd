package com.two49gmap.app.data.faa

import com.two49gmap.app.domain.TfrAdvisory
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** One entry of `exportTfrList`, exactly as confirmed live in `10-flight-zone-data.md`. */
@Serializable
data class TfrDto(
    @SerialName("notam_id") val notamId: String,
    val type: String,
    val facility: String,
    /** The only structured field usable for bbox relevance — this feed has no geometry. */
    val state: String,
    val description: String,
    @SerialName("creation_date") val creationDate: String,
)

/** Copies the FAA's own text across verbatim: no date parsing, no coordinate extraction. */
fun TfrDto.toTfrAdvisory(): TfrAdvisory = TfrAdvisory(
    notamId = notamId,
    type = type,
    facility = facility,
    description = description,
    creationDate = creationDate,
)
