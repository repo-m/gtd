---
updated: 2026-08-23
implemented:
tested:
---

# Feature: Filter Rows

Filter lets the user narrow the table to only requirements that match one or more field-level conditions, exactly like column filters in Excel or Google Sheets. Rows that do not satisfy every active filter are hidden from the table. No data is deleted — removing all filters restores the full list.

---

## Scope

- **All columns** in the active view get a filter icon, including the built-in `id`, `content`, and `links` columns.
- **Enumeration fields** — checkbox-style value picker (show/hide rows by value).
- **Boolean fields** — checkbox-style value picker with fixed options: `(blank)`, `true`, `false`.
- **String, Integer, Real, Date, RichText, Links fields** — plain-text "contains" filter (case-insensitive). RichText is filtered against extracted plain text; Links against label text.
- Filter is purely cosmetic: `fileSlice` state is never modified. Only the visible row list changes.
- Filters are **not persisted** to workspace prefs in v1. They reset on any file open / new.

---

## State (`appSlice`)

```ts
type EnumFilter  = { type: 'enum'; include: string[] }
// include: list of values to SHOW. Empty string in the list means "show reqs with no value set".
// An empty include[] shows zero rows.

type TextFilter  = { type: 'text'; value: string }
// value: non-empty string; case-insensitive substring match against the field's plain-text value.

type FieldFilter = EnumFilter | TextFilter

// In AppState:
filters: Record<string, FieldFilter>   // keyed by field name; absent key = no filter on that field
```

New actions in `appSlice`:

| Action | Payload | Effect |
|--------|---------|--------|
| `appSetFilter` | `{ field: string; filter: FieldFilter }` | Upsert `filters[field]` |
| `appClearFilter` | `field: string` | Delete `filters[field]` |
| `appClearAllFilters` | — | Reset `filters` to `{}` |

Filters are cleared (reset to `{}`) in the same extra-reducer that handles `fileInit`. They do not reset when a named view is switched.

---

## Selector: `selectFilteredReqList`

```ts
selectFilteredReqList = createSelector(
  selectFileReqList,
  selectFileRequirements,
  selectAppFilters,
  (state) => state.file.present.fields,
  (ids, requirements, filters, fields) => {
    const activeFilters = Object.entries(filters);
    if (activeFilters.length === 0) return ids;
    const fieldMap = new Map(fields.map((f) => [f.name, f]));
    return ids.filter(id => {
      const req = requirements[id];
      if (!req) return false;
      return activeFilters.every(([field, filter]) => {
        const value = getValueForField(req, field, fieldMap);
        if (filter.type === 'enum') return filter.include.includes(value);
        return value.toLowerCase().includes(filter.value.toLowerCase());
      });
    });
  }
);
```

### Value extraction: `getValueForField`

Built-in fields require special handling since their data is not stored under the column name:

| Field | Source |
|-------|--------|
| `id` | `String(req.id)` |
| `content` | `req.heading` (string) joined with plain text extracted from `req.text` (Lexical JSON) |
| `links` | Link labels joined from `req.links` array (numbers, strings, `{label, href}` objects) |
| Custom `RichText` | Plain text extracted by walking the Lexical JSON node tree |
| Custom `Links` | Link labels joined from the field value array |
| All others | `String(raw)` |

Plain text extraction from Lexical JSON walks all nodes recursively and collects `.text` leaf values.

`TableView` uses `selectFilteredReqList` instead of `selectFileReqList` for its `data` prop. No other consumer changes.

`selectAppFilters` is a plain accessor: `(state: RootState) => state.app.filters`.

---

## Column header UI

Every column in the active view gets a filter button in `<th>`.

```
┌────────┬───────────────────────┬──────────┬──────────────────┐
│ ID ▾   │ Requirements        ▾ │ Status ▾ │ Category ▾       │
├────────┼───────────────────────┼──────────┼──────────────────┤
```

- The filter button is a small `FilterIcon` (funnel shape, 12×12 px stroke icon) placed right of the column label, left of the resize handle.
- Inactive: `color: var(--color-text-muted)`.
- Active (filter set for this field): carries `.is-filtered` CSS class → `color: var(--color-accent)` and `fill: var(--color-accent)` (filled funnel).
- The filter button calls `e.stopPropagation()` to prevent event bubbling to any parent handler.

---

## FilterPanel component

`FilterPanel` is a positioned dropdown anchored to the filter button. It is a `position: fixed` panel, not a modal. At most one `FilterPanel` is open at a time — opening a second one closes the first.

`FilterPanel` accepts `fieldDef: FieldDef | null`. A null `fieldDef` (built-in columns) renders the text-contains variant.

### Enum FilterPanel (`Enumeration` and `Boolean` types)

```
┌─ Filter: Status ────────────────────────┐
│  ☑ (blank)                              │
│  ☑ Open                                 │
│  ☑ In Progress                          │
│  ☐ Closed                               │
│                                         │
│  [Select All]  [Clear All]              │
└─────────────────────────────────────────┘
```

- **Enumeration**: option list is built from `fieldDef.values[]` in display order, plus a leading `(blank)` entry.
- **Boolean**: fixed option list `(blank)`, `true`, `false`.
- **Initial checked state** when opening:
  - If `filters[field]` is absent: all options checked.
  - If `filters[field]` exists: only the values in `include[]` are checked.
- **On any checkbox change:**
  - If all options are now checked: dispatch `appClearFilter(field)`.
  - Otherwise: dispatch `appSetFilter({ field, filter: { type: 'enum', include: [...checkedValues] } })`.
  - Filter takes effect immediately — no Apply button.
- **Select All** — check all → `appClearFilter(field)`.
- **Clear All** — uncheck all → `appSetFilter({ field, filter: { type: 'enum', include: [] } })`.

### Text FilterPanel (all other types)

```
┌─ Filter: Category ──────────────────────┐
│  Contains: [___________________]        │
└─────────────────────────────────────────┘
```

Applies to: `String`, `Integer`, `Real`, `Date`, `RichText`, `Links`, and the built-in `id`, `content`, `links` columns.

- Single `<input type="text" />` with placeholder `"Contains…"`.
- Initialized from `filters[field].value` if present, else `""`.
- On every keystroke:
  - Empty value → dispatch `appClearFilter(field)`.
  - Non-empty → dispatch `appSetFilter({ field, filter: { type: 'text', value } })`.
- No debounce required by spec (implementation may add one).

### Panel close behaviour

The `FilterPanel` closes when:
1. The user presses **Escape**.
2. A `mousedown` event fires outside both the panel and its trigger `FilterIcon` button.
3. Another `FilterIcon` button is clicked (new panel opens, old closes).

---

## StatusBar filter indicator

When `Object.keys(filters).length > 0`, the `StatusBar` renders an additional `status-btn` after the edit-mode toggle:

```
› requirements·   [Editing]   [Showing 12 of 47]   [⚠ 2 fields]
```

- Label: `Showing X of Y` where X = filtered row count, Y = total row count (both exclude the root node).
- Clicking dispatches `appClearAllFilters()` — acts as a quick "clear all filters" shortcut.
- `title` attribute: `"Clear all filters"`.
- When no filters are active, the button is absent from the DOM.

New selectors:

```ts
selectAppIsFiltering      = (state) => Object.keys(state.app.filters).length > 0
selectFilteredDisplayCount = createSelector(root, selectFilteredReqList, (root, list) => list.filter(id => id !== root).length)
selectTotalDisplayCount    = createSelector(root, selectFileReqList,     (root, list) => list.filter(id => id !== root).length)
```

---

## Behaviour notes

- **Multi-field filters are AND-combined**: a row must satisfy every active filter to be shown.
- **No special treatment for headings**: a heading row is filtered exactly like any other row.
- **Children of hidden parents remain in the DFS flat list**: if a heading is hidden by a filter but its children match, the children still appear.
- **Selection and focus are not cleared when filters change**: selected/focused req ids may refer to rows hidden by a filter — that is acceptable.
- **`selectFilteredReqList` is the sole change to data flow**: sidebar, search, clipboard, undo/redo all continue to operate on the unfiltered `selectFileReqList`.

---

## Test requirements

Layer 1 — unit selector tests (`tests/frontend/filter.test.ts`):

1. `selectFilteredReqList` with no active filters returns the full DFS list unchanged.
2. Enum filter `{ include: ['Open'] }` hides rows where `Status !== 'Open'`.
3. Enum filter `{ include: [''] }` shows only rows with no value for that field.
4. Enum filter `{ include: [] }` returns an empty list.
5. Text filter `{ value: 'foo' }` hides rows where the field value does not contain `'foo'` (case-insensitive).
6. Empty text filter value (should not be stored — `appClearFilter` is dispatched instead).
7. Two active filters (AND): only rows satisfying both are returned.
8. `appSetFilter` / `appClearFilter` / `appClearAllFilters` reducer tests.
9. Filters reset to `{}` on `fileInit`.

---

## Relevant files

- `app/src/frontend/store/appSlice.ts` — `filters`, `appSetFilter`, `appClearFilter`, `appClearAllFilters`, `selectAppFilters`, `selectAppIsFiltering`
- `app/src/frontend/store/fileSliceMemoSelector.ts` — `selectFilteredReqList`, `selectFilteredDisplayCount`, `selectTotalDisplayCount`
- `app/src/frontend/views/TableView/TableView.tsx` — uses `selectFilteredReqList`; renders `FilterIcon` button in every `<th>`
- `app/src/frontend/components/FilterPanel/FilterPanel.tsx` — dropdown panel (Enum/Boolean checkbox variant and text-contains variant)
- `app/src/frontend/components/Icon/icons.tsx` — `FilterIcon` (funnel SVG)
- `app/src/frontend/components/StatusBar.tsx` — "Showing X of Y" indicator

## Related specs

- `30-table-view.md` — column header structure and resize handle (filter button sits left of handle)
- `33-views.md` — `selectAppCurrentView` and `FieldDef` consumed by FilterPanel
- `63-statusbar.md` — StatusBar content ordering and `status-btn` pattern
- `32-search.md` — complementary feature; operates independently of filters
