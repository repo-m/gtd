# Bug Reports — Styling Architecture Violations

All bugs below are deviations from `51-styling-architecture.md` unless otherwise noted.
File references use `path:line` notation.

---

## BUG-001 — TableView row and cell focus expressed as inline style — **RESOLVED** (2026-08-23: `.is-focused-row`/`.is-focused-cell` classes now used instead)

**Files:** `app/src/frontend/views/TableView/TableView.tsx:153`, `:168`

**Spec rule:** Spec 51 §"CSS classes for interactive states" — focused/selected state must use the `.is-focused` CSS class, not inline `style` conditionals.

**What the code does:**
```tsx
// row (line 153)
style={{ background: isFocusedRow ? 'var(--color-bg-selected)' : isChildOfFocused ? 'var(--color-bg-hover)' : undefined }}

// cell (line 168)
style={{ outline: isFocusedCell ? '2px solid var(--color-border-focus)' : undefined, outlineOffset: '-2px' }}
```

**What it should do:** Apply `.is-focused` (and a sibling class for child-of-focused rows) via `className`, and express all visual states in CSS.

---

## BUG-002 — ContextMenu hover set via `onMouseEnter` / `onMouseLeave` — **RESOLVED** (2026-08-23: handlers removed, hover now CSS-only)

**File:** `app/src/frontend/components/ContextMenu.tsx:72–77`

**Spec rule:** Spec 51 §"Hover states via CSS only" — `onMouseEnter`/`onMouseLeave` handlers that set `style` are not permitted. The third-party-component exception does not apply to a first-party component.

**What the code does:**
```tsx
onMouseEnter={(e) => { if (!item.disabled) (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)'; }}
onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
```

**What it should do:** Remove those handlers and add a CSS rule `.context-menu-item:hover:not(:disabled) { background: var(--color-bg-hover); }`.

---

## BUG-003 — Raw `rgba()` value on the table column resize handle — **RESOLVED** (2026-08-23: no `rgba()` remains in `TableView.tsx`)

**File:** `app/src/frontend/views/TableView/TableView.tsx:108`

**Spec rule:** Spec 51 §"No raw values — tokens only" — raw `rgba()` values are explicitly banned.

**What the code does:**
```tsx
background: 'rgba(0,0,0,0.08)'
```

**What it should do:** Use a token. The closest option is `var(--color-border)` at low opacity — a new token `--color-resize-handle` should be defined in `50-theming.md` if the exact visual weight matters, or the existing `--color-border` should be used directly.

---

## BUG-004 — `StatusBar.tsx` entirely expressed as inline styles — **RESOLVED** (2026-08-23: `StatusBar.tsx` now uses `.status-bar`/`.status-btn` CSS classes)

**File:** `app/src/frontend/components/StatusBar.tsx`

**Spec rule:** Spec 51 §"No raw values — tokens only" and §"CSS classes for interactive states" — static layout and presentation must use CSS classes; inline style is only permitted for genuinely dynamic (drag-computed) values.

**Raw values used:**
| Property | Raw value | Correct token |
|---|---|---|
| `gap` | `8` | `var(--space-3)` |
| `padding` (bar) | `'2px 8px'` | `var(--space-1) var(--space-3)` |
| `fontSize` (bar) | `12` | `var(--font-size-sm)` |
| `minHeight` | `24` | no token — move to CSS |
| `padding` (btn) | `'1px 8px'` | `var(--space-1) var(--space-3)` |
| `fontSize` (btn) | `11` | `var(--font-size-xs)` |
| `borderRadius` (btn) | `3` | `var(--radius-sm)` |

**What it should do:** Extract a `.status-bar` and `.status-btn` CSS class in `styles.css`. Static layout and token-based values move to CSS; nothing remains in `barStyle`/`btnStyle`.

---

## BUG-005 — Scattered raw pixel values across components — **RESOLVED** (already fixed by commit `46c0a92`, "Replace all inline styles and raw pixel literals in TableView, ReqTreeLine, ContextMenu, MenuBar with CSS classes and var(--*) tokens"; verified 2026-08-23 — none of the below remain, `.menu-no-matches`/`.menu-view-select` are real CSS classes, and the only inline `style` left in these files are genuinely dynamic values (`ReqTreeLine.tsx`'s depth-computed `paddingLeft`, `ContextMenu.tsx`'s mouse-position `top`/`left`) which spec 51 explicitly permits)

**Spec rule:** Spec 51 §"No raw values — tokens only".

| File | Location | Raw value | Correct token |
|---|---|---|---|
| `TableView.tsx` | `th` padding | `'4px 8px'` | `var(--space-2) var(--space-3)` |
| `TableView.tsx` | tfoot `padding` | `'8px'` | `var(--space-3)` |
| `TableView.tsx` | tfoot `fontSize` | `12` | `var(--font-size-sm)` |
| `ReqTreeLine.tsx` | num span `marginRight` | `4` | `var(--space-2)` |
| `ContextMenu.tsx` | item `padding` | `'6px 12px'` | `var(--space-1) var(--space-4)` |
| `ContextMenu.tsx` | item `fontSize` | `13` | `var(--font-size-md)` |
| `MenuBar.tsx` | "No matches" span | inline `style` object | CSS class `.menu-no-matches` |
| `MenuBar.tsx` | View tab `label` | `style={{ fontSize: 'var(--font-size-sm)' }}` | CSS class |
| `MenuBar.tsx` | View tab `select` | long inline `style` object | CSS class `.menu-view-select` |

---

## BUG-006 — `.menu-bar` base `font-size` is `--font-size-md` instead of `--font-size-sm` — **RESOLVED** (2026-08-23: `.menu-bar` now uses `--font-size-sm`)

**File:** `app/src/frontend/styles.css:51`

**Spec rule:** Spec 60 §"Sizing" — font size for all MenuBar controls is `var(--font-size-sm)` (12 px).

**What the code does:**
```css
.menu-bar {
  font-size: var(--font-size-md);  /* 13px — wrong */
}
```

**What it should do:** `font-size: var(--font-size-sm)`. Inner controls override this anyway, but the base declaration must match the spec.

---

## BUG-007 — Empty document message missing trailing period — **RESOLVED** (2026-08-23: trailing period present)

**File:** `app/src/frontend/views/TableView/TableView.tsx:135`

**Spec rule:** Spec 62 §"Empty document" quotes the exact string:
> "No requirements yet — double-click here or use Add Req to get started."

**What the code does:**
```tsx
No requirements yet — double-click here or use Add Req to get started
```
(no trailing period)

**What it should do:** Add the period.

---

## BUG-008 — `prefs.write` shallow-merges `file_state` instead of deep-merging (RESOLVED 2026-08-23)

**File:** `app/src/backend/app.py:124-125`

**Spec rule:** Spec 13 (`13-workspace-prefs.md`) says the POST handler "deep-merges" `file_state` keys.

**What the code does:**
```python
merged_file_state = {**current_file_state, **incoming_file_state}
prefs.write({'file_state': merged_file_state})
```
A one-level shallow merge.

**What it should do:** Deep-merge nested `file_state[key]` objects. Currently latent, not a live bug — each caller always sends a fully-formed `FileViewState` object per key, so a shallow merge happens to behave correctly today. It becomes a real bug the moment any caller sends a partial `FileViewState` update.

---

## BUG-009 — Root sentinel requirement id leaks into user-facing surfaces — **RESOLVED** (2026-08-23: fixed the one confirmed leak, `CommandPalette.tsx`'s Navigate section; every other named surface audited and confirmed clean)

**Files:** context menus, link labels, status bar counts, export output (audit not yet done — `selectFilteredDisplayCount` already filters it, not consistently enforced elsewhere)

**What happens:** The root sentinel requirement (the invisible container of all top-level reqs) has a real integer id that can surface in error messages and link computations, even though it should never be visible to the user.

**What it should do:** Audit all user-facing surfaces and ensure the root id is filtered out everywhere, not just in `selectFilteredDisplayCount`.

**Resolution (2026-08-23):** Full audit of every named surface:

- **`CommandPalette.tsx` Navigate section — fixed.** `reqIds.map(...)` (built from `selectFileReqList`, which intentionally includes root) listed root as a selectable `REQ-<rootId>` entry once the palette's query was non-empty. Extracted the nav-command-building logic into a new pure helper, `buildNavCommands.ts` (`components/CommandPalette/`), which filters out `rootId` (read via `state.file.present.root`) before mapping; `CommandPalette.tsx` now calls it. `selectFileReqList` itself is untouched — the fix is at the call site. Regression test added in `commandPalette.test.ts` (`buildNavCommands — root sentinel exclusion`).
- **`StatusBar.tsx` req count — already correct**, confirmed at task start (`selectFilteredDisplayCount`/`selectTotalDisplayCount` both filter root).
- **Sidebar (`SideBar/*.tsx`) — confirmed clean.** `ReqTree.tsx` renders `root.children.map(...)`, never a row for `root` itself; `ReqTreeItem.tsx` has no context menu and is only ever instantiated with a child id.
- **`LinkField.tsx` / `selectFileLinkset` — confirmed unreachable in normal use.** `LinkField` is read-only (icon + popup menu built from precomputed link labels; no link-creation UI exists anywhere in the app), and it's only rendered for `TableView` rows, which already exclude root via `visibleReqIds = filteredReqIds.filter(id => id !== root)`. The only way a `links` array could ever contain the root id as a target is hand-editing a `.rq` file's YAML outside the app (or a crafted ReqIF import) — there is no in-app path (no link picker, `RawStoreView`/`RawFileView` are both read-only `<pre>` dumps) for a user to create such a link. Left as-is per the task's guidance not to add defensive code for an unreachable case.
- **Context menus (`useTableContextMenu.ts`) — confirmed clean.** `menu.reqId` is only ever set from a right-click on a rendered table row, and `TableView.tsx` passes `visibleReqIds` (root already excluded) into the hook — root can never reach a context-menu item.
- **Export output — confirmed clean, working as designed.** ReqIF export (`transform/mapping.ts:209`) explicitly skips `req.id === fileState.root` when building spec objects — root appears only structurally, as the hierarchy root building `children`, never as a visible spec object. `.rq` YAML save (`store/file.ts`'s `stateToFile`/`storeToYaml`) does include the root req as an entry in the `requirements` array plus the `root: <id>` field — this is the documented internal file format (`specs/20-requirement-tree.md:26`), not a "root pretending to be a real requirement" leak.
- **`appSetError` call sites — confirmed clean.** Grepped every call site (`App.tsx`, `Content.tsx`, `MenuBar.tsx`, `BaseApi.ts`, `PythonApi.ts`, `WebApi.ts`); none interpolate a requirement id at all (all messages are static strings or wrap `statusText`/caught errors from I/O operations).

---

## BUG-010 — Review gate nits (commit `337189f`, first-ever 5-commit review pass) — **RESOLVED** (2026-08-23: specs 30/65 now describe the `api.copy`/`api.cut` path; `StatusBar.tsx` reordered to match spec 63; spec 61 frontmatter `updated:` set)

Three documentation-drift findings from the automated review gate's first APPROVE, filed manually — `loop.sh`'s auto-file-to-`bugs.md` step crashed on a bash arithmetic bug (leading-zero `BUG-009` parsed as invalid octal) before it could append these itself; see the `loop.sh` fix in this same commit.

### a. `specs/30-table-view.md:208-209` and `specs/65-command-palette.md:158-159` — stale bulk clipboard description

**What the spec says:** Bulk copy/cut "dispatches `appUpdateClipboard({...})`" directly.

**What the code does now:** Since commit `337189f`, bulk copy/cut call sites (`useGlobalHotkeys.ts`, `useTableContextMenu.ts`, `CommandPalette.tsx`) go through `api.copy`/`api.cut` instead of dispatching `appUpdateClipboard` directly (see `specs/41-clipboard.md`'s corrected description).

**What it should do:** Update both spec passages to match `specs/41-clipboard.md`'s current wording.

### b. `StatusBar.tsx` render order doesn't match `specs/63-statusbar.md`'s Content list

**What the spec says:** Numbered order: 1 sidebar chevron, 2 filename, 3 warning indicator, 4 req count, 5 search nav.

**What the code does:** The req-count `.status-item` renders before the warning-indicator button, reversing items 3 and 4.

**What it should do:** Either reorder the JSX to match the spec, or update the spec's numbered list to match the actual order — whichever is correct is a judgment call for whoever picks this up.

### c. `specs/61-app-shell.md` frontmatter missing `updated:` date

**What happens:** Every other spec file got a date stamp when frontmatter was bulk-added (`ac312e4`); this one was missed — `updated:` is empty.

**What it should do:** Set `updated:` to the date frontmatter was bulk-added, or today's date if backdating isn't meaningful.

---

## BUG-011 — `fileUndo()` can non-deterministically apply only partially when dispatched right after another action

**Found while writing:** `app/tests/e2e/undo-redo.spec.ts` (E2E smoke suite, `backlog.md`).

**Files:** `app/src/frontend/store/fileSlice.ts` (`fileHistoryAdapter`, via the `history-adapter` npm package), `app/src/frontend/hooks/useGlobalHotkeys.ts`, `app/package.json` (dependency versions).

**What happens:** Dispatching `fileUndo()` immediately after another Redux dispatch (observed trigger: clicking a table cell, which dispatches a focus/selection action, then sending `Ctrl+Z` right after) sometimes only partially applies the undo — `state.file.future` gets the popped history entry, but `state.file.past`/`present` don't update to match. A second `Ctrl+Z`/`fileUndo()` dispatch is needed to actually revert. Originally observed as non-deterministic (didn't reproduce every run).

**Investigated 2026-08-23:** The two-bundled-`immer`-copies theory (root `immer@11.1.8` vs. `history-adapter`'s nested `immer@10.2.0`) was tested directly: pinned both to a single `immer@11.1.8` tree-wide via `app/package.json`'s `overrides` field, ran `npm install`, and confirmed with `npm ls immer` that exactly one copy remains. **This did not fix the race.** With the dedupe in place, restoring the natural trigger (click a table cell's first `<td>`, then `Ctrl+Z` immediately) reproduced the partial-apply failure **deterministically — 20/20, then a further 10/10, runs**, up from the original intermittent rate. The workaround in `undo-redo.spec.ts` (toggle the sidebar instead of clicking a cell, to blur the command palette without triggering a table-cell click) was restored and reverts the spec to green.

Since the dedupe alone didn't fix it and the failure is now *more* reproducible than before (moved from occasional to 100%), the immer-dual-instance theory looks wrong, or at best incomplete. A quick look at the two obvious suspects didn't turn up a smoking gun: `TableView`'s cell click handler only dispatches an `appSlice` focus/selection action (nothing touching `state.file`), and `useGlobalHotkeys`'s keydown handler reads `store.getState()` fresh at dispatch time rather than off a stale closure. The actual mechanism is still unknown — likely a genuine ordering/timing issue between the click-triggered React re-render and the immediately-following `fileUndo()` dispatch, independent of which `immer` instance is involved. Needs a fresh investigation, not a re-run of the dedupe fix.

**What it should do:** Root-cause the actual ordering/timing issue (not the immer-instance theory, which is now ruled out) between a table-cell click and an immediately-following `Ctrl+Z`. The `immer` dedupe itself (single `11.1.8` copy tree-wide via `app/package.json`'s `overrides`) is worth keeping regardless — it's a real fix for a genuine peer-range conflict — but does not resolve this bug and should not be presented as doing so.

---

## BUG-012 — Review-gate process nits: `backlog.md` checkboxes left unticked, and raw transcripts filed instead of structured entries — **RESOLVED** (2026-08-23: `backlog.md` fully checked off in commits `91d4bc0`/`b227486`/`dbae59e`; this entry replaces the original two raw dumps)

**Files:** `backlog.md`, `bugs.md`

**What happened:** Two consecutive review-gate APPROVE passes (covering commits through `505688c`) each filed a nit that `backlog.md`'s checkboxes (E2E suite step 5, then all 5 Design-brief-spec steps) were left unticked despite the work being done and verifiable elsewhere — correct findings, since ticking backlog boxes is explicit human bookkeeping, out of scope for the tasks that did the work. Both passes also auto-filed their entire raw review output verbatim as this file's `## BUG-NNN` entry (`loop.sh`'s designed behavior per `AGENT.md` §4a), rather than the terse `Files`/`What it should do` structure every other entry here uses.

**What it should do:** `backlog.md` is now fully ticked. If a future review-gate pass files another raw nit dump, reformat it to match this file's convention rather than leaving the verbatim transcript in place.

---

## BUG-013 — Review gate nits (last-reviewed..HEAD)

**Files:** see diff range `last-reviewed..HEAD`

**What the code does:**
```
All tests pass. Everything in this diff checks out: the BUG-008 deep-merge fix matches spec 13's requirement and is correctly implemented/tested, the doc-drift fixes (specs 30/65 clipboard wording, StatusBar reorder, spec 61 frontmatter) accurately reflect the real code, and bugs.md/backlog.md/fix_plan.md bookkeeping is consistent with the commits. No out-of-scope files touched, both gate commands pass.
```

**What it should do:** Non-blocking — noted by the automated review gate for later cleanup.
