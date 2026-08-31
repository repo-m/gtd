STATUS: IN PROGRESS

## Steps

- [ ] `domain`: `FlightZone`, `TfrAdvisory` models; `IrvineBbox` constant (four computed values); `ZoneRepository`/`TfrAdvisoryRepository` interfaces — zero Android imports
- [ ] `data.faa`: `FaaUasfmApi` + `NetworkZoneRepository` — paginated fetch (2000/page), `attributes`+`geometry.rings[0]` → `FlightZone`
- [ ] `data.faa`: `FaaTfrApi` + `NetworkTfrAdvisoryRepository` — full fetch, `state == "CA"` filter, verbatim → `TfrAdvisory`
- [ ] Error handling: malformed response → distinct error/empty result per repository; mid-pagination failure → whole fetch fails, no partial grid
- [ ] `BboxTest.kt` (Layer 1)
- [ ] `NetworkZoneRepositoryTest.kt` (Layer 2: pagination loop, malformed response, mid-pagination failure)
- [ ] `NetworkTfrAdvisoryRepositoryTest.kt` (Layer 2: CA filter, malformed response)
- [ ] Gate green: `./gradlew test connectedAndroidTest`
