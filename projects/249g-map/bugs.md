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

---

## BUG-003 — Review gate nits (last-reviewed..HEAD) — **RESOLVED (2026-08-30: fixed nits 1-6 directly — README.md's stale TFR-polygon/not-yet-written text, test_concept.md's bbox-spec pointer, loop.sh's commit attribution, AGENT.md §8's stamping rule, prompt_state.sh's backtick stripping)**

**Files:** see diff range `last-reviewed..HEAD`

**What the code does:**
```
## Review: `last-reviewed..HEAD` (10 commits, project-scoped)

**Specs loaded** (via README's routing index, per the files touched): `specs/10-flight-zone-data.md`, `specs/00-system-architecture.md`, plus `AGENT.md`, `test_concept.md`, `backlog.md`.

**Verification I ran myself**
- `./gradlew test --rerun-tasks` → exit 0, 15 unit tests, 0 failures/errors (`BboxTest` 1, `NetworkZoneRepositoryTest` 7, `NetworkTfrAdvisoryRepositoryTest` 5, pre-existing `PackageBoundaryTest` 2).
- `./gradlew assembleDebugAndroidTest` → exit 0, so the new Retrofit/serialization deps don't break the instrumented build.
- `bash test_prompt_state.sh` → 13/13 pass.
- I could **not** run the `connectedAndroidTest` half of the gate — no device attached here. Nothing in the diff touches `app/src/androidTest/`, and `fix_plan.md` records it green on the `Pixel_3a_API_34_extension_level_7_x86_64` AVD.

**Spec conformance** — checked line by line against `10-flight-zone-data.md`: bbox constant (4 values, pinned by test), UASFM endpoint + all 10 query params, the `size < 2000` pagination loop with full accumulation, `rings[0]` `[lon,lat]` → `LatLng(lat,lon)`, fail-loud on multi-ring / non-`Feet`, TFR full-list fetch with `state == "CA"` and verbatim `description`/`creationDate`, and both error-handling rules (malformed → distinct `FetchResult.Error`, mid-pagination failure → whole fetch fails). `domain` has zero `android.*` imports. All of `PROMPT.md`'s "Out of scope" list stayed untouched — no UI, no ViewModel, no `ZoneLookup`, no Maps SDK. `exceededTransferLimit` was correctly *not* fixed in code and instead filed as BUG-002 + backlog #7, which is the right call under §5/§7.

### Non-blocking nits

1. **`README.md:37` contradicts the TFR decision made in this same batch.** The `20-map-view` entry still reads "`ZoneOverlay` rendering (grid cells + TFR polygons)". `00-system-architecture.md`'s new TFR data-precision note and `backlog.md` #1 both now say UASFM cells only, no TFR polygons. README is the routing index the next agent boots from, so this is the likeliest place for the retracted decision to get re-adopted.
2. **Stale "not yet written" in `README.md`.** The Jobs preamble ("Spec files below are **not yet written**") and 00's `*Does not cover:* ... (→ 10-flight-zone-data, not yet written)` are both false now that the spec exists and is linked two lines above.
3. **`AGENT.md` §8 vs. `00-system-architecture.md`'s blank `implemented`/`tested`.** It's listed in `PROMPT.md` with `STATUS: DONE`, so §8 as written says stamp it; `fix_plan.md`'s out-of-scope section deliberately doesn't, because `MapScreen`/`MapViewModel`/`ZoneLookup`/`DeviceLocationProvider` don't exist yet. I agree the blank state is the honest one — but this has now flipped twice (`a0b998d` stamped it, `da6b8da` cleared it), so it will keep oscillating between review rounds. Amend §8 to say "stamp only specs the task fully implements" and queue it, rather than leaving the rule and the practice disagreeing.
4. **`loop.sh` commit trailers say `Co-Authored-By: Claude Sonnet 4.6`** at both commit sites, while the loop invokes `claude --model opus`. Attribution in git history is wrong.
5. **`test_concept.md:37`** still routes "Bbox constant (Irvine + 100km) coordinate math" to `00-system-architecture`, but the four values and their derivation now live in `10-flight-zone-data.md` — which is where `BboxTest.kt`'s own doc comment points. Adjacent rows in that table were updated in this batch; this one was missed.
6. **`prompt_state.sh:prompt_gate_cmd` strips *every* backtick** on the gate line (`gsub(/`/, "")`), not just fence characters. A gate command legitimately containing a backtick would be silently mangled rather than rejected. Theoretical today, cheap to tighten to leading/trailing only.
```

**What it should do:** Non-blocking — noted by the automated review gate for later cleanup.
