# Bug Reports

Populated by the review gate (`AGENT.md` §4a) and manual review passes. Entry format (from Req.rw):

```
## BUG-NNN — <title> — **STATUS**

**Files:** path:line
**Spec rule:** which spec/section this violates
**What the code does:** ...
**What it should do:** ...
```

Mark `**RESOLVED** (date: how)` in the title line when closed; never delete entries.

## BUG-001 — Gradle JDK path hardcoded to this machine — **OPEN (non-blocking)**

**Files:** `app/../gradle.properties:org.gradle.java.home`, `gradlew` (JBR fallback block)
**Spec rule:** none directly; flagged by review gate on commit `ecd0c84` as a portability nit, not an acceptance-criteria violation.
**What the code does:** `gradle.properties` (a tracked file, not the gitignored `local.properties`) hardcodes `org.gradle.java.home=/Applications/Android Studio.app/Contents/jbr/Contents/Home`. `gradlew`'s JAVA_HOME fallback logic hardcodes the same absolute path.
**What it should do:** Nothing required right now — consistent with this project's existing single-machine-pinned automation (`scheduler.sh`, plist both hardcode `/Users/hm13`). If the project ever needs to build on another machine or CI, add a comment near both hardcoded paths pointing at `local.properties`/`JAVA_HOME` as the escape hatch, or make the fallback probe a few common JBR/JDK install locations instead of one fixed path.

---

## BUG-002 — `exceededTransferLimit` ignored, so a lowered `maxRecordCount` truncates the grid silently — **OPEN (needs a spec change first)**

**Files:** `specs/10-flight-zone-data.md` (pagination algorithm), `app/src/main/java/com/two49gmap/app/data/faa/NetworkZoneRepository.kt`, `app/src/main/java/com/two49gmap/app/data/faa/UasfmDto.kt`
**Spec rule:** `10-flight-zone-data.md`'s stated algorithm — page until `features.size < 2000`, then stop.
**What the code does:** Exactly what the spec says. `NetworkZoneRepository` treats any short page as the last page, and `UasfmQueryResponse` does not even carry ArcGIS's `exceededTransferLimit` flag.
**What it should do:** If the FAA ever lowers that layer's `maxRecordCount` below 2000, page 1 comes back short **with** `exceededTransferLimit: true`, the loop stops early, and the caller gets a silently truncated grid — the exact failure `10-flight-zone-data.md` calls a safety defect, since a missing cell reads to a pilot as "no restriction here". Tighten the spec's algorithm to make `exceededTransferLimit && features.size < pageSize` a hard error (or to drive pagination off the flag rather than off page size), add the field to `UasfmQueryResponse`, and only then change the repository.
**Why it is filed rather than fixed:** raised as a non-blocking nit by the review gate on the `f4c65a2` batch, and the correct fix starts in the spec. `AGENT.md` §7 forbids editing a spec file that `PROMPT.md` did not list for editing, and deviating from the specced algorithm in code alone would put implementation and spec out of sync — the worse of the two. Needs a `backlog.md` spec-revision entry.
