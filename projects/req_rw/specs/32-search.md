---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: Search

Search lets the user find text across all visible requirement fields. Matches are highlighted inline; the user can navigate between them.

---

## State (`searchSlice`)

| Field | Type | Meaning |
|-------|------|---------|
| `isVisible` | bool | Whether the search bar is shown |
| `inProgress` | bool | Search is currently running |
| `value` | string | Current search term |
| `results` | array | Flat ordered list of all matches: `{ id, field, start, end, index }` |
| `resultMap` | object | `{ [id]: { [field]: CharRange[] } }` – keyed for fast field lookup |
| `count` | int | Total number of matches |
| `index` | int | Currently highlighted match index (wraps around) |

The slice auto-clears results whenever the content mode changes (`appSetContentMode`) or any file action fires.

---

## Triggering a search

Two actions trigger the search middleware:

1. `searchSetValue(term)` – fired by the search input on every keystroke
2. `searchStart()` – fired when the view mode changes (to re-scan after content change)

Both are handled by `searchMiddleware` in `searchMiddleware.ts`.

---

## Search algorithm

`searchMiddleware` runs in the Redux middleware layer, operating entirely on Redux state:

1. Cancels any previous in-flight invocation.
2. Dispatches `searchClear()`.
3. If the term is empty, finishes immediately.
4. Reads `state.file.requirements` — the flat dictionary of all requirements.
5. For each requirement and each searchable field, runs a plain `String.indexOf` scan on the field's plain-text content.
6. Collects all non-overlapping matches as `{ id, field, start, end }` objects.
7. Dispatches `searchSetResults(matches)` once with the full result set.

No DOM access. Search works regardless of which rows are currently mounted or visible.

---

## Highlighting

Field components (e.g. `RichTextField`) select their matches via `selectSearchResultsByIdField(id, field)`. Matches are passed to `RichTextEditor` as `searchResults`, where `SearchMarkPlugin` wraps matching character ranges in `<SearchMarkNode>`.

For non-rich-text fields, `MarkableText` applies the same highlight via inline rendering.

All `<mark class="search-mark">` elements are hidden by default and revealed only when `View` has the `search-visible` CSS class (applied when `isVisible` is true).

---

## Navigation

`searchMoveIndex(forward)` increments or decrements `index` with wrap-around. `searchSetIndex(n)` jumps directly. The current result at `results[index]` is used to scroll the focused cell into view and apply a distinct "active match" style.

---

## Relevant files

- `app/src/frontend/store/searchSlice.ts`
- `app/src/frontend/store/searchMiddleware.ts`
- `app/src/frontend/components/RichTextEditor/plugins/SearchMarkPlugin/`
- `app/src/frontend/components/MarkableText.tsx`
- `app/src/frontend/components/MenuBar/menuBarData/entryDataSearch.ts`
- `app/src/frontend/View.tsx` – applies `search-visible` CSS class