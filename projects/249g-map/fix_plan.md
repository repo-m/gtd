STATUS: DONE

## Steps

- [x] New Gradle (Kotlin DSL) Android project under `app/` with `ui`/`domain`/`data` stub packages, no Maps/network/location deps
- [x] App launcher label = "249g-map"
- [x] `MainActivity` renders TopAppBar titled "249g-map", empty body
- [x] `PackageBoundaryTest.kt` (Layer 5): `domain/` no `android.*` imports, `ui/` no `data.*` imports
- [x] Instrumented test: launch `MainActivity`, assert "249g-map" text node displayed
- [x] `./gradlew assembleDebug installDebug` succeeds on connected device, app launches without crash
- [x] Gate green: `./gradlew test connectedAndroidTest` — `BUILD SUCCESSFUL`, exit 0

## Resolution history (for context, no longer blocking)

1. **Java Runtime not found**: `/usr/bin/java` is a macOS stub — executable, but exits with
   "Unable to locate a Java Runtime" (no JDK registered via `/usr/libexec/java_home`). An
   interactive-shell `export JAVA_HOME=...` masked this locally but does not survive into the
   automated gate runner's environment (`loop.sh` / launchd), which re-broke the gate on a
   later run. Durable fix, in two parts since `gradlew` itself needs a JVM before Gradle ever
   reads `gradle.properties`:
   - `gradlew`: added a fallback before the JAVA_HOME resolution block — if `JAVA_HOME` is
     unset and `java -version` doesn't actually succeed (not just `command -v java`, since the
     stub passes that check), fall back to the JBR bundled with Android Studio
     (`/Applications/Android Studio.app/Contents/jbr/Contents/Home`).
   - `gradle.properties`: added `org.gradle.java.home` pointing at the same JBR, so the Gradle
     daemon itself is pinned too.
   Verified green with `JAVA_HOME`/`ANDROID_HOME` explicitly unset in the invoking shell.
2. **AGP 9.3.2 built-in Kotlin support**: the `org.jetbrains.kotlin.android` plugin is no
   longer valid under AGP ≥9.0 (it applies Kotlin support itself). Removed
   `alias(libs.plugins.kotlin.android)` from root and `app/build.gradle.kts`, and the
   `kotlin-android` entry from `gradle/libs.versions.toml`. Removed the now-invalid
   `kotlinOptions { jvmTarget = "17" }` block — AGP derives the Kotlin JVM target from the
   existing `compileOptions { sourceCompatibility/targetCompatibility = VERSION_17 }`.
3. **compileSdk too low for resolved dependency versions**: the version catalog's AndroidX/
   Compose versions (core-ktx 1.19.0, compose 1.12.0, activity 1.13.0, etc.) require
   compileSdk 37; project was pinned to 34 (the only platform installed locally). Bumped
   `compileSdk`/`targetSdk` to 37 in `app/build.gradle.kts`. AGP auto-downloaded and
   license-accepted "Android SDK Platform 37.0" during the build (network to Google's Maven/
   SDK repos is reachable from this host; the local `tools/bin/sdkmanager` CLI is broken
   under JDK 25 — `javax.xml.bind` was removed — so manual `sdkmanager` invocation is not an
   option here, but AGP's own auto-install path worked).
4. Disk space, previously a hard blocker (~3.3 GB avail, mid-build `IOException: No space
   left on device`), had been freed by the human to ~4.3 GB avail before this run and held
   (dipped to ~2.4 GB at the low point) for the full `assembleDebug` + `installDebug` +
   `test` + `connectedAndroidTest` sequence. Still tight — worth monitoring on future runs.

## Verified run

```
./gradlew assembleDebug installDebug   # BUILD SUCCESSFUL, installed on "Pixel 11 - 17"
./gradlew test connectedAndroidTest    # BUILD SUCCESSFUL, exit 0
```

No `JAVA_HOME`/`ANDROID_HOME` exported — confirmed with
`env -u JAVA_HOME -u ANDROID_HOME bash -c '...'` to match the automated gate runner's
environment. `sdk.dir` comes from `local.properties`; the JDK now comes from `gradlew`'s
fallback + `gradle.properties`' `org.gradle.java.home` (see resolution history #1).

`PackageBoundaryTest` (unit) and `MainActivityTest` (instrumented, asserts "249g-map" node
displayed) both ran and passed on the connected device/emulator.

One `connectedDebugAndroidTest` run failed transiently with "Failed to install-write all
apks" / "Device failed to uninstall test APK" (UTP/ddmlib install error) despite the device
having ample free space (~136 GB). A manual `adb install -r` of the same APK immediately
after succeeded, and the very next full gate re-run passed cleanly — treated as a one-off
adb/device hiccup, not a project defect. Worth a second look if it recurs.
