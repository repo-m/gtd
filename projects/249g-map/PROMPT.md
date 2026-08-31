# Task

Scaffold a minimal runnable Android app skeleton titled "249g-map".

## Specs to load

- `specs/00-system-architecture.md`

## Acceptance criteria

1. New Gradle (Kotlin DSL) Android project under `app/`, using the `ui` / `domain` / `data` package boundary from `00-system-architecture.md` (stub-empty packages for now — no Maps SDK, networking, or location dependencies added yet).
2. App launcher label (manifest `android:label`) and the in-app top app bar both read exactly "249g-map".
3. `MainActivity` renders a single Compose screen: a `TopAppBar` titled "249g-map" and an empty body. No map, no network call, no location permission request.
4. `PackageBoundaryTest.kt` (Layer 5, `app/src/test/`) asserts `domain/` has zero `android.*` imports and `ui/` has zero `data.*` imports, per the boundary rule in `00-system-architecture.md`.
5. An instrumented test (`app/src/androidTest/`) launches `MainActivity` and asserts a node with text "249g-map" is displayed.
6. `./gradlew assembleDebug installDebug` succeeds against the connected device and the app launches without crashing.

## Done when

`./gradlew test connectedAndroidTest` exits 0 on the connected device.

## Gate command

```
./gradlew test connectedAndroidTest
```

## Out of scope

- Google Maps SDK integration or API key wiring
- FAA network calls / `ZoneRepository` implementation
- Location permission flow / `DeviceLocationProvider`
- `ZoneLookup`, `MapViewModel`, or any `StateFlow` state
- Any UI beyond the title bar (no map, no overlay, no buttons, no bottom sheet)

These belong to later Jobs (`10-flight-zone-data`, `20-map-view`, `21-location`, `22-zone-query`) once their specs are written.
