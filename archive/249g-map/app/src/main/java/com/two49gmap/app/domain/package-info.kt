/**
 * `domain` — `ZoneRepository` interface, `ZoneLookup`, and domain models. Per
 * `00-system-architecture.md`'s boundary rule, this package takes no Android-specific
 * dependency, which keeps it unit-testable without an emulator.
 *
 * Holds `FlightZone`, `TfrAdvisory`, `LatLng`, `BoundingBox`/`IrvineBbox`, `FetchResult`,
 * and the two repository interfaces. `ZoneLookup` arrives with the `22-zone-query` Job.
 */
package com.two49gmap.app.domain
