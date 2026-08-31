# Ideas

Unconfirmed — a scratch list, not a commitment. Promote an idea to `backlog.md` once it's actually scoped into concrete steps.

---

# Req.rw — Improvement Analysis
*Generated 2026-06-21 based on deep review of all specs. Moved here from `2026-06-21_improvements.md`; pruned for the "stay lightweight, git-native" direction (dropped the compliance/traceability cluster and other DOORS/Polarion-style items — see git history for the full original list).*

## How to read this document

Each point is classified as **ADD**, **CHANGE**, or **REMOVE**. Points are ordered within each priority tier from most impactful to least. The goal is a genuinely good lightweight, git-mergeable requirements tool — not a DOORS/Polarion competitor.

---

## 1 · CRITICAL — Without these the tool cannot be used professionally

### 1.4 ADD: Column sorting

The table has no sort order other than document order. Professional users must be able to sort by Status, Priority, ID, date, or any custom field to triage work. This is a basic spreadsheet feature that is conspicuously absent.

**What to add:** Clicking a column header cycles: unsorted → ascending → descending. Sort state lives in `appSlice` (not persisted). Multiple-column sort with Shift+click. The `selectFilteredReqList` selector gains a sort step. Document order is preserved — sort is display-only and never mutates the tree.

---

### 1.5 ADD: Bulk field editing across multi-selection

The multi-select spec (30-table-view.md) only covers copy, cut, and delete. Professional workflows require setting a field value across all selected rows — e.g., "mark all 23 selected requirements as Approved". Without this, large-scale status updates are tediously manual.

**What to add:** When `selection.length > 1`, the context menu gains a "Set field…" entry that opens an inline picker. For Enumeration fields: dropdown of allowed values. For String: text input. Dispatches `fileUpdateReq` for each selected id. Undoable as a single undo step (batch).

---

### 1.6 ADD: PDF export

*Trimmed — dropped Word/DOCX export, this overlaps with the print stylesheet (3.6) which gets you PDF for free via the browser's print-to-PDF.*

A requirements document that can only be exported as ReqIF or YAML cannot be shared with stakeholders who are not using the same tool. PDF is the universal document format for formal deliverables (sign-off, review, archival).

**What to add:** `window.print()` against the print stylesheet from 3.6 covers this without a separate export pipeline. Only build a dedicated PDF renderer (e.g. `weasyprint`) if print-to-PDF turns out to be insufficient in practice.

---

### 1.7 ADD: CSV / Excel import

The dominant source of existing requirements in most organizations is a spreadsheet. If you cannot import from CSV/Excel, adoption is blocked at the first onboarding step.

**What to add:** File → Import CSV. A column-mapping dialog lets the user assign spreadsheet columns to .rq fields (ID, heading, text, Status, custom fields). After mapping, requirements are inserted as siblings of the currently focused req or appended to root. Non-matching columns become new custom String fields.

---

### 1.8 ADD: CSV export

Complement to import. Required for round-tripping to/from Excel, feeding other tools, and generating simple reports.

**What to add:** File → Export CSV. Exports the currently filtered/sorted view as a CSV where each row is one requirement and each column corresponds to a visible column. Rich text fields export as plain text.

---

### 1.9 ADD: Auto-save

Currently the only protection against data loss is the user manually pressing Save. This is a professional liability. Every professional tool has auto-save or at minimum crash recovery.

**What to add:** Desktop: write a recovery snapshot to `~/.req_rw/autosave/<filename>.rq` whenever `isDirty` becomes `true` (debounced, 30 s delay, not on every keystroke). On startup, if a recovery file newer than the saved file exists, prompt "Recover unsaved changes?". Web mode: serialize to `localStorage['req_rw.autosave.<id>']`. Auto-save never overwrites the canonical filepath — it only writes to the recovery location.

---

### 1.10 CHANGE: Cross-document paste is blocked — should be allowed

`41-clipboard.md` states that cross-instance paste from a different Req.rw document "is blocked with an error." This is a fundamental obstacle to any workflow that spans multiple documents (e.g., copying a stakeholder need from the ConOps file and pasting it as the basis of a system requirement in the SRS file).

**What to change:** Remove the `APP_IDENTIFIER` equality check. On cross-document paste, assign new IDs (already the `merge = false` path). Show a lightweight notice "Pasted from external document — new IDs assigned." The only remaining guard should be: reject clipboard content that is not Req.rw YAML.

---

## 2 · HIGH — Significantly limits professional usefulness

### 2.1 ADD: Built-in audit metadata fields

*Trimmed — skip full per-requirement `git log` derivation, too heavy. Simpler version below.*

Professional requirements tools track authorship and change history at the requirement level. Currently there is no built-in notion of who created a requirement, when, or who last changed it.

**What to add:** File-level, not per-req: last-modified author/timestamp for the whole document, read cheaply (e.g. `git log -1` on the file, or file mtime if not in a git repo). Skip the per-req id → commit lookup — expensive to compute and maintain correctly as the tree is edited.

---

### 2.2 ADD: Recent files list

`12-session-restore.md` only restores the single most recent file. There is no way to navigate to a previously opened file without knowing its path. Every professional file-handling application has a "Recent Files" list.

**What to add:** `prefs.json` gains a `recent_files: string[]` array (max 10 entries, newest first). File → Recent Files submenu. The no-file empty state shows the recent files list as clickable entries.

---

### 2.3 ADD: Requirement priority field (built-in)

Priority (High / Medium / Low or MoSCoW: Must / Should / Could / Won't) is so universally used in requirements engineering that every professional tool has it as a built-in first-class field — not something the user has to add manually. The current two seeded fields (Status, Category) are good but insufficient.

**What to add:** Seed a third default field `Priority` of type Enumeration with values `[Must, Should, Could, Won't]` (MoSCoW) or `[High, Medium, Low]`. Make it visible in the default view. Users can rename or delete it, just like Status and Category.

---

### 2.4 ADD: Drag-and-drop row reordering

*Real value, but expensive (reparenting logic, HTML5 DnD or pointer-event implementation) — defer until it's an active pain point, not urgent now.*

The tree mutation operations (add sibling, add child, indent, outdent) are accessible only via context menu. This is unusable for restructuring a document with many requirements. Every professional outliner supports drag-and-drop to reorder and nest items.

**What to add:** In the table, a drag handle column (leftmost, thin). Drag a row to reorder it within its parent or reparent it under a new heading. Uses HTML5 drag-and-drop API or a pointer-event implementation. Dispatches `fileImportReq` with `merge = true` (preserves ID). Undoable.

---

### 2.7 ADD: Regex search

*Trimmed — dropped field-scoped mini query language (`Status:Approved AND text:safety`), too much machinery for the value. Regex toggle alone is cheap and worth keeping.*

Current search is `String.indexOf` across all fields combined. A regex mode is a real, low-cost upgrade for power users.

**What to add:** A search mode toggle button: `Exact` / `Regex`. Regex mode wraps the term in `new RegExp(term, 'gi')` with a try/catch for invalid patterns. The existing `searchMiddleware` handles this extension cleanly.

---

### 2.8 ADD: Drag-and-drop file import

Drop a `.rq`, `.reqif`, or `.csv` file onto the application window to open it. This is the most natural way to open files in a desktop application and is expected by every power user.

**What to add:** A `dragover` + `drop` listener on the `Content` wrapper. On `.rq`/`.reqif` drop: calls the existing open pipeline. On `.csv` drop: opens the CSV import dialog pre-populated with the dropped file.

---

### 2.9 CHANGE: Sidebar width not persisted — should be saved to prefs

`31-sidebar.md` says the sidebar width "is local React state (not persisted to Redux or the file)." Every time you reopen the app or change files, the sidebar resets to its default width. This is a minor annoyance that accumulates into a significant friction point.

**What to change:** Save sidebar width to `prefs.json` as a top-level key `sidebar_width`. Restore it on startup. This is a 2-line backend change and a single `api.savePrefs` call on mouse-up.

---

### 2.11 CHANGE: Filters should optionally persist

`35-filter.md` says "Filters are not persisted to workspace prefs in v1. They reset on any file open / new." A professional user who filters to show only unapproved requirements loses that context every time they switch files or restart.

**What to change:** Save the active filter set to `prefs.json` under `file_state[key].filters`. On file open, restore filters along with named views. Add a "clear filters on open" option for users who prefer fresh state.

---

## 3 · MEDIUM — Noticeably improves day-to-day professional workflow

### 3.4 ADD: Spell-check in rich text editor

The Lexical editor (`21-rich-text-editor.md`) does not mention spell-checking. Misspellings in formal requirements documents reflect poorly in audits and reviews.

**What to add:** Enable the browser's native spell-check by setting `spellCheck={true}` on the Lexical content-editable container. This is a one-line change but has large impact for document quality.

---

### 3.6 ADD: Print stylesheet / Print view

Professional requirements documents are printed for formal sign-off, distribution to non-digital stakeholders, and archival. The current app has no print support.

**What to add:** A dedicated print stylesheet (`@media print`) that hides the MenuBar, SideBar, and StatusBar; expands the table to full page width; renders all columns without truncation; adds a header (document title, date, page numbers); removes interactive elements.

---

### 3.7 ADD: Project / workspace concept (multiple .rq files)

*Defer — real value once you actually have several interconnected docs, not urgent now.*

Currently each .rq file exists independently. In real projects, you have multiple interconnected documents: ConOps, SRS, SDD, IRS, test plans. There is no way to define "these 5 files form this project" or navigate between them.

**What to add:** A `~/.req_rw/projects.json` that maps project names to arrays of file paths. A project picker in the "No file open" empty state. A project panel (similar to VS Code's Explorer) listing all files in the project and allowing quick switching.

---

### 3.9 CHANGE: Edit mode gate is too coarse — double-click should always enter edit

`30-table-view.md` states: "Edit mode (the global toggle) must be on for double-click editing to work." Having a separate toggle before you can edit *anything* adds friction that no other professional tool imposes. VS Code does not require you to "enable edit mode" before typing. DOORS does not. Excel does not.

**What to change:** Remove the global edit mode toggle as a prerequisite for cell editing. Double-clicking a cell always enters edit mode for that cell. The "Edit" toggle in the MenuBar can remain as a "read-only mode" lock (for review workflows where you want to prevent accidental edits) but should default to *off* (i.e., editing is allowed by default, not locked).

---

## 4 · NICE TO HAVE — Quality improvements and polish

### 4.2 ADD: Keyboard shortcut for indent / outdent

`64-keyboard-shortcuts.md` covers Ctrl+Z/Y/C/X/V/F/K. Structural editing shortcuts are missing. Tab / Shift+Tab for indent/outdent is universal in outliners.

**What to add:** `Tab` in a focused row (when not in a text editor) → `fileCreateChildReq`-style indent. `Shift+Tab` → outdent. Arrow keys for navigating rows. These should live in the `useGlobalHotkeys` hook with the existing focus guard exemption for `.lexical-editor`.

---

### 4.7 ADD: Keyboard shortcut for new sibling / new child in table

`64-keyboard-shortcuts.md` does not include shortcuts for the most common structural editing operations: adding a new requirement. In every professional outliner, Enter after the last field of a row creates a new sibling.

**What to add:** When a row is focused and not in text-edit mode: `Enter` → `fileCreateNextReq(id)`. `Ctrl+Enter` → `fileCreateChildReq(id)`. `Delete` / `Backspace` → `fileDeleteReq(id)` with a brief undo toast.

---

### 4.9 CHANGE: Sidebar filter should reflect table filters

`35-filter.md` states explicitly: "sidebar, search, clipboard, undo/redo all continue to operate on the unfiltered selectFileReqList." When the user has filtered the table to show only "Approved" requirements, the sidebar still shows all requirements — which is confusing.

**What to change:** Add a sidebar filter mode toggle: "Follow table filter" vs "Always show all". Default to "Follow table filter". When active, `ReqTree` uses `selectFilteredReqList` instead of `selectFileReqList`.

---

## 5 · Structural/architectural notes

### 5.1 CHANGE: `next` field in file format is redundant and fragile

`10-file-management.md` persists `max` (highest id ever assigned) and `next` (always `max + 1`) as separate fields. This is redundant — `next` is always derivable from `max`. More importantly, if a user hand-edits the YAML and gets `next` wrong, it can produce id collisions.

**What to change:** Remove `next` from the persisted format. Always compute it as `max + 1` in `fileToState`. The serializer (`stateToFile`) should not write `next`. Minor breaking change — handle in the loader with a one-time migration (any file missing `next` or where `next !== max + 1` should be corrected silently on load, which is already the fallback behavior).

---

### 5.2 CHANGE: `identifier` UUID not shown to users

`10-file-management.md` assigns every document a UUID `identifier` for ReqIF export and cross-file paste merge detection. But this UUID is never visible to the user. Professional tools expose document identifiers so users can reference documents unambiguously.

**What to change:** Show the document identifier in the Attributes General section (read-only display field below Description). Allow copy-to-clipboard. This is a 3-line UI change with zero backend impact.

---

### 5.4 ADD: Test strategy for integration between features

*(5.3, the root-sentinel leak, moved to `bugs.md` as BUG-009 — it's a bug, not an idea.)*

`test_concept.md` (not reviewed as a spec, but referenced in CLAUDE.md) and various specs have per-spec test requirements. But there is no cross-feature integration test suite. Features like filter + search + sort interacting simultaneously have no coverage.

**What to add:** A dedicated integration test file (`tests/frontend/integration.test.ts`) that tests multi-feature scenarios: filter active while searching, undo after bulk delete with selection active, clipboard paste after column sort.
