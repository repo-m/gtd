---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: Links

Each requirement can have a `links` field – a list of references to other requirements or external URLs. The UI displays these as directional arrow icons in the Links column and supports navigation via a context menu.

---

## Link formats

The `links` array on a requirement can contain three types of entries:

| Format | Example | Meaning |
|--------|---------|---------|
| Integer | `3` | Reference to requirement id 3 in the same file |
| URL string | `"https://example.com"` | External URL |
| Object | `{ label: "REQ-3", href: "req://..." }` | Explicit labeled link |

---

## Linkset computation

`selectFileLinkset` (`fileSliceMemoSelector.ts`) is a memoized selector that iterates all requirements and builds a `linkset` map:

```
{
  [reqId]: {
    out: [{ label, href }, …],   // links this req points to
    in:  [{ label, href }, …],   // links pointing to this req
  }
}
```

For integer links (`req.links = [3]`):
- Adds an `out` entry on the source req: label = `${prefix}-3`, href = `req://${filepath}#${sourceId}`
- Adds an `in` entry on the target req id 3: label = `${prefix}-${sourceId}`

For URL strings: adds an `out` entry only.

For object links: adds the object directly as an `out` entry.

---

## UI: `LinkField`

`app/src/frontend/components/Field/LinkField.js`

Rendered in the Links column of the table. Contains two icons:

- **↗ (LinkArrowUpIcon)** – outward links (green). Visible only if `linkset[id].out` exists.
- **↙ (LinkArrowDownIcon)** – inward links (orange). Visible only if `linkset[id].in` exists.

Both icons are invisible (not hidden, to preserve column width) when no links exist in that direction.

Clicking or right-clicking either icon opens a context menu listing the links for that direction. Each menu item shows the label. If `href` is set, clicking the item opens it in a new browser tab/window (`window.open(href, "_blank")`).

Each clickable icon span carries a native browser tooltip and accessible label:

- `title="Outward links (N)"` and `aria-label="Outward links (N)"` on the `↗` span, where N is the count of outward links.
- `title="Inward links (N)"` and `aria-label="Inward links (N)"` on the `↙` span, where N is the count of inward links.

When N = 0 (the span is in its hidden/invisible state) no `title` or `aria-label` is set.

The icons are rotated 45° via CSS so the arrows point diagonally.

---

## Editing links

When `editMode` is true and a `LinkField` cell is in edit mode (`appSlice.focus.editable === true` for this cell), the cell expands to show an inline link editor beneath the arrow icons.

### Inline link editor layout

```
┌─────────────────────────────────────────┐
│  ↗  REQ-3 ×   REQ-7 ×                  │  ← existing outward links as removable chips
│  ↙  REQ-1 ×                             │  ← existing inward links as removable chips
│  ─────────────────────────────────────  │
│  [ link target...        ] [Add]        │  ← add new link input
└─────────────────────────────────────────┘
```

### Behaviour

**Displaying existing links:**  
Each link in `linkset[id].out` renders as a chip: label text + a remove button (`×`). Inward links (`linkset[id].in`) are shown in a separate row — they are read-only (removing an inward link requires editing the source requirement) so their chips have no remove button. The `↗`/`↙` icon prefix indicates direction.

**Adding a link:**  
The input field accepts an integer requirement ID or a URL string. Pressing Enter or clicking Add validates the input:
- If the value is a valid integer, add it to `req.links` as an integer.
- If the value is a valid URL (`https://...`), add it as a URL string.
- If invalid, show an inline error in `--color-error` beneath the input; do not close the editor.

On valid add: dispatch `fileUpdateReq({ id, field: 'links', value: updatedLinks })` and clear the input.

**Removing a link:**  
Clicking `×` on an outward link chip removes that entry from `req.links` and dispatches `fileUpdateReq`.

**Closing the editor:**  
Clicking outside the cell, pressing Escape, or double-clicking a different cell exits edit mode (standard `appToggleFocus` flow).

### What the Attributes dialog still owns

The Attributes dialog manages link-type *field definitions* (whether a Links field exists and its name), not link values on individual requirements. That responsibility does not change.

---

## Relevant files

- `app/src/frontend/components/Field/LinkField.tsx`
- `app/src/frontend/store/fileSliceMemoSelector.ts` – `selectFileLinkset`
- `app/src/frontend/constants/field_constants.ts` – `FIELD_TYPE_LINKS`