# SETUP.md — Open decisions before `specs/` can be written

Resolved so far (from the pre-project interview):
- **Regulatory scope:** US + EU (long-term). **v1 geographic scope: Irvine, CA + 100km radius (US only).**
- **Flight-zone data source(s) (v1/US):** FAA UAS Facility Maps (LAANC altitude grid) + FAA TFR/NOTAM feed, both free/official, scoped to a bbox around Irvine. Aloft (ex-AirMap) API as commercial fallback if raw FAA integration proves too costly. EU source TBD when EU scope is picked back up.
- **Platform/stack:** Native Android, Kotlin + Jetpack Compose.
- **Offline support:** Deferred for v1 (online-only). Planned as a future addition — architecture should not preclude adding local caching later.

- **Test gate definition:** Unit + emulator/instrumented tests. Fill into `loop.sh`'s default gate and `test_concept.md`.

All open decisions resolved. Next: populate `README.md`'s Job list and `specs/00-system-architecture.md`, then follow `usul.md`.
