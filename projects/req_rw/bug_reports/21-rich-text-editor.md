# Bug Report: 21-rich-text-editor.md
Date: 2026-06-09
Status: FIXED

## Summary
The `RichTextEditor` component and all its plugins are correctly implemented. The two gaps are the missing `GlobalEditorContext` (which holds a ref to the active editor) and the absence of formatting buttons in the MenuBar Home tab that depend on it.

## Bugs

### Bug 1: `GlobalEditorContext` is not implemented
- **Location:** `src/frontend/components/GlobalEditorContext/` (directory does not exist)
- **Issue:** The spec lists `src/frontend/components/GlobalEditorContext/` as a required module that holds a React context exposing a ref to the currently active Lexical editor instance. No such directory, file, or context exists anywhere under `src/frontend/`.
- **Expected:** A `GlobalEditorContext` module that exposes the active editor ref so that MenuBar formatting commands can dispatch Lexical commands to the focused editor.
- **Status:** FIXED

### Bug 2: Formatting buttons are missing from MenuBar Home tab
- **Location:** `src/frontend/components/MenuBar.tsx:120-209`
- **Issue:** The Home tab contains only Copy/Cut/Paste, Edit Attributes, Add Req / Add Child / Delete Req, View Mode toggles, and Search. There are no formatting buttons for Bold, Italic, Underline, or list styles. The spec requires these buttons wired to Lexical commands via `GlobalEditorContext`.
- **Expected:** The MenuBar Home tab must include formatting buttons (at minimum Bold, Italic, Underline, ordered/unordered list) that dispatch the corresponding Lexical commands to the currently active editor via `GlobalEditorContext`.
- **Status:** FIXED
