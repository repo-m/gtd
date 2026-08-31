# Req.rw: A simple requirement management tool

A Git-native requirements management system that provides a spreadsheet-style grid interface for editing specifications stored locally as linearized YAML and Markdown files. It brings DOORS-style traceability and version control directly into modern developer workflows by making requirements easily mergeable via standard Git branches.

---

## How to use this map

Load only the spec files directly relevant to your active task. Each entry states what the file covers and what it explicitly excludes. Do not load specs that are not needed.

---

## Spec frontmatter convention

Every spec file in `specs/` starts with a YAML frontmatter block:

```yaml
---
updated: 2026-06-20
implemented: 
tested: 
---
```

| Field | Meaning |
|-------|---------|
| `updated` | ISO 8601 date the spec was last edited by the human. |
| `implemented` | ISO 8601 date the feature was confirmed implemented. Set by the agent when writing `STATUS: DONE`. |
| `tested` | ISO 8601 date the implementation was confirmed tested. Set by the agent when writing `STATUS: DONE`. |

**Reset rule:** when the agent modifies a spec file, it sets `updated` to today's date and clears `implemented` and `tested`. When it writes `STATUS: DONE`, it sets `implemented` and `tested` to today's date on all specs listed in PROMPT.md. See AGENT.md §8.

---

## Foundational Specs

Load these when your task touches multiple domains or requires understanding cross-cutting constraints.

- **[`specs/00-system-architecture.md`](specs/00-system-architecture.md)** — System topology, data flow, and component boundaries.
  - *Covers:* Desktop/web runtime split, Python backend routes, React frontend structure, Redux slices (`appSlice`, `fileSlice`, `searchSlice`), build toolchain.
  - *Does not cover:* Feature-level behaviour — see feature specs below.

---

## Job: Manage a document

User goal: open, create, save, and switch between `.rq` requirement files.

- **[`specs/10-file-management.md`](specs/10-file-management.md)** — `.rq` file format, serialisation pipeline, and file I/O operations (new / open / save / saveAs).
  - *Covers:* YAML schema, top-level keys, `Req` data shape, `FieldDef` schema (including `values[]` for Enumeration fields), default seeded fields (`Status`, `Category`) in `getNewFileState()`, `fileToState` / `storeToYaml` pipeline, desktop REST vs browser File API.
  - *Does not cover:* OS dialog mechanics (→ `00-system-architecture`), clipboard serialisation (→ `41-clipboard`).

- **[`specs/11-dual-runtime.md`](specs/11-dual-runtime.md)** — Runtime detection and switching between desktop (pywebview) and browser modes.
  - *Covers:* `config.ts` `isWeb` export, `PythonApi` / `WebApi` selection, Parcel build targets.
  - *Does not cover:* File I/O implementation (→ `10-file-management`), Python backend routes (→ `00-system-architecture`).

- **[`specs/12-session-restore.md`](specs/12-session-restore.md)** — Desktop startup auto-reopens the last-used file (VS Code style).
  - *Covers:* `last_filepath` field in prefs, `getState()` extension, `PythonApi.init()` resolution order (launch arg → last file → empty state), silent fallback on missing file.
  - *Does not cover:* Web mode (always loads demo file), file I/O mechanics (→ `10-file-management`), full prefs schema (→ `13-workspace-prefs`).

- **[`specs/13-workspace-prefs.md`](specs/13-workspace-prefs.md)** — User-specific preferences stored outside `.rq` files (VS Code model).
  - *Covers:* `~/.req_rw/prefs.json` schema, `file_state` keyed by filepath, named view persistence, `GET/POST /api/prefs` routes, `BaseApi.getPrefs` / `saveFileState`, web mode localStorage equivalent, file state lifecycle (load on open, save on change).
  - *Does not cover:* Session restore flow (→ `12-session-restore`), view selector UI (→ `33-views`).

---

## Job: Author requirements

User goal: create, edit, structure, and organise requirements within a document.

- **[`specs/20-requirement-tree.md`](specs/20-requirement-tree.md)** — Array-of-children tree data structure and all mutation operations (add sibling / child, delete, reorder, indent / outdent).
  - *Covers:* `children[]` array model, `updateMeta()`, `level` / `num` computation, `fileCreateNextReq`, `fileCreateChildReq`, `fileDeleteReq`.
  - *Does not cover:* Visual rendering of the tree (→ `31-sidebar`, `30-table-view`), undo/redo mechanics (→ `23-undo-redo`).

- **[`specs/21-rich-text-editor.md`](specs/21-rich-text-editor.md)** — Lexical-based rich text editor for `text` fields.
  - *Covers:* Custom Lexical plugins (`SearchMarkPlugin`, `EditModeEffectPlugin`, `ValueEffectPlugin`, `UpdateEffectPlugin`), read/write mode toggling, value sync.
  - *Does not cover:* Search highlighting trigger (→ `32-search`), field type definitions (→ `22-attributes`).

- **[`specs/22-attributes.md`](specs/22-attributes.md)** — Attributes modal for editing document-level settings: title, prefix, description, and custom fields.
  - *Covers:* `AttributesView` structure, General / Fields sections, OK/Cancel submit pattern, Enumeration value editor (accordion), default seeded fields in new documents.
  - *Does not cover:* Named view switching in the MenuBar (→ `33-views`), column rendering in the table (→ `30-table-view`), view config persistence (→ `13-workspace-prefs`).

- **[`specs/23-undo-redo.md`](specs/23-undo-redo.md)** — 100-step undo/redo history wrapping all `fileSlice` mutations via `history-adapter`.
  - *Covers:* Which reducers are undoable, `fileUndo` / `fileRedo`, `selectFileCanUndo` / `selectFileCanRedo`, stale-focus handling after undo.
  - *Does not cover:* The individual reducers themselves (→ `20-requirement-tree`).

---

## Job: Navigate & find

User goal: browse, filter, and locate requirements within a document.

- **[`specs/30-table-view.md`](specs/30-table-view.md)** — Spreadsheet-style resizable-column table as the primary requirement editing surface.
  - *Covers:* Column rendering, cell focus model, row highlighting, sub-tree selection, footer row creation, `EnumField` component for Enumeration fields, row-level multi-select (selection state, click/shift/ctrl gestures, `.is-selected-row` visual treatment, bulk copy/cut/delete context menu actions).
  - *Does not cover:* Column definitions (→ `22-attributes`), search highlighting (→ `32-search`), bulk field editing across selection (future).

- **[`specs/31-sidebar.md`](specs/31-sidebar.md)** — Collapsible sidebar panel showing the requirement tree as a recursive outline.
  - *Covers:* `ReqTree` / `ReqTreeItem` rendering, disclosure triangles, focus sync, width drag-resize.
  - *Does not cover:* Tree mutation logic (→ `20-requirement-tree`).

- **[`specs/32-search.md`](specs/32-search.md)** — Data-layer full-text scan across all requirement fields, with inline match highlighting and keyboard navigation.
  - *Covers:* `searchSlice`, `searchMiddleware`, `SearchMarkPlugin`, `MarkableText`, match navigation.
  - *Does not cover:* Rich text editor internals (→ `21-rich-text-editor`).

- **[`specs/33-views.md`](specs/33-views.md)** — Two distinct view concepts: content mode (TABLE / RAW / FILE / REGIF) and named column configurations.
  - *Covers:* `appSlice.contentMode`, `appSlice.viewName`, `appSlice.views`, `VIEW_DEFAULT`, `selectAppCurrentView`, column width model (fill vs fixed), named view switching.
  - *Does not cover:* View config storage (→ `13-workspace-prefs`), view editor UI (→ `34-view-editor`), ReqIF XML generation (→ `42-reqif-export`).

- **[`specs/34-view-editor.md`](specs/34-view-editor.md)** — View Editor modal for managing named views and configuring which columns appear in the table.
  - *Covers:* View Editor modal structure, named view create / rename / delete, column add / remove / reorder, `EnumField` column picker, `appAddView` / `appRenameView` / `appDeleteView` actions, immediate-apply persistence pattern.
  - *Does not cover:* View state model (→ `33-views`), prefs persistence layer (→ `13-workspace-prefs`), MenuBar trigger (→ `60-menubar`).

- **[`specs/35-filter.md`](specs/35-filter.md)** — Excel/Sheets-style row filtering: hide rows that don't match per-column conditions.
  - *Covers:* `appSlice.filters` state, `appSetFilter` / `appClearFilter` / `appClearAllFilters` actions, `selectFilteredReqList` selector, filter icon in column headers, `FilterPanel` dropdown (Enum checkbox list + String text-contains), StatusBar "Showing X of Y" indicator.
  - *Does not cover:* Search highlighting (→ `32-search`), view persistence (→ `13-workspace-prefs`).

---

## Job: Share & trace

User goal: reference other requirements, move content across documents, and export to external formats.

- **[`specs/40-links.md`](specs/40-links.md)** — Inter-requirement and external URL links: data format, linkset computation, and `LinkField` UI.
  - *Covers:* Integer / URL / `{label, href}` link formats, `selectFileLinkset`, outward/inward arrows, context menu navigation.
  - *Does not cover:* Cross-document paste merge (→ `41-clipboard`).

- **[`specs/41-clipboard.md`](specs/41-clipboard.md)** — Two-concern clipboard: internal Redux clipboard for lossless in-document copy/paste, and OS clipboard bridge for cross-app interop.
  - *Covers:* Internal `appSlice.clipboard` (`reqIds: number[]` — single or bulk), OS `#user-agent: Req.rw/` YAML format, `storeToSubFile`, merge mode, `APP_MIMETYPE_TEXT_REQ`, clipboard state sync on focus.
  - *Does not cover:* File serialisation pipeline (→ `10-file-management`), requirement tree mutations (→ `20-requirement-tree`), OS clipboard serialisation for multiple reqs (future).

- **[`specs/42-reqif-export.md`](specs/42-reqif-export.md)** — ReqIF 1.2 import and export.
  - *Covers:* `mapToParams`, `ReqIF` builder, XML DOM construction, datatype UUID generation, `parseReqIF`, `reqIfToState`.
  - *Does not cover:* View mode switching (→ `33-views`).

---

## Job: Personalise

User goal: configure the app's appearance and behaviour to personal preference.

- **[`specs/50-theming.md`](specs/50-theming.md)** — Dark / light / system theme toggle, full CSS custom property token system (color, spacing, typography, shape, elevation), and `localStorage` persistence.
  - *Covers:* `appSlice.theme`, `appSetTheme`, `selectAppResolvedTheme`, `data-theme` attribute on `<html>`, `themes.css` token definitions, MenuBar toggle button, `localStorage` bootstrap in `App.tsx`.
  - *Does not cover:* Per-document display settings (→ `22-attributes`), named column views (→ `33-views`).

- **[`specs/51-styling-architecture.md`](specs/51-styling-architecture.md)** — Rules governing how styles are applied across all components: CSS classes for interactive states, token-only values, transitions, focus rings, and hover handling.
  - *Covers:* Ban on inline-style stateful presentation, `.is-focused` / `.is-active` class contract, `:focus-visible` ring, CSS-only hover.
  - *Does not cover:* Token values (→ `50-theming`), icon styling (→ `52-iconography`).

- **[`specs/52-iconography.md`](specs/52-iconography.md)** — SVG icon system: sizes, stroke style, named icon inventory, and accessibility contract.
  - *Covers:* Stroke-only SVG icons, icon sizes by context, named exports from `app/src/frontend/components/Icon/`, `aria-label` rules, replacement of all unicode glyphs.
  - *Does not cover:* Token color definitions (→ `50-theming`).

- **[`specs/53-design-brief.md`](specs/53-design-brief.md)** — The aesthetic direction that `50-theming.md`, `51-styling-architecture.md`, and `52-iconography.md` enforce, made explicit for future audit.
  - *Covers:* VS Code chrome / spreadsheet-grid direction statement and its evidence, minimalism-by-subtraction (content-surface polish vs quiet chrome, `.btn` vs `.menu-btn`), rationale for a single spacing/type scale, micro-state consistency as a named rule (citing `bugs.md`).
  - *Does not cover:* Token values (→ `50-theming`), architecture rules themselves (→ `51-styling-architecture`), icon inventory (→ `52-iconography`).

---

## Job: Navigate the workspace

User goal: operate the application shell — the MenuBar ribbon, sidebar, and status bar.

- **[`specs/60-menubar.md`](specs/60-menubar.md)** — MenuBar ribbon structure: tab layout, group ordering within each tab, toggle button pattern, and sizing tokens.
  - *Covers:* File / Home / View tab content, seven named groups in the Home tab, search row placement, toggle button `.is-active` pattern, **Edit View** button in the View tab, all sizing via `50-theming.md` tokens.
  - *Does not cover:* Search behaviour (→ `32-search`), theme toggle state (→ `50-theming`), icon definitions (→ `52-iconography`), view editor internals (→ `34-view-editor`).

- **[`specs/61-app-shell.md`](specs/61-app-shell.md)** — Viewport-level frame layout: MenuBar pinned top, StatusBar pinned bottom, middle area filling remaining height.
  - *Covers:* `html`/`body`/`#root` sizing, `Content` flex-column structure, middle row `flex: 1` + `min-height: 0` contract, SideBar and View column height rules, no-file panel layout.
  - *Does not cover:* MenuBar content (→ `60-menubar`), sidebar tree rendering (→ `31-sidebar`), table scroll behaviour (→ `30-table-view`).

- **[`specs/62-empty-states.md`](specs/62-empty-states.md)** — What every empty surface shows: no file open, empty document, empty sidebar, no search results.
  - *Covers:* No-file panel with `DocumentIcon` and action buttons, empty-document table row, empty sidebar text, "No matches" search note.
  - *Does not cover:* Table structure (→ `30-table-view`), sidebar structure (→ `31-sidebar`).

- **[`specs/63-statusbar.md`](specs/63-statusbar.md)** — StatusBar content: filename display, dirty/unsaved-changes indicator (`isDirty` flag and `·` suffix), sidebar chevron toggle.
  - *Covers:* `appSlice.isDirty` flag lifecycle (set on any fileSlice mutation, clear on save/init), `selectAppIsDirty` selector, `status-btn` size distinction from `menu-btn`, test requirements for dirty flag.
  - *Does not cover:* StatusBar position in shell layout (→ `61-app-shell`), chrome surface tokens (→ `50-theming`).

- **[`specs/64-keyboard-shortcuts.md`](specs/64-keyboard-shortcuts.md)** — Global keyboard shortcut handler: hook placement, focus guard, modifier normalisation, and shortcut-to-action mapping.
  - *Covers:* `useGlobalHotkeys` hook in `App.tsx`, `isInputFocused` guard (skips `<input>`/`<textarea>`/`.lexical-editor`), Ctrl/Cmd+Z/Y/C/X/V/F/K → Redux action dispatch table.
  - *Does not cover:* Rich-text formatting shortcuts (→ `21-rich-text-editor`), Ctrl+Click / Ctrl+A multi-select (→ `30-table-view`).

- **[`specs/65-command-palette.md`](specs/65-command-palette.md)** — `Ctrl+K` floating modal with fuzzy-searchable app commands and dynamic "Go to requirement" navigation.
  - *Covers:* `appSlice.commandPaletteOpen`, `appOpenCommandPalette` / `appCloseCommandPalette`, `CommandPalette` modal component, static command registry (all actions), dynamic Navigate section (per-requirement entries), `filterCommands` pure function, keyboard nav (arrows/Enter/Escape), accessibility contract.
  - *Does not cover:* Recent-command history, fuzzy ranking (→ substring match only), requirement content search (→ `32-search`), MenuBar button trigger.
