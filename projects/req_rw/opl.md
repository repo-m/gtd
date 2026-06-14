# Open Points List

Tracks all known open bugs and spec gaps. Source of truth for what goes into `PROMPT.md` next.

Status values: `open` · `active` (currently in `PROMPT.md`) · `done`

---

## Styling architecture violations (Spec 51)

| ID | Status | Summary | Task file |
|---|---|---|---|
| BUG-001 | open | `TableView` row/cell focus expressed as inline `background`/`outline` — must use CSS class | [tasks/bug-001.md](tasks/bug-001.md) |
| BUG-002 | open | `ContextMenu` hover via `onMouseEnter`/`onMouseLeave` — must use CSS `:hover` | [tasks/bug-002.md](tasks/bug-002.md) |
| BUG-003 | open | Raw `rgba(0,0,0,0.08)` on resize handle — needs `--color-resize-handle` token | [tasks/bug-003.md](tasks/bug-003.md) |
| BUG-004 | active | `StatusBar.tsx` entirely inline styled — extract `.status-bar` / `.status-btn` CSS classes | [PROMPT.md](PROMPT.md) |
| BUG-005 | open | Scattered raw pixel literals across `TableView`, `ReqTreeLine`, `ContextMenu`, `MenuBar` | [tasks/bug-005.md](tasks/bug-005.md) |

## Other spec violations

| ID | Status | Summary | Task file |
|---|---|---|---|
| BUG-006 | open | `.menu-bar` base `font-size` is `--font-size-md` — should be `--font-size-sm` (Spec 60) | [tasks/bug-006.md](tasks/bug-006.md) |
| BUG-007 | open | Empty-document text missing trailing period (Spec 62) | [tasks/bug-007.md](tasks/bug-007.md) |

---

## Suggested execution order

```
BUG-007  (30 s — one character)
BUG-006  (30 s — one token swap in styles.css)
BUG-004  ← active
BUG-002  (ContextMenu hover — before BUG-005 touches same file)
BUG-003  (resize handle token — isolated)
BUG-001  (TableView focus classes — moderate scope)
BUG-005  (remaining scattered raw values — must follow BUG-002)
```

---

## Spec gaps (closed)

These were holes in the spec; the spec files have been updated to cover them.

| Gap | Resolution |
|---|---|
| `--color-link-out` / `--color-link-in` tokens undocumented | Added to `specs/50-theming.md` with semantic rule |
| Search button in Home tab not in spec | Added to `specs/60-menubar.md` Panels group |
| `strokeWidth` rule for icons > 14 px undefined | Clarified in `specs/52-iconography.md`; `sw()` helper made mandatory |
