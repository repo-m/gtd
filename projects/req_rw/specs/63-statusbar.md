---
updated: 2026-08-23
implemented:
tested:
---

# Spec: StatusBar

The StatusBar is a compact chrome bar pinned to the bottom of the viewport (see `61-app-shell.md`). It displays persistent document context and quick-action affordances.

---

## Content

From left to right:

1. **Sidebar chevron toggle** — a `status-btn` that dispatches `appToggleSidebar`. Icon: `ChevronRightIcon` when sidebar is hidden, `ChevronDownIcon` when visible.
2. **Filename with dirty indicator** — the open filename (basename only). When the document has unsaved changes, a `·` (middle dot, U+00B7) is appended immediately after the name with no space: `"requirements·"`. When the file is clean, only the name is shown: `"requirements"`.
3. **Warning indicator** — `⚠ N fields` button; see below.
4. **Req count** — plain text showing the number of visible requirements; see below.
5. **Search-result navigation** — a pair of `status-btn` buttons, rendered after the warning indicator: "Previous result" (`ChevronLeftIcon`) and "Next result" (`ChevronRightIcon`). Clicking dispatches `searchMoveIndex(false)` / `searchMoveIndex(true)` respectively, moving `state.search.index` to the previous/next match (see `32-search.md` for `count`/`index` semantics). Both buttons are `disabled` when `state.search.count === 0` (no matches to navigate). Each carries a matching `title`/`aria-label`: "Previous result" / "Next result". This is a second entry point for the same navigation exposed by the MenuBar's Home-tab search row (→ `60-menubar.md`); it supplements that row and does not replace it.
6. *(future: word count, event queue, etc.)*

---

## VS Code–style item appearance

StatusBar items must look like VS Code status bar items: borderless text or icons on the chrome background, with a background-color shift on hover only. No box borders, no border-radius on standard items.

```css
.status-btn {
  padding: 0 var(--space-3);
  font-size: var(--font-size-xs);
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--color-text-chrome);
  transition: background-color 80ms ease;
  height: 100%;        /* fill the status bar height for easy click target */
  display: inline-flex;
  align-items: center;
}

.status-btn:hover {
  background: var(--color-bg-hover);
}

.status-btn.is-active {
  background: var(--color-accent);
  color: var(--color-text-on-accent);
}
```

`status-btn` padding and font-size are intentionally smaller than `.menu-btn` — this is a deliberate size distinction for the chrome zone and must not be changed to match the MenuBar buttons.

Plain informational text items (e.g., req count) that are not clickable use `.status-item` instead:

```css
.status-item {
  padding: 0 var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-chrome);
  display: inline-flex;
  align-items: center;
  height: 100%;
}
```

---

## Warning indicator

When `selectAppViewMismatches` returns a non-empty `missingFromFile` list, the StatusBar renders a `status-btn` showing `⚠ N fields` (where N is `missingFromFile.length`). The button is absent from the DOM when the list is empty.

Clicking the button opens a **popover** (`.mismatch-popover`) that:

- Lists the missing field names, one per line (`.mismatch-popover__fields`).
- Contains an **"Edit View →"** button that dispatches `appOpenViewEditor()` (same action as MenuBar → Edit View) and closes the popover.

The popover must be anchored with `right: 0` (right edge of popover aligns to right edge of trigger button) so it opens leftward and stays within the viewport. Using `left: 0` causes the popover to overflow rightward and produce a document-level horizontal scrollbar.

The popover closes when:

- The user presses **Esc**.
- The user clicks anywhere outside the popover and its trigger button.

---

## Req count indicator

When a file is open, the StatusBar renders a `.status-item` showing the number of visible requirements.

- When **no filter is active**: shows `N reqs` (total requirement count).
- When **a filter is active**: shows `N / T reqs` (filtered count / total count). The filter indicator button (spec `35-filter.md`) already handles clearing filters — the req count item is read-only and does not duplicate that affordance.

The count is derived from `selectFilteredDisplayCount` (filtered) and `selectTotalDisplayCount` (total), both already used in the StatusBar for the filter indicator.

When no file is open (`filename === null`), the req count is absent from the DOM.

---

## Dirty indicator: `isDirty` flag

### State

Add `isDirty: boolean` to `AppState` in `appSlice`:

```ts
// initial state
isDirty: false,
```

### When to set / clear

| Event | `isDirty` becomes |
|---|---|
| Any `fileSlice` reducer that mutates document content fires | `true` |
| `fileSave` / `fileSaveAs` completes successfully | `false` |
| `fileInit` (new file or open file replaces state) | `false` |

The flag is set by a listener or extra reducer in `appSlice` that watches `fileSlice` actions, **not** by adding logic inside each `fileSlice` reducer. Use `builder.addMatcher` with a predicate that matches all `fileSlice` action types that mutate content.

Mutating actions (set dirty): all `fileSlice` actions **except** `fileInit` and any read-only selectors.  
Clearing actions (clear dirty): `fileInit`, `fileSave`, `fileSaveAs`.

### Selector

```ts
export const selectAppIsDirty = (state: RootState) => state.app.isDirty;
```

---

## StatusBar styling

The StatusBar uses chrome surface tokens (same as MenuBar and SideBar):

```css
.status-bar {
  background: var(--color-bg-chrome);
  color: var(--color-text-chrome);
  font-size: var(--font-size-sm);
  /* ... existing rules ... */
}
```

The dirty indicator `·` is rendered inline as part of the filename text — no extra element or color change needed. It signals unsaved state without drawing heavy visual attention.

---

## Test requirements

The `isDirty` flag must be covered by a Redux integration test (Layer 2, in `tests/frontend/appSlice.test.ts` or alongside `undoRedo.test.ts`):

- Initial state: `isDirty === false`.
- After dispatching a mutating `fileSlice` action (e.g., `fileCreateNextReq`): `isDirty === true`.
- After dispatching `fileInit`: `isDirty === false`.
- After setting dirty then dispatching `fileSave` completion: `isDirty === false`.

---

## Relevant files

- `app/src/frontend/components/StatusBar.tsx` — dirty indicator, req count, warning popover rendering
- `app/src/frontend/store/appSlice.ts` — `isDirty`, `selectAppIsDirty`, `addMatcher` listener
- `app/src/frontend/styles.css` — `.status-btn`, `.status-item`, `.mismatch-popover`

## Related specs

- `61-app-shell.md` — StatusBar position in the shell layout
- `10-file-management.md` — `fileSave`, `fileInit` actions
- `50-theming.md` — chrome surface tokens
- `35-filter.md` — filter active state and `selectFilteredDisplayCount` / `selectTotalDisplayCount`
- `32-search.md` — `search.count` / `search.index` semantics and `searchMoveIndex` behaviour, underlying the StatusBar's search-result navigation buttons
- `60-menubar.md` — MenuBar's Home-tab search row, the other entry point for search navigation (StatusBar's buttons are additional, not a replacement)
