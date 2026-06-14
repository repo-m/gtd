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

## Component: `ReqTree`

`src/frontend/components/SideBar/ReqTree.tsx`

A scrollable container that renders a recursive `ReqTreeItem` starting from `selectFileRoot` (the root req id).

### `ReqTreeItem`

`src/frontend/components/SideBar/ReqTreeItem.tsx`

Renders one requirement node:
- Displays `req.num` and `req.heading` (or a truncated form of `req.text`)
- If `req.children` is non-empty, renders a disclosure triangle (`ChevronDownIcon` when expanded, `ChevronRightIcon` when collapsed — see `52-iconography.md`) and maps over `req.children` to render a `ReqTreeItem` for each child id
- Clicking selects the req (dispatches `appSetFocus`)
- When `req.id` matches `appSlice.focus.id`: background is `var(--color-bg-selected)`, text color is `var(--color-text)`. Do not use `--color-accent` as the selection background — that is reserved for primary action indicators. This keeps visual weight consistent with the focused cell in `TableView`.

---

## Relevant files

- `src/frontend/components/SideBar/index.ts`
- `src/frontend/components/SideBar/ReqTree.tsx`
- `src/frontend/components/SideBar/ReqTreeItem.tsx`
- `src/frontend/components/SideBar/ReqTreeLine.tsx`
- `src/frontend/Content.tsx` – sidebar layout + resize handle
- `src/frontend/store/appSlice.ts` – `appToggleSidebar`, `selectAppSidebar`
