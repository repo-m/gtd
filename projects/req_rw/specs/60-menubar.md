---
updated: 2026-08-23
implemented:
tested:
---

# Feature: MenuBar

The MenuBar is a tabbed ribbon at the top of the application window. It is always visible regardless of which content mode or view is active.

---

## Structure

Two rows:

1. **Tab row** — always visible; contains the three tab labels.
2. **Content row** — the controls for the active tab.

When search is active (`searchSlice.isVisible === true`) and the Home tab is selected, a third **Search row** appears below the content row. See `32-search.md`.

```
┌────────────────────────────────────────────────────────┐
│ File  │ Home  │ View                                   │  ← tab row
├────────────────────────────────────────────────────────┤
│ [controls for active tab]                              │  ← content row
├────────────────────────────────────────────────────────┤
│ [search input]  1/4  ‹  ›          (Home + search only)│  ← search row
└────────────────────────────────────────────────────────┘
```

---

## Tab row

The active tab is indicated by a `2px solid var(--color-accent)` underline on the tab button. Inactive tabs have a `2px solid transparent` underline (same height, no layout shift).

| State | `color` | `font-weight` |
|---|---|---|
| Active | `var(--color-accent)` | `var(--font-weight-semi)` |
| Inactive | `var(--color-text)` | `var(--font-weight-normal)` |

Tab padding: `var(--space-1) var(--space-4)` (2px 12px). Font size: `var(--font-size-sm)`.

---

## File tab

Actions operate on the open document. Three groups separated by `1px solid var(--color-separator)` vertical hairlines:

| Group | Buttons |
|---|---|
| Document | New, Open, Save, Save As |
| Import / Export | Export ReqIF, Import ReqIF |
| Settings | Edit Attributes |

---

## Home tab

Seven named groups, left to right, separated by `1px solid var(--color-separator)` vertical hairlines:

| # | Group | Buttons |
|---|---|---|
| 1 | History | Undo, Redo |
| 2 | Clipboard | Copy, Cut, Paste |
| 3 | Format | `BoldIcon`, `ItalicIcon`, `UnderlineIcon`, `ListOrderedIcon`, `ListUnorderedIcon` |
| 4 | Structure | Add Req, Add Child, Delete Req |
| 5 | View mode | Table, Raw, File, ReqIF (exclusive toggle group — only one active at a time) |
| 6 | Panels | Sidebar, Edit, Search |
| 7 | Preferences | Theme toggle |

Format buttons (group 3) are icon-only with `aria-label`. All others are text labels. See `52-iconography.md`.

The **Search** button in group 6 toggles `searchSlice.isVisible`. It carries `.is-active` when `isVisible` is true. The keyboard shortcut `Ctrl+F` / `Cmd+F` is the primary trigger (see `32-search.md`); the button is the visible affordance for the same action.

Search is not a group. When `searchSlice.isVisible` is true, a separate Search row renders below the content row.

---

## View tab

One group:

| Group | Control |
|---|---|
| Named view | `<select>` listing all named views; dispatches `appSetViewName` on change |
| Named view | **Edit View** button — opens the View Editor modal (see `34-view-editor.md`) |

---

## Toggle button pattern

Toggle buttons (Sidebar, Edit, View mode buttons) share one visual pattern:

| State | `background` | `color` |
|---|---|---|
| Inactive | `var(--color-bg)` | `var(--color-text)` |
| Active | `var(--color-bg-selected)` | `var(--color-text)` |

State is expressed via the `.is-active` CSS class (see `51-styling-architecture.md`). No inline `style` conditionals.

---

## Content row stability

The content row (`.menu-content-row`) must never change height as the user switches tabs:

- `min-height` must be set to a value tall enough to contain the tallest tab's content (use `2.5rem` / `40px` as the floor).
- `flex-wrap: nowrap; overflow: hidden` — on narrow windows the Home tab content must clip rather than reflow onto a second line. Reflowing changes the row height and shifts every element below the MenuBar.

These two rules together guarantee the ribbon zone occupies a fixed vertical extent regardless of which tab is active or how narrow the window is.

---

## Button primitive

All interactive controls in the content row share a single visual base class `.menu-btn`:

```css
.menu-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text-chrome);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 80ms ease;
}
```

Modifier: `.menu-btn--icon` — for icon-only buttons (Format group: Bold, Italic, Underline, …). Fixed square size so they align with text-label buttons:

```css
.menu-btn--icon {
  width: 28px;
  height: 28px;
  padding: 0;
  justify-content: center;
}
```

Rules:
- **Every** button in the MenuBar content row must carry `.menu-btn` (or be a `<select>` styled to match — see View tab below).
- Icon-only buttons must also carry `.menu-btn--icon`.
- Mismatch-banner "Edit View →" button in the View must carry `.menu-btn`. It currently renders as a raw `<button>` with no class; this must be corrected.
- `status-btn` in the StatusBar is intentionally different (smaller padding, chrome zone) and must **not** inherit `.menu-btn`.

---

## View tab `<select>` styling

The native `<select>` dropdown must match `.menu-btn` visually. Apply:

```css
.menu-view-select {
  appearance: none;
  -webkit-appearance: none;
  padding: var(--space-1) var(--space-5) var(--space-1) var(--space-3);
  /* right padding leaves room for the chevron indicator */
  background-image: url("data:image/svg+xml,..."); /* inline chevron-down SVG */
  background-repeat: no-repeat;
  background-position: right var(--space-2) center;
  background-size: 12px;
  /* shared with .menu-btn */
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg);
  color: var(--color-text-chrome);
  cursor: pointer;
}
```

The chevron SVG must be rendered in `currentColor` (or use a fixed token color) so it adapts to dark / light mode. No OS-native dropdown arrow should be visible.

---

## Tooltip / title attribute rule

Every interactive control in the MenuBar content row must carry a `title` attribute that includes the action name and, where a keyboard shortcut exists, the shortcut in parentheses. Format: `"Action Name (Shortcut)"`.

Mandatory coverage:

| Button | `title` value |
|---|---|
| Undo | `"Undo (Ctrl+Z)"` |
| Redo | `"Redo (Ctrl+Y)"` |
| Copy | `"Copy (Ctrl+C)"` |
| Cut | `"Cut (Ctrl+X)"` |
| Paste | `"Paste (Ctrl+V)"` |
| Add Req | `"Add Requirement"` |
| Add Child | `"Add Child Requirement"` |
| Delete Req | `"Delete Requirement"` |
| Bold | `"Bold (Ctrl+B)"` |
| Italic | `"Italic (Ctrl+I)"` |
| Underline | `"Underline (Ctrl+U)"` |
| ListOrdered | `"Ordered List"` |
| ListUnordered | `"Unordered List"` |
| Table | `"Table View"` |
| Raw | `"Raw JSON View"` |
| File | `"File View"` |
| ReqIF | `"ReqIF View"` |
| Sidebar | `"Toggle Sidebar"` |
| Edit | `"Toggle Edit Mode"` |
| Search | `"Search (Ctrl+F)"` |
| Theme toggle | (already has `aria-label` — also add matching `title`) |
| Edit View | `"Edit Named View"` |

---

## Sizing

All sizing uses tokens from `50-theming.md`:

| Property | Token | Value |
|---|---|---|
| Content row padding | `var(--space-2) var(--space-3)` | 4px 8px |
| Button padding | `var(--space-1) var(--space-3)` | 2px 8px |
| Tab padding | `var(--space-1) var(--space-4)` | 2px 12px |
| Gap between groups | `var(--space-3)` | 8px |
| Gap within a group | `var(--space-2)` | 4px |
| Font size | `var(--font-size-sm)` | 12px |
| Separator height | 20px | (inline block) |

---

## Relevant files

- `app/src/frontend/components/MenuBar.tsx` — main component
- `app/src/frontend/store/appSlice.ts` — `contentMode`, `editMode`, `sidebar`, `theme`, `viewName`
- `app/src/frontend/store/searchSlice.ts` — `isVisible`
- `app/src/frontend/components/Icon/` — icon components for Format group and theme toggle

## Related specs

- `32-search.md` — search row that appears below Home tab
- `50-theming.md` — token definitions used for sizing and color
- `52-iconography.md` — icon components used in the Format group
- `51-styling-architecture.md` — toggle button class pattern (`.is-active`)