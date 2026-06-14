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

---

## Toggle button pattern

Toggle buttons (Sidebar, Edit, View mode buttons) share one visual pattern:

| State | `background` | `color` |
|---|---|---|
| Inactive | `var(--color-bg)` | `var(--color-text)` |
| Active | `var(--color-bg-selected)` | `var(--color-text)` |

State is expressed via the `.is-active` CSS class (see `51-styling-architecture.md`). No inline `style` conditionals.

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

- `src/frontend/components/MenuBar.tsx` — main component
- `src/frontend/store/appSlice.ts` — `contentMode`, `editMode`, `sidebar`, `theme`, `viewName`
- `src/frontend/store/searchSlice.ts` — `isVisible`
- `src/frontend/components/Icon/` — icon components for Format group and theme toggle

## Related specs

- `32-search.md` — search row that appears below Home tab
- `50-theming.md` — token definitions used for sizing and color
- `52-iconography.md` — icon components used in the Format group
- `51-styling-architecture.md` — toggle button class pattern (`.is-active`)
