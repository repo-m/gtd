package com.two49gmap.app.domain

/**
 * One active FAA Temporary Flight Restriction, as plain text. The feed carries no
 * geometry, so this is *advisory only*: it is never mapped to a `FlightZone`, never
 * drawn as an overlay, and never merged into a `ZoneLookup` verdict
 * (`00-system-architecture.md`, TFR data-precision note).
 *
 * `description` and `creationDate` are shown verbatim — v1 never parses coordinates or
 * dates out of the FAA's free text, because doing so would itself be an approximation.
 */
data class TfrAdvisory(
    /** `notam_id` */
    val notamId: String,
    /** `type`, e.g. `HAZARDS`, `SECURITY`, `VIP`. */
    val type: String,
    /** `facility` */
    val facility: String,
    /** `description`, FAA's own wording, verbatim. */
    val description: String,
    /** `creation_date`, raw `MM/DD/YYYY` string, verbatim. */
    val creationDate: String,
)
