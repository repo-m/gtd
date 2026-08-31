package com.two49gmap.app.data.faa

/**
 * A response parsed as JSON but did not mean what `10-flight-zone-data.md` says it must
 * (e.g. a UASFM cell with more than one ring, or a ceiling in something other than feet).
 * Fail loudly rather than coerce: a silently mis-mapped cell reads to a pilot as
 * "no restriction here".
 */
class FaaMappingException(message: String) : Exception(message)
