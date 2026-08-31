---
updated: 2026-08-23
implemented: 2026-08-23
tested: 2026-08-23
---

# Spec: Styling Architecture

This spec defines how styles are applied across the application. Its rules are binding on every component.

---

## Rule: CSS classes for interactive states

Inline `style` props must not be used for stateful presentation. The following states must be expressed via CSS class names applied to the element, not as conditionally computed JS style objects:

| State | CSS class | When applied |
|---|---|---|
| Focused / selected | `.is-focused` | Element matches current focus in `appSlice` |
| Active / toggled on | `.is-active` | Toggle button is in its on state (edit mode, sidebar, search) |
| Disabled | (native `disabled` attribute) | Action is unavailable; use `:disabled` pseudo-class in CSS |
| Editable | `.is-editable` | A cell or field is in edit mode (`editable: true`) |
| Hovered | (native `:hover` pseudo-class) | Never use `onMouseEnter`/`onMouseLeave` to set style |

Inline `style` is permitted only for values that are genuinely dynamic and cannot be expressed in CSS:
- Column widths derived from drag operations
- Depth-based indentation: `paddingLeft: depth * INDENT_PX`
- Sidebar width from resize drag

All other styling must go through CSS classes or pseudo-classes.

---

## Rule: No raw values — tokens only

Every visual property that has a corresponding design token must use that token. The following are banned in component files:

- Raw hex colors (`#ccc`, `#fff`, `#1a6fc4`)
- Raw `rgb()` / `rgba()` values
- Raw pixel sizes for spacing, font size, or border radius that have a token equivalent

See `50-theming.md` for the full token list. The only values permitted without a token are layout-computed numbers (e.g., `depth * 16`) and zero (`0`).

---

## Rule: Transitions

All visibility and state changes must use a CSS transition. Minimum requirements:

| Element | Property | Duration |
|---|---|---|
| Sidebar show/hide | `width`, `opacity` | `150ms ease` |
| Modal show/hide | `opacity` | `120ms ease` |
| Button hover/active background | `background-color` | `80ms ease` |
| Search bar show/hide | `opacity`, `max-height` | `120ms ease` |

Transitions are defined in CSS classes, not inline style objects.

---

## Rule: Focus rings

Every interactive element must show a visible `:focus-visible` ring. The global rule, defined in `styles.css`:

```css
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 1px;
}
```

`outline: none` must never be applied without an equivalent visible replacement.

---

## Rule: Hover states via CSS only

Hover feedback must use the `:hover` CSS pseudo-class. `onMouseEnter` / `onMouseLeave` event handlers that set style are not permitted. The only exception is when styling a third-party component that exposes no CSS hook.

---

## Rule: Scrollbar styling

The OS-default scrollbar is light-colored on macOS and breaks the dark-mode palette. A thin, theme-aware scrollbar must be applied globally via WebKit pseudo-elements in `styles.css`:

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-subtle);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}
```

These rules use tokens so they automatically adapt when `data-theme` changes. No hardcoded hex values are permitted in scrollbar rules.

---

## Button class system

Content-area buttons (modals and dialogs) use a `.btn` base class with BEM-style modifiers. All values use CSS custom property tokens — no raw hex, px, or numeric font sizes.

| Class | Usage |
|---|---|
| `.btn` | Base class for all content-area buttons. Standard size (12px, `var(--space-1) var(--space-3)` padding). |
| `.btn--primary` | Accent-colored call-to-action button (e.g. OK, Save). Uses `--color-accent` background and `--color-text-inverse` text. |
| `.btn--lg` | Larger footer-row buttons (e.g. CANCEL / OK / Close in modal footers). Padding `var(--space-2) var(--space-5)`, font-size `var(--font-size-md)`. |
| `.btn--icon` | Compact icon/glyph buttons (e.g. ✕ remove, ↑↓ reorder). Reduced padding (`var(--space-1) var(--space-2)`), `font-size: var(--font-size-xs)`, `flex-shrink: 0`. |

Rules:
- `.btn` is for the content area only. MenuBar controls use `.menu-btn` (chrome context, `--color-text-chrome`).
- `.btn--primary` and `.btn--lg` are additive modifiers — always paired with `.btn`.
- All four classes use `transition: background-color 80ms ease` and a `:hover` rule that applies `--color-bg-hover` (`.btn--primary:hover` applies `--color-accent-hover` instead).
- `:disabled` reduces opacity to 0.5 and sets `cursor: default`.

---

## Relevant files

- `app/src/frontend/styles.css` — global resets, `:focus-visible` rule, shared utility classes (`.is-focused`, `.is-active`)
- `app/src/frontend/styles/themes.css` — all token definitions (see `50-theming.md`)
- All component `.tsx` files — must comply with these rules

## Related specs

- `50-theming.md` — defines all CSS custom property tokens
- `52-iconography.md` — icon sizing and style rules
- `53-design-brief.md` — the design intent these architecture rules enforce