---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: Rich Text Editor

The `text` field of each requirement uses a Lexical-based rich text editor. It supports formatted text and lists, and integrates with the app's edit mode, undo/redo system, and search highlighting.

---

## Component: `RichTextEditor`

`app/src/frontend/components/RichTextEditor/RichTextEditor.tsx`

Wraps `LexicalComposer` with a fixed set of plugins:

| Plugin | Purpose |
|--------|---------|
| `RichTextPlugin` | Core rich text editing (Lexical built-in) |
| `ListPlugin` | Ordered and unordered lists |
| `ValueEffectPlugin` | Syncs the `value` prop into the editor when it changes externally |
| `UpdateEffectPlugin` | Fires a `onChange` callback on every editor state change |
| `EditModeEffectPlugin` | Switches the editor between read-only and editable; calls `onUpdate` with the serialized value when leaving edit mode |
| `SearchMarkPlugin` | Wraps text matching the current search term in `<SearchMarkNode>` nodes |
| `ToggleEmptyClassPlugin` | Adds/removes `editor-empty` CSS class for placeholder visibility |
| `AutoFocusPlugin` | Moves focus to the editor when it becomes editable |

---

## Value format

The value stored in Redux (and serialized to YAML) is the Lexical editor state serialized to a JSON string. It is passed into `ValueEffectPlugin` which calls `editor.setEditorState(editor.parseEditorState(value))` when the value changes.

When the editor loses edit mode, `EditModeEffectPlugin` serializes the current state with `editor.getEditorState().toJSON()` and calls `onUpdate(serialized)`.

---

## Integration with edit mode

`editable` is a prop passed from the field component (e.g. `RichTextField`). It is set to `true` when `appSlice.focus` has `{ id, field, editable: true }` for this cell. The plugin calls `editor.setEditable(editable)` in a `useEffect`.

---

## Search highlighting

`SearchMarkPlugin` receives `searchResults` – the entries from `searchSlice.resultMap[id][field]`. Each result has `{ start, end }` character offsets in the plain-text content. The plugin wraps the matching ranges in `SearchMarkNode` instances (custom Lexical decorator node).

`SearchMarkNode` renders as a `<mark class="search-mark">` element. The CSS in `View.tsx` hides all `.search-mark` elements normally and reveals them only when `.search-visible` is on the parent (set when `searchSlice.isVisible` is true).

---

## Supported formatting

Current active plugins enable:
- Bold, italic, underline (Lexical built-in keyboard shortcuts)
- Ordered and unordered lists (`ListPlugin`)

The `MenuBar` Home tab has formatting buttons wired to Lexical commands via `GlobalEditorContext` (which holds a ref to the currently active editor instance).

---

## Relevant files

- `app/src/frontend/components/RichTextEditor/RichTextEditor.tsx`
- `app/src/frontend/components/RichTextEditor/editorConfig.ts`
- `app/src/frontend/components/RichTextEditor/plugins/EditModeEffectPlugin.tsx`
- `app/src/frontend/components/RichTextEditor/plugins/ValueEffectPlugin.tsx`
- `app/src/frontend/components/RichTextEditor/plugins/UpdateEffectPlugin.tsx`
- `app/src/frontend/components/RichTextEditor/plugins/SearchMarkPlugin/`
- `app/src/frontend/components/GlobalEditorContext/` – global editor ref context