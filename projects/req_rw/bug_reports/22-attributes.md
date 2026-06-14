# Bug Report: 22-attributes.md
Date: 2026-06-09
Status: FIXED

## Summary
The AttributesView implementation is mostly complete and correct. One deviation from the spec was found: the "Edit Attributes" menu entry is placed in the wrong MenuBar tab.

## Bugs

### Bug 1: "Edit Attributes" is in the Home tab, not the File tab
- **Location:** `src/frontend/components/MenuBar.tsx:148`
- **Issue:** The "Edit Attributes" button is rendered inside the `{activeTab === 'Home' && ...}` block (line 124), which means it appears under the **Home** tab.
- **Expected:** The spec requires it to be under the **File** tab: "Triggered from the MenuBar File tab → *Edit Attributes* entry."
- **Status:** FIXED
