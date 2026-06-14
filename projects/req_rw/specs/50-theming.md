# Feature: Theming (Dark / Light Mode)

The app supports three theme settings: **dark**, **light**, and **system** (follows the OS `prefers-color-scheme` media query). Theme is a user preference — it is stored in `localStorage`, not in the `.rq` file.

---

## State (`appSlice`)

Add a `theme` field to `appSlice`:

```ts
type ThemeSetting = 'light' | 'dark' | 'system';

// in AppState:
theme: ThemeSetting;   // persisted to localStorage; default 'system'
```

### Actions

| Action | Payload | Effect |
|--------|---------|--------|
| `appSetTheme(setting)` | `ThemeSetting` | Updates `appSlice.theme`; writes `setting` to `localStorage` under key `'req.theme'`. |

### Selector

`selectAppResolvedTheme(state)` → `'light' | 'dark'`

Resolves `'system'` using `window.matchMedia('(prefers-color-scheme: dark)').matches`. Always returns a concrete value — never `'system'`.

---

## Applying the theme

`App.tsx` is responsible for keeping the DOM in sync:

1. **On mount** — read `localStorage.getItem('req.theme')` and dispatch `appSetTheme(...)` if present (otherwise the `appSlice` default of `'system'` stands).
2. **On every `theme` state change** (via `useEffect` + `useSelector(selectAppResolvedTheme)`) — set `document.documentElement.setAttribute('data-theme', resolvedTheme)`.
3. **System theme changes** — attach a `matchMedia` listener in the same effect; when the OS switches and `appSlice.theme === 'system'`, re-derive and re-apply the attribute.

The `data-theme` attribute lives on `<html>` so that all CSS custom properties cascade to every element in the document.

---

## CSS tokens

All visual values in the application must use CSS custom properties. No component may reference a raw hex, rgb, rgba, or pixel value that has a corresponding token — only `var(--*)`.

### Color tokens

Define two theme blocks in `src/frontend/styles/themes.css`:

```css
:root,
[data-theme="light"] {
  --color-bg:           #ffffff;
  --color-bg-subtle:    #f5f5f5;
  --color-bg-hover:     #ebebeb;
  --color-bg-selected:  #d0e8ff;
  --color-border:       #d0d0d0;
  --color-border-focus: #4a90d9;
  --color-separator:    #d0d0d0;
  --color-text:         #1a1a1a;
  --color-text-muted:   #6b6b6b;
  --color-text-inverse: #ffffff;
  --color-accent:       #1a6fc4;
  --color-accent-hover: #155aa0;
  --color-error:        #c0392b;
  --color-match-bg:     #fff176;
  --color-match-text:   #1a1a1a;
  --color-link-out:     #22c55e;
  --color-link-in:      #f97316;
  --color-overlay:      rgba(0, 0, 0, 0.35);
  --shadow-modal:       0 4px 16px rgba(0, 0, 0, 0.18);
  --shadow-popover:     0 2px 8px rgba(0, 0, 0, 0.12);
}

[data-theme="dark"] {
  --color-bg:           #1e1e1e;
  --color-bg-subtle:    #252525;
  --color-bg-hover:     #2e2e2e;
  --color-bg-selected:  #1e3a52;
  --color-border:       #3c3c3c;
  --color-border-focus: #4a90d9;
  --color-separator:    #3c3c3c;
  --color-text:         #d4d4d4;
  --color-text-muted:   #808080;
  --color-text-inverse: #1e1e1e;
  --color-accent:       #4a9edd;
  --color-accent-hover: #6ab4f0;
  --color-error:        #f48771;
  --color-match-bg:     #7a6500;
  --color-match-text:   #ffffff;
  --color-link-out:     #4ade80;
  --color-link-in:      #fb923c;
  --color-overlay:      rgba(0, 0, 0, 0.55);
  --shadow-modal:       0 4px 20px rgba(0, 0, 0, 0.60);
  --shadow-popover:     0 2px 10px rgba(0, 0, 0, 0.50);
}
```

**Semantic rules for color tokens:**

- `--color-bg-selected` is the universal background for any focused or selected interactive item: focused table cell, selected sidebar tree item, active toggle button. It is a muted tint, not the full accent color.
- `--color-accent` is reserved for primary action indicators (tab underlines, links, focus rings) — not for selection backgrounds.
- `--color-link-out` / `--color-link-in` are used exclusively for outward and inward link direction arrows in `LinkField`. No other element may use these tokens.
- `--color-overlay` is used exclusively for modal backdrop overlays.
- `--shadow-modal` / `--shadow-popover` are used for elevated surfaces (modals and context menus). Raw box-shadow values are not permitted.
- `--color-separator` is used for toolbar group hairlines. Do not use `--color-border` or raw hex for separators.

---

### Spacing tokens

```css
:root {
  --space-1: 2px;
  --space-2: 4px;
  --space-3: 8px;
  --space-4: 12px;
  --space-5: 16px;
  --space-6: 24px;
}
```

Spacing tokens are theme-invariant and defined once in `:root`. All padding, margin, and gap values must use a spacing token or a multiple thereof.

---

### Typography tokens

```css
:root {
  --font-size-xs:       11px;
  --font-size-sm:       12px;
  --font-size-md:       13px;
  --font-size-lg:       14px;
  --font-weight-normal: 400;
  --font-weight-semi:   600;
  --line-height-tight:  1.3;
  --line-height-base:   1.5;
}
```

Semantic usage:

| Token | Used for |
|---|---|
| `--font-size-xs` | Search result counter, secondary status bar labels |
| `--font-size-sm` | All MenuBar controls, sidebar tree items, status bar |
| `--font-size-md` | Table cell content, context menu items |
| `--font-size-lg` | Modal title, section headings |
| `--font-weight-semi` | Heading rows in the table, active tab labels, modal title |

---

### Shape tokens

```css
:root {
  --radius-sm: 3px;
  --radius-md: 4px;
}
```

- `--radius-sm` — buttons, inputs, small chips
- `--radius-md` — modals, context menus, larger panels

---

## MenuBar control

The theme toggle lives in the *Preferences* group of the Home tab (see `60-menubar.md`).

- Renders a button that cycles through `'light' → 'dark' → 'system'`.
- Icon: `SunIcon` for light, `MoonIcon` for dark, `MonitorIcon` for system (see `52-iconography.md`).
- `title` / `aria-label`: `"Theme: Light"` / `"Theme: Dark"` / `"Theme: System"`.
- Dispatches `appSetTheme(nextSetting)` on click.

---

## Persistence contract

| Storage | Key | Value | Cleared when |
|---------|-----|-------|-------------|
| `localStorage` | `'req.theme'` | `'light'`, `'dark'`, or `'system'` | Never (user must reset manually or via future settings UI) |

The `.rq` file is not modified. Theme is not exported to ReqIF.

---

## Relevant files

- `src/frontend/store/appSlice.ts` — `theme`, `appSetTheme`, `selectAppResolvedTheme`
- `src/frontend/App.tsx` — `localStorage` bootstrap, `data-theme` effect, `matchMedia` listener
- `src/frontend/styles/themes.css` — all CSS custom property definitions
- `src/frontend/components/MenuBar.tsx` — theme toggle button
- `src/frontend/constants/app_constants.ts` — `THEME_STORAGE_KEY = 'req.theme'`

## Related specs

- `51-styling-architecture.md` — rules for how tokens must be applied in components
- `52-iconography.md` — SVG icon definitions for the theme toggle icons
- `60-menubar.md` — where the theme toggle sits in the MenuBar layout
