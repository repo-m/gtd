# Bug Report: 31-sidebar.md
Date: 2026-06-09
Status: FIXED

## Summary
The resize-handle and Redux state are correct, but both toggle entry points for the sidebar (MenuBar Home tab button and StatusBar chevron button) are missing. The `entryDataSideBar.ts` file referenced by the spec does not exist.

## Bugs

### Bug 1: MenuBar Home tab has no "Sidebar" toggle button
- **Location:** `src/frontend/components/MenuBar.tsx:139-276` (Home tab content row)
- **Issue:** No "Sidebar" button dispatching `appToggleSidebar` exists in the Home tab. The spec-referenced `entryDataSideBar.ts` file is also absent from the codebase.
- **Expected:** A *Sidebar* button in the MenuBar Home tab wired to `appToggleSidebar`, implemented via `entryDataSideBar.ts` per spec §Visibility.
- **Status:** FIXED

### Bug 2: StatusBar missing chevron button for sidebar toggle
- **Location:** `src/frontend/components/StatusBar.tsx:33-67`
- **Issue:** The StatusBar renders filename, edit-mode toggle, and search navigation buttons, but has no chevron (or any) button that dispatches `appToggleSidebar`.
- **Expected:** A chevron button in the status bar that toggles `appSlice.sidebar` via `appToggleSidebar` per spec §Visibility.
- **Status:** FIXED

### Bug 3: `ReqTreeLine.tsx` is absent
- **Location:** `src/frontend/components/SideBar/` (file missing)
- **Issue:** The spec lists `src/frontend/components/SideBar/ReqTreeLine.tsx` as a relevant file, but it does not exist. The `index.ts` exports only `SideBar`, `ReqTree`, and `ReqTreeItem`.
- **Expected:** The file to exist (exact behaviour is unspecified in the spec body, but its omission from the index export and the directory suggests it was never created).
- **Status:** FIXED
