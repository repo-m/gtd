/**
 * `data` — `NetworkZoneRepository` and other `domain` interface implementations
 * (FAA API clients, device location provider). Per `00-system-architecture.md`'s
 * boundary rule, this package depends only on `domain`.
 *
 * `data.faa` holds the two FAA clients and their repository implementations.
 * `data.location`'s `DeviceLocationProvider` arrives with the `21-location` Job.
 */
package com.two49gmap.app.data
