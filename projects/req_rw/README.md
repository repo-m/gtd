# Req.rw: A simple requirement management tool

A Git-native requirements management system that provides a spreadsheet-style grid interface for editing specifications stored locally as linearized YAML and Markdown files. It brings DOORS-style traceability and version control directly into modern developer workflows by making requirements easily mergeable via standard Git branches.

---

## How to use this map

Load only the spec files directly relevant to your active task. Each entry states what the file covers and what it explicitly excludes. Do not load specs that are not needed.

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
  - *Covers:* YAML schema, top-level keys, `Req` data shape, `fileToState` / `storeToYaml` pipeline, desktop REST vs browser File API.
  - *Does not cover:* OS dialog mechanics (→ `00-system-architecture`), clipboard serialisation (→ `41-clipboard`).

- **[`specs/11-dual-runtime.md`](specs/11-dual-runtime.md)** — Runtime detection and switching between desktop (pywebview) and browser modes.
  - *Covers:* `config.ts` `isWeb` export, `PythonApi` / `WebApi` selection, Parcel build targets.
  - *Does not cover:* File I/O implementation (→ `10-file-management`), Python backend routes (→ `00-system-architecture`).

---

## Job: Author requirements

User goal: create, edit, structure, and organise requirements within a document.

- **[`specs/20-requirement-tree.md`](specs/20-requirement-tree.md)** — Array-of-children tree data structure and all mutation operations (add sibling / child, delete, reorder, indent / outdent).
  - *Covers:* `children[]` array model, `updateMeta()`, `level` / `num` computation, `fileCreateNextReq`, `fileCreateChildReq`, `fileDeleteReq`.
  - *Does not cover:* Visual rendering of the tree (→ `31-sidebar`, `30-table-view`), undo/redo mechanics (→ `23-undo-redo`).

- **[`specs/21-rich-text-editor.md`](specs/21-rich-text-editor.md)** — Lexical-based rich text editor for `text` fields.
  - *Covers:* Custom Lexical plugins (`SearchMarkPlugin`, `EditModeEffectPlugin`, `ValueEffectPlugin`, `UpdateEffectPlugin`), read/write mode toggling, value sync.
  - *Does not cover:* Search highlighting trigger (→ `32-search`), field type definitions (→ `22-attributes`).

- **[`specs/22-attributes.md`](specs/22-attributes.md)** — Attributes modal for editing document-level settings: title, prefix, description, custom fields, and named views.
  - *Covers:* `AttributesView` structure, General / Fields / Views sections, OK/Cancel submit pattern.
  - *Does not cover:* Named view switching in the MenuBar (→ `33-views`), column rendering in the table (→ `30-table-view`).

- **[`specs/23-undo-redo.md`](specs/23-undo-redo.md)** — 100-step undo/redo history wrapping all `fileSlice` mutations via `history-adapter`.
  - *Covers:* Which reducers are undoable, `fileUndo` / `fileRedo`, `selectFileCanUndo` / `selectFileCanRedo`, stale-focus handling after undo.
  - *Does not cover:* The individual reducers themselves (→ `20-requirement-tree`).

---

## Job: Navigate & find

User goal: browse, filter, and locate requirements within a document.

- **[`specs/30-table-view.md`](specs/30-table-view.md)** — Spreadsheet-style resizable-column table as the primary requirement editing surface.
  - *Covers:* Column rendering, cell focus model, row highlighting, sub-tree selection, footer row creation.
  - *Does not cover:* Column definitions (→ `22-attributes`), search highlighting (→ `32-search`).

- **[`specs/31-sidebar.md`](specs/31-sidebar.md)** — Collapsible sidebar panel showing the requirement tree as a recursive outline.
  - *Covers:* `ReqTree` / `ReqTreeItem` rendering, disclosure triangles, focus sync, width drag-resize.
  - *Does not cover:* Tree mutation logic (→ `20-requirement-tree`).

- **[`specs/32-search.md`](specs/32-search.md)** — Data-layer full-text scan across all requirement fields, with inline match highlighting and keyboard navigation.
  - *Covers:* `searchSlice`, `searchMiddleware`, `SearchMarkPlugin`, `MarkableText`, match navigation.
  - *Does not cover:* Rich text editor internals (→ `21-rich-text-editor`).

- **[`specs/33-views.md`](specs/33-views.md)** — Two distinct view concepts: content mode (TABLE / RAW / FILE / REGIF) and named column configurations.
  - *Covers:* `appSlice.contentMode`, `appSlice.viewName`, `VIEW_DEFAULT`, mode constants, column width persistence.
  - *Does not cover:* Editing column definitions (→ `22-attributes`), ReqIF XML generation (→ `42-reqif-export`).

---

## Job: Share & trace

User goal: reference other requirements, move content across documents, and export to external formats.

- **[`specs/40-links.md`](specs/40-links.md)** — Inter-requirement and external URL links: data format, linkset computation, and `LinkField` UI.
  - *Covers:* Integer / URL / `{label, href}` link formats, `selectFileLinkset`, outward/inward arrows, context menu navigation.
  - *Does not cover:* Cross-document paste merge (→ `41-clipboard`).

- **[`specs/41-clipboard.md`](specs/41-clipboard.md)** — Two-concern clipboard: internal Redux clipboard for lossless in-document copy/paste, and OS clipboard bridge for cross-app interop.
  - *Covers:* Internal `appSlice.clipboard`, OS `#user-agent: Req.rw/` YAML format, `storeToSubFile`, merge mode, `APP_MIMETYPE_TEXT_REQ`, clipboard state sync on focus.
  - *Does not cover:* File serialisation pipeline (→ `10-file-management`), requirement tree mutations (→ `20-requirement-tree`).

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
  - *Covers:* Stroke-only SVG icons, icon sizes by context, named exports from `src/frontend/components/Icon/`, `aria-label` rules, replacement of all unicode glyphs.
  - *Does not cover:* Token color definitions (→ `50-theming`).

---

## Job: Navigate the workspace

User goal: operate the application shell — the MenuBar ribbon, sidebar, and status bar.

- **[`specs/60-menubar.md`](specs/60-menubar.md)** — MenuBar ribbon structure: tab layout, group ordering within each tab, toggle button pattern, and sizing tokens.
  - *Covers:* File / Home / View tab content, seven named groups in the Home tab, search row placement, toggle button `.is-active` pattern, all sizing via `50-theming.md` tokens.
  - *Does not cover:* Search behaviour (→ `32-search`), theme toggle state (→ `50-theming`), icon definitions (→ `52-iconography`).

- **[`specs/62-empty-states.md`](specs/62-empty-states.md)** — What every empty surface shows: no file open, empty document, empty sidebar, no search results.
  - *Covers:* No-file panel with `DocumentIcon` and action buttons, empty-document table row, empty sidebar text, "No matches" search note.
  - *Does not cover:* Table structure (→ `30-table-view`), sidebar structure (→ `31-sidebar`).
