---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: Command Palette

The Command Palette is a permanent "formula-bar" strip docked directly below the MenuBar, with a `Ctrl+K` shortcut that focuses its filter input. Typing a query opens a dropdown of matching app actions and a dynamically generated "Go to requirement" set. It gives keyboard-first users access to the full action surface without touching the ribbon.

---

## State

One boolean is added to `appSlice`:

| Field | Type | Initial | Meaning |
|-------|------|---------|---------|
| `commandPaletteOpen` | `boolean` | `false` | Whether the palette is in its "activated" state (query reset, input focused) |

Two actions:

| Action | Effect |
|--------|--------|
| `appOpenCommandPalette()` | Sets `commandPaletteOpen = true` |
| `appCloseCommandPalette()` | Sets `commandPaletteOpen = false` |

One selector: `selectAppCommandPaletteOpen(state) → boolean`.

`commandPaletteOpen` does **not** control whether the `CommandPalette` component is rendered or visible — the component is always mounted (see §UI component). Instead, a `useEffect` in `CommandPalette` keyed on `open` (the value of `selectAppCommandPaletteOpen`) runs whenever it flips to `true`: it resets the filter query to `''`, resets the highlighted index to `0`, and calls `inputRef.current?.focus()`. `appCloseCommandPalette()` sets the flag back to `false` (no visible effect by itself, since nothing renders conditionally on it) and also detaches the outside-click listener described in §Close conditions.

`commandPaletteOpen` is **not** cleared by `fileInit` — the palette may be in its "open" state while a file loads.

---

## Trigger

`Ctrl+K` (Cmd+K on macOS) dispatches `appOpenCommandPalette`. This shortcut is added to the existing `useGlobalHotkeys` hook in `app/src/frontend/hooks/useGlobalHotkeys.ts`.

The standard focus guard (`isInputFocused`) applies: if an input, textarea, select, or Lexical editor is focused, the shortcut does nothing. This means pressing `Ctrl+K` while the palette's own filter input is focused will not re-open or close it (the input focus guard fires first).

| Key | Condition | Action |
|-----|-----------|--------|
| `k` | `mod` + no input focus | `dispatch(appOpenCommandPalette())` |

---

## UI component: `CommandPalette`

File: `app/src/frontend/components/CommandPalette/CommandPalette.tsx`

Rendered unconditionally inside `Content.tsx`, directly below `<MenuBar />` and above the `content-middle-row` (`Content.tsx`). There is no conditional mount/unmount and no modal overlay — the strip is part of the normal page flow and is always present whenever a document is loaded.

### Layout

```
┌ MenuBar ───────────────────────────────────────┐
├──────────────────────────────────────────────────┤
│ [filter input ...................................] │  ← .cmd-panel / .cmd-input-row (always visible)
├──────────────────────────────────────────────────┤  ← only rendered while query is non-empty
│  Actions                                          │
│    Undo                     Ctrl+Z                │
│    Redo                     Ctrl+Y                │
│  ────────────────────────────────────────────────│
│  Navigate                                         │
│  ▶ REQ-1  Safety requirement must be met          │
│    REQ-2  The system shall …                      │
│  ────────────────────────────────────────────────│
│  View                                             │
│    Table View                                     │
│    Toggle Sidebar                                 │
└──────────────────────────────────────────────────┘  ← .cmd-results, absolutely positioned dropdown
├ content-middle-row (SideBar / active View) ───────┤
```

- Full-width strip (`.cmd-panel`), docked below the MenuBar; not centered, not fixed-position, no backdrop.
- `.cmd-results` is an absolutely-positioned dropdown anchored to the bottom of the input row (`top: 100%`), so it overlays the content below the strip rather than pushing it down.
- On `commandPaletteOpen` transitioning to `true` (see §State): filter query and highlighted index reset, and focus moves to the filter input via `useEffect` + `inputRef.current.focus()`.
- The results dropdown is scrollable and height-capped (`max-height: 50vh`); the strip itself is a single fixed-height row.

### Filter input

- `<input type="text" placeholder="Type a command or search…">`
- On every keystroke: filters the full command registry using a substring match (see §Matching below).
- Does not dispatch to Redux for the query itself — filter query is local component state (`useState`).
- `onFocus` on the input dispatches `appOpenCommandPalette()` — so clicking into the always-visible input re-triggers the query/highlight reset and re-focus effect described in §State, in addition to whatever focused it in the first place (mouse click or the `Ctrl+K` shortcut).

### Result list

- Rendered only inside `.cmd-results` (see §Result visibility below).
- Grouped by `section` with a plain text section header (not interactive).
- Each result row: label on the left, optional shortcut hint on the right (e.g. `Ctrl+Z`).
- One row is always "highlighted" (keyboard focus). Highlighted row has `.is-active` CSS class.
- Initially the first result in the list is highlighted; highlight resets to `0` whenever the query changes.

### Result visibility

- The `.cmd-results` dropdown is rendered when `query.length > 0` (`showResults = query.length > 0`) — this is independent of `commandPaletteOpen`. An empty query hides the dropdown entirely even while `commandPaletteOpen` is `true`; a non-empty query shows it even if `commandPaletteOpen` is `false`.
- This mirrors the matching algorithm's empty-query behavior (see §Matching): Navigate commands are excluded when the query is empty, so an empty-query dropdown would show static commands only — but the dropdown itself doesn't render at all until there's a query.

### Keyboard navigation

| Key | Effect |
|-----|--------|
| `ArrowDown` | Move highlight down (wrap to first) |
| `ArrowUp` | Move highlight up (wrap to last) |
| `Enter` | Execute highlighted command; close palette |
| `Escape` | Close palette without executing |

### Close conditions

"Close" means dispatching `appCloseCommandPalette()` (sets `commandPaletteOpen = false`); it does not hide the strip, which stays mounted (see §State).

- `Escape` key, while the panel has keyboard focus.
- `Enter` key, after executing the highlighted command.
- Clicking any result row (each row's `onClick` calls `execute(cmd)`, whose `action` closes the palette as part of its effect).
- A `mousedown` anywhere outside `.cmd-panel`, while `commandPaletteOpen` is `true` — a `document`-level listener attached only during that window (`useEffect` keyed on `open`) checks whether the event target is outside `panelRef` and, if so, closes. There is no backdrop element; this listener is what makes outside clicks behave like a close.

---

## Command registry

Built with `useMemo` inside `CommandPalette`. Commands are computed from the current Redux state and dispatch/API references passed as props or obtained via `useSelector` / `useDispatch`.

Each command:

```ts
interface Command {
  id: string;
  label: string;
  section: 'Actions' | 'Navigate' | 'View' | 'Find';
  shortcut?: string;       // display-only hint, e.g. "Ctrl+Z"
  keywords?: string[];     // extra match tokens (not shown)
  action: () => void;      // closes palette then executes
}
```

Every `action` must call `dispatch(appCloseCommandPalette())` before (or after) its primary effect.

### Static commands

#### Section: Actions

| id | label | shortcut | effect |
|----|-------|----------|--------|
| `undo` | Undo | Ctrl+Z | `dispatch(fileUndo())` |
| `redo` | Redo | Ctrl+Y | `dispatch(fileRedo())` |
| `new` | New Document | — | `api.newFile()` |
| `open` | Open Document | — | `api.openFile()` |
| `save` | Save | — | `api.saveFile()` |
| `save-as` | Save As | — | `api.saveFileAs()` |
| `export-reqif` | Export ReqIF | — | `dispatch(appSetContentMode('REGIF'))` |
| `import-reqif` | Import ReqIF | — | `dispatch(appSetContentMode('REGIF'))` |
| `edit-attrs` | Edit Attributes | — | `dispatch(appOpenAttributesModal())` (if modal exists) |
| `add-req` | Add Requirement | — | `dispatch(fileCreateNextReq(...))` |
| `add-child` | Add Child Requirement | — | `dispatch(fileCreateChildReq(...))` |
| `delete-req` | Delete Requirement | — | `dispatch(fileDeleteReq(...))` |
| `copy` | Copy | Ctrl+C | `api.copy(selection, false)`; no-op if `selection` is empty |
| `cut` | Cut | Ctrl+X | `api.cut(selection)`; no-op if `selection` is empty |
| `paste` | Paste | Ctrl+V | `api.paste(focusedId ?? 0, false)`; no-op if the clipboard is empty |

#### Section: View

| id | label | effect |
|----|-------|--------|
| `view-table` | Table View | `dispatch(appSetContentMode('TABLE'))` |
| `view-raw` | Raw JSON View | `dispatch(appSetContentMode('RAW'))` |
| `view-file` | File View | `dispatch(appSetContentMode('FILE'))` |
| `view-reqif` | ReqIF View | `dispatch(appSetContentMode('REGIF'))` |
| `toggle-sidebar` | Toggle Sidebar | `dispatch(appToggleSidebar())` |
| `toggle-edit` | Toggle Edit Mode | `dispatch(appToggleEditMode())` |
| `toggle-theme` | Toggle Theme | `dispatch(appSetTheme(...))` |

#### Section: Find

| id | label | shortcut | effect |
|----|-------|----------|--------|
| `search` | Open Search | Ctrl+F | `dispatch(searchSetVisible(true))` |

### Dynamic commands — Section: Navigate

Built from `selectFileReqList(state)`. For each requirement `req`:

```ts
{
  id: `nav-${req.id}`,
  label: `REQ-${req.id}  ${plainTextPreview(req.content, 60)}`,
  section: 'Navigate',
  keywords: [String(req.id)],
  action: () => { dispatch(appSetFocus(req.id)); dispatch(appCloseCommandPalette()); }
}
```

`plainTextPreview` strips HTML tags from `req.content` and truncates to 60 characters. This is a pure local utility function.

Navigate commands appear after static commands in the result list, but only when the filter query is non-empty (to avoid overwhelming an empty palette with potentially hundreds of rows).

---

## Matching algorithm

Pure function — easy to unit-test:

```ts
function filterCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return commands.filter(c => c.section !== 'Navigate');
  const q = query.toLowerCase();
  return commands.filter(c =>
    c.label.toLowerCase().includes(q) ||
    c.keywords?.some(k => k.toLowerCase().includes(q))
  );
}
```

- Case-insensitive substring match on `label` and each entry in `keywords`.
- When `query` is empty: return all static commands, exclude Navigate commands.
- When `query` is non-empty: return all matching commands from all sections.
- Matching preserves the original section-then-declaration order; no re-ranking.

---

## Styling

- Strip (`.cmd-panel`): `position: relative`, `background: var(--color-bg-chrome)`, `color: var(--color-text-chrome)`, `border-bottom: 1px solid var(--color-border)`. No border-radius, no box-shadow, no backdrop — it's a chrome strip, not a floating panel.
- Input row (`.cmd-input-row`): flex row, `padding: var(--space-1) var(--space-3)`.
- Filter input (`.cmd-input`): full-width (`flex: 1`), no border/outline of its own, transparent background — sits inline inside the strip.
- Results dropdown (`.cmd-results`): `position: absolute`, anchored `top: 100%` / `left: 0` / `right: 0` below the input row, `background: var(--color-bg-chrome)`, `border: 1px solid var(--color-border)` with `border-top: none`, `box-shadow: var(--shadow-popover)`, `max-height: 50vh`, scrollable, slides in via a short `cmd-slide-down` keyframe animation.
- Section header: `font-size: var(--font-size-xs)`, `color: var(--color-text-muted)`, `text-transform: uppercase`, not interactive.
- Result row: `padding: var(--space-1) var(--space-3)`, hover/active via `.is-active` class (never inline style).
- Shortcut hint: `font-size: var(--font-size-xs)`, `color: var(--color-text-muted)`, right-aligned.

---

## Accessibility

- The strip (`.cmd-panel`) currently carries `role="dialog"` and `aria-modal="true"` (in addition to `aria-label="Command Palette"`), inherited from the earlier modal design. Since the element is always mounted and not a modal — it never traps focus, doesn't block interaction with the rest of the page, and is present even when no query is active — these two attributes no longer describe its actual semantics and are a known mismatch between markup and behavior, not a deliberate accessibility feature. `aria-label="Command Palette"` remains accurate.
- Filter input has `aria-label="Filter commands"`.
- Result list has `role="listbox"`; each result row has `role="option"` and `aria-selected` matching the highlighted state. This markup is only present while `.cmd-results` is rendered (query non-empty).
- **Known gap:** there is no focus trap. Tab moves focus out of the strip like any other inline page content; nothing cycles focus back through the input or result list.

---

## What this spec does NOT cover

- Recent / most-used command history
- Levenshtein / fuzzy ranking (substring is sufficient for v1)
- Searching requirement field content (that is `32-search`)
- Adding a Command Palette button to the MenuBar ribbon (keyboard-only trigger is sufficient)
- Command persistence between sessions

---

## Relevant files

- `app/src/frontend/store/appSlice.ts` — `commandPaletteOpen`, `appOpenCommandPalette`, `appCloseCommandPalette`, `selectAppCommandPaletteOpen`
- `app/src/frontend/hooks/useGlobalHotkeys.ts` — `Ctrl+K` entry
- `app/src/frontend/components/CommandPalette/CommandPalette.tsx` — formula-bar strip component
- `app/src/frontend/components/CommandPalette/filterCommands.ts` — pure filter function
- `app/src/frontend/Content.tsx` — renders `<CommandPalette />` below `<MenuBar />`
- `tests/frontend/commandPalette.test.ts` — slice, filter, and hotkey tests

## Related specs

- `64-keyboard-shortcuts.md` — `useGlobalHotkeys` hook; `Ctrl+K` added to shortcut table
- `60-menubar.md` — action labels/titles mirrored in palette labels
- `33-views.md` — `appSetContentMode`, `appSetViewName`
- `32-search.md` — `searchSetVisible` used by Find command
- `23-undo-redo.md` — `fileUndo` / `fileRedo`
- `41-clipboard.md` — `appUpdateClipboard`, `api.copy` / `api.cut` / `api.paste`
