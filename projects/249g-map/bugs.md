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
