---
updated: 2026-08-23
implemented:
tested:
---

# Feature: Sidebar

The sidebar is a collapsible panel on the left side of the main content area. It shows the requirement tree as a nested list, giving a structural overview and quick navigation.

---

## Visibility

Toggled by `appToggleSidebar` (stored in `appSlice.sidebar`). Wired to:
- The *Sidebar* button in the MenuBar Home tab (`entryDataSideBar.ts`)
- The status bar chevron button

---

## Width resizing

When the sidebar is visible, a 1 px `resize-handle` div is rendered immediately to its right (`Content.tsx`). Dragging it updates the sidebar's inline `style.width` / `style.minWidth` via React state:

- Minimum width: 50 px
- Maximum width: 50% of `window.innerWidth`

The width is local React state (not persisted to Redux or the file).

---

## Sidebar header

The sidebar panel must display a compact header row above the tree. This anchors the panel visually (matching VS Code's Explorer header pattern) and provides a resize drag affordance label.

```tsx
<div className="sidebar-header">Structure</div>
```

```css
.sidebar-header {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semi);
  color: var(--color-text-chrome);
  background: var(--color-bg-chrome);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
  user-select: none;
}
```

The header is a sibling of `ReqTree` inside `SideBar`, rendered above it. It must not scroll with the tree.

---

## Focused tree item

When a `ReqTreeItem`'s `req.id` matches `appSlice.focus.id`, its background must be `var(--color-bg-selected)` with `color: var(--color-text)`.

**Critical scoping rule:** The CSS selector for this state must be `.req-tree-line.is-focused`, not the global `.is-focused`. The global `.is-focused` rule applies to table cells (`.table-cell.is-focused`) and must not bleed into the sidebar. Two separate rules are required:

```css
/* table cell focus */
.table-cell.is-focused { background: var(--color-bg-selected); }

/* sidebar tree item focus */
.req-tree-line.is-focused { background: var(--color-bg-selected); color: var(--color-text); }
```

Do **not** use `var(--color-accent)` as the selection background — that token is reserved for primary action indicators (tab underlines, focus rings, links). Using accent color for selection produces a visually dominant blue that misrepresents the interaction weight.

---

## Component: `ReqTree`

`app/src/frontend/components/SideBar/ReqTree.tsx`

A scrollable container that renders a recursive `ReqTreeItem` starting from `selectFileRoot` (the root req id).

### `ReqTreeItem`

`app/src/frontend/components/SideBar/ReqTreeItem.tsx`

Renders one requirement node:
- Displays `req.num` and `req.heading` (or a truncated form of `req.text`)
- If `req.children` is non-empty, renders a disclosure triangle (`ChevronDownIcon` when expanded, `ChevronRightIcon` when collapsed — see `52-iconography.md`) and maps over `req.children` to render a `ReqTreeItem` for each child id
- Clicking selects the req (dispatches `appSetFocus`)
- When `req.id` matches `appSlice.focus.id`: background is `var(--color-bg-selected)`, text color is `var(--color-text)`. Do not use `--color-accent` as the selection background — that is reserved for primary action indicators. This keeps visual weight consistent with the focused cell in `TableView`.

---

## Relevant files

- `app/src/frontend/components/SideBar/index.ts`
- `app/src/frontend/components/SideBar/ReqTree.tsx`
- `app/src/frontend/components/SideBar/ReqTreeItem.tsx`
- `app/src/frontend/components/SideBar/ReqTreeLine.tsx`
- `app/src/frontend/Content.tsx` – sidebar layout + resize handle
- `app/src/frontend/store/appSlice.ts` – `appToggleSidebar`, `selectAppSidebar`