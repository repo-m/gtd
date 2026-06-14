# Bug Reports — Styling Architecture Violations

All bugs below are deviations from `51-styling-architecture.md` unless otherwise noted.
File references use `path:line` notation.

---

## BUG-001 — TableView row and cell focus expressed as inline style

**Files:** `src/frontend/views/TableView/TableView.tsx:153`, `:168`

**Spec rule:** Spec 51 §"CSS classes for interactive states" — focused/selected state must use the `.is-focused` CSS class, not inline `style` conditionals.

**What the code does:**
```tsx
// row (line 153)
style={{ background: isFocusedRow ? 'var(--color-bg-selected)' : isChildOfFocused ? 'var(--color-bg-hover)' : undefined }}

// cell (line 168)
style={{ outline: isFocusedCell ? '2px solid var(--color-border-focus)' : undefined, outlineOffset: '-2px' }}
```

**What it should do:** Apply `.is-focused` (and a sibling class for child-of-focused rows) via `className`, and express all visual states in CSS.

---

## BUG-002 — ContextMenu hover set via `onMouseEnter` / `onMouseLeave`

**File:** `src/frontend/components/ContextMenu.tsx:72–77`

**Spec rule:** Spec 51 §"Hover states via CSS only" — `onMouseEnter`/`onMouseLeave` handlers that set `style` are not permitted. The third-party-component exception does not apply to a first-party component.

**What the code does:**
```tsx
onMouseEnter={(e) => { if (!item.disabled) (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)'; }}
onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
```

**What it should do:** Remove those handlers and add a CSS rule `.context-menu-item:hover:not(:disabled) { background: var(--color-bg-hover); }`.

---

## BUG-003 — Raw `rgba()` value on the table column resize handle

**File:** `src/frontend/views/TableView/TableView.tsx:108`

**Spec rule:** Spec 51 §"No raw values — tokens only" — raw `rgba()` values are explicitly banned.

**What the code does:**
```tsx
background: 'rgba(0,0,0,0.08)'
```

**What it should do:** Use a token. The closest option is `var(--color-border)` at low opacity — a new token `--color-resize-handle` should be defined in `50-theming.md` if the exact visual weight matters, or the existing `--color-border` should be used directly.

---

## BUG-004 — `StatusBar.tsx` entirely expressed as inline styles

**File:** `src/frontend/components/StatusBar.tsx`

**Spec rule:** Spec 51 §"No raw values — tokens only" and §"CSS classes for interactive states" — static layout and presentation must use CSS classes; inline style is only permitted for genuinely dynamic (drag-computed) values.

**Raw values used:**
| Property | Raw value | Correct token |
|---|---|---|
| `gap` | `8` | `var(--space-3)` |
| `padding` (bar) | `'2px 8px'` | `var(--space-1) var(--space-3)` |
| `fontSize` (bar) | `12` | `var(--font-size-sm)` |
| `minHeight` | `24` | no token — move to CSS |
| `padding` (btn) | `'1px 8px'` | `var(--space-1) var(--space-3)` |
| `fontSize` (btn) | `11` | `var(--font-size-xs)` |
| `borderRadius` (btn) | `3` | `var(--radius-sm)` |

**What it should do:** Extract a `.status-bar` and `.status-btn` CSS class in `styles.css`. Static layout and token-based values move to CSS; nothing remains in `barStyle`/`btnStyle`.

---

## BUG-005 — Scattered raw pixel values across components

**Spec rule:** Spec 51 §"No raw values — tokens only".

| File | Location | Raw value | Correct token |
|---|---|---|---|
| `TableView.tsx` | `th` padding | `'4px 8px'` | `var(--space-2) var(--space-3)` |
| `TableView.tsx` | tfoot `padding` | `'8px'` | `var(--space-3)` |
| `TableView.tsx` | tfoot `fontSize` | `12` | `var(--font-size-sm)` |
| `ReqTreeLine.tsx` | num span `marginRight` | `4` | `var(--space-2)` |
| `ContextMenu.tsx` | item `padding` | `'6px 12px'` | `var(--space-1) var(--space-4)` |
| `ContextMenu.tsx` | item `fontSize` | `13` | `var(--font-size-md)` |
| `MenuBar.tsx` | "No matches" span | inline `style` object | CSS class `.menu-no-matches` |
| `MenuBar.tsx` | View tab `label` | `style={{ fontSize: 'var(--font-size-sm)' }}` | CSS class |
| `MenuBar.tsx` | View tab `select` | long inline `style` object | CSS class `.menu-view-select` |

---

## BUG-006 — `.menu-bar` base `font-size` is `--font-size-md` instead of `--font-size-sm`

**File:** `src/frontend/styles.css:51`

**Spec rule:** Spec 60 §"Sizing" — font size for all MenuBar controls is `var(--font-size-sm)` (12 px).

**What the code does:**
```css
.menu-bar {
  font-size: var(--font-size-md);  /* 13px — wrong */
}
```

**What it should do:** `font-size: var(--font-size-sm)`. Inner controls override this anyway, but the base declaration must match the spec.

---

## BUG-007 — Empty document message missing trailing period

**File:** `src/frontend/views/TableView/TableView.tsx:135`

**Spec rule:** Spec 62 §"Empty document" quotes the exact string:
> "No requirements yet — double-click here or use Add Req to get started."

**What the code does:**
```tsx
No requirements yet — double-click here or use Add Req to get started
```
(no trailing period)

**What it should do:** Add the period.
