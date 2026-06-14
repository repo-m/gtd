# Spec: Iconography

All icons in the application are inline SVG components. Unicode characters and emoji are not used as icons anywhere in the UI.

---

## Icon sizes

| Context | Size | Examples |
|---|---|---|
| Toolbar (MenuBar) | 14 × 14 px | Action buttons, theme toggle |
| Inline / field | 12 × 12 px | Link direction arrows, heading indicator |
| Status bar | 12 × 12 px | Sidebar chevron toggle |
| Empty state | 48 × 48 px | No-file illustration |

---

## SVG style

All icons use a consistent stroke-only style:

- `fill="none"`
- `stroke="currentColor"` — inherits text color; adapts to themes automatically
- `strokeWidth` by size: `1.75` for ≤ 12 px; `1.5` for > 12 px (including the 48 px empty-state icon)
- `strokeLinecap="round"`, `strokeLinejoin="round"`

No filled icons. No mixed fill/stroke icons. Icon color is always `currentColor` — never a hardcoded value.

The `sw(size)` helper in `icons.tsx` encodes this rule: `size <= 12 ? 1.75 : 1.5`. All icon components must use it — including `DocumentIcon` — rather than hardcoding the stroke width.

---

## Named icons

All icons live in `src/frontend/components/Icon/` and are exported from `index.ts`.

| Export name | Replaces | Used for |
|---|---|---|
| `SunIcon` | SVG already exists in MenuBar | Theme: Light setting |
| `MoonIcon` | SVG already exists in MenuBar | Theme: Dark setting |
| `MonitorIcon` | SVG already exists in MenuBar | Theme: System setting |
| `ChevronRightIcon` | `▸` unicode | Sidebar collapsed, disclosure triangle closed |
| `ChevronDownIcon` | `▾` unicode | Disclosure triangle open |
| `ChevronLeftIcon` | `‹` text | Sidebar toggle button in status bar |
| `HeadingIcon` | `▶` unicode | Heading row indicator in `IdField` |
| `LinkOutIcon` | `↗` unicode | Outward links in `LinkField` |
| `LinkInIcon` | `↙` unicode | Inward links in `LinkField` |
| `BoldIcon` | `B` text label | Bold formatting in MenuBar |
| `ItalicIcon` | `I` text label | Italic formatting in MenuBar |
| `UnderlineIcon` | `U` text label | Underline formatting in MenuBar |
| `ListOrderedIcon` | `OL` text label | Ordered list in MenuBar |
| `ListUnorderedIcon` | `UL` text label | Unordered list in MenuBar |
| `DocumentIcon` | — | Empty state illustration (48 × 48) |

Existing inline SVGs in `MenuBar.tsx` (`SunIcon`, `MoonIcon`, `MonitorIcon`) must be moved to `src/frontend/components/Icon/` to consolidate all icons in one location.

---

## Accessibility

Every icon-only interactive element must carry an `aria-label` or `title` describing its action. Icon + text label buttons do not require a separate `aria-label` if the label text is descriptive.

```tsx
// Correct — icon only
<button aria-label="Toggle sidebar"><ChevronLeftIcon /></button>

// Correct — icon + label (no extra aria-label needed)
<button><SunIcon /> Light mode</button>
```

Screen-reader-only icons (purely decorative) must carry `aria-hidden="true"`.

---

## Relevant files

- `src/frontend/components/Icon/index.ts` — all icon exports
- `src/frontend/components/Icon/*.tsx` — one file per icon or grouped by category
- `src/frontend/components/MenuBar.tsx` — toolbar icon consumers
- `src/frontend/components/Field/IdField.tsx` — `HeadingIcon` (replaces `▶`)
- `src/frontend/components/Field/LinkField.tsx` — `LinkOutIcon`, `LinkInIcon` (replaces `↗`, `↙`)
- `src/frontend/components/SideBar/ReqTreeLine.tsx` — `ChevronDownIcon`, `ChevronRightIcon` (replaces `▾`, `▸`)
- `src/frontend/components/StatusBar.tsx` — `ChevronLeftIcon` / `ChevronRightIcon` (replaces `‹`, `›`)

## Related specs

- `50-theming.md` — token system; icons use `currentColor` to inherit theme colors
- `51-styling-architecture.md` — general styling rules that also apply to icon containers
