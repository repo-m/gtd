---
updated: 2026-08-23
implemented: 2026-08-23
tested: 2026-08-23
---

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

Define two theme blocks in `app/src/frontend/styles/themes.css`:

```css
:root,
[data-theme="light"] {
  --color-bg:              #ffffff;      /* editor.background */
  --color-bg-subtle:       #f3f3f3;     /* editorSuggestWidget.background / menus */
  --color-bg-chrome:       #dddddd;     /* titleBar.activeBackground */
  --color-bg-hover:        #e8e8e8;     /* list.hoverBackground */
  --color-bg-selected:     #add6ff;     /* editor.selectionHighlightBackground (solid) */
  --color-bg-selection:    #bfdbfe;     /* multi-select row highlight */
  --color-border:          #d0d0d0;     /* widget.border */
  --color-border-strong:   #b8b8b8;    /* column-header grid lines — slightly bolder than body */
  --color-border-focus:    #007fd4;
  --color-separator:       #d0d0d0;
  --color-text:            #000000;     /* editor.foreground */
  --color-text-muted:      #6b6b6b;
  --color-text-chrome:     #333333;     /* titleBar.activeForeground */
  --color-text-inverse:    #ffffff;
  --color-accent:          #007acc;     /* activityBarBadge.background */
  --color-accent-hover:    #005a9e;
  --color-error:           #e51400;
  --color-match-bg:        #fff176;
  --color-match-text:      #000000;
  --color-link-out:        #22c55e;
  --color-link-in:         #f97316;
  --color-overlay:         rgba(0, 0, 0, 0.35);
  --shadow-modal:          0 4px 16px rgba(0, 0, 0, 0.18);
  --shadow-popover:        0 2px 8px rgba(0, 0, 0, 0.12);
}

[data-theme="dark"] {
  --color-bg:              #1e1e1e;     /* editor.background */
  --color-bg-subtle:       #252526;     /* menu.background / menus */
  --color-bg-chrome:       #3c3c3c;    /* titleBar.activeBackground */
  --color-bg-hover:        #2a2d2e;    /* list.hoverBackground */
  --color-bg-selected:     #264f78;    /* list.activeSelectionBackground */
  --color-bg-selection:    #1e3a5f;    /* multi-select row highlight */
  --color-border:          #454545;    /* menu.border */
  --color-border-strong:   #5f5f5f;   /* column-header grid lines — slightly bolder than body */
  --color-border-focus:    #007fd4;
  --color-separator:       #454545;    /* menu.separatorBackground */
  --color-text:            #d4d4d4;    /* editor.foreground */
  --color-text-muted:      #858585;
  --color-text-chrome:     #cccccc;    /* titleBar.activeForeground */
  --color-text-inverse:    #1e1e1e;
  --color-accent:          #007acc;    /* activityBarBadge.background */
  --color-accent-hover:    #1177bb;
  --color-error:           #f44747;
  --color-match-bg:        #613315;
  --color-match-text:      #ffffff;
  --color-link-out:        #4ade80;
  --color-link-in:         #fb923c;
  --color-overlay:         rgba(0, 0, 0, 0.55);
  --shadow-modal:          0 4px 20px rgba(0, 0, 0, 0.60);
  --shadow-popover:        0 2px 10px rgba(0, 0, 0, 0.50);
}
```

**Semantic rules for color tokens:**

- `--color-bg` is the main content surface: table rows, editor area, modal body. Every component that renders a background in the content area must use this token — no hardcoded values, no omission that falls back to the browser's default white.
- `--color-bg-subtle` is the secondary surface: dropdown/menu background, inset areas inside the content. Not used for the sidebar.
- `--color-bg-chrome` is the chrome surface: `MenuBar`, `SideBar`, and `StatusBar` backgrounds. It maps to VS Code's `titleBar.activeBackground` (`#3c3c3c` dark / `#dddddd` light). Must not be used for main content or modal body.
- `--color-text-chrome` is the foreground used on `--color-bg-chrome` surfaces only. It maps to VS Code's `titleBar.activeForeground`.
- `--color-bg-selected` is the universal background for any focused or selected interactive item: focused table cell, selected sidebar tree item, active toggle button. It is a muted tint, not the full accent color.
- `--color-bg-selection` is the background for a multi-selected table row (`.is-selected-row`); distinct from `--color-bg-selected` (single focused/active item highlight).
- `--color-accent` is reserved for primary action indicators (tab underlines, links, focus rings) — not for selection backgrounds.
- `--color-link-out` / `--color-link-in` are used exclusively for outward and inward link direction arrows in `LinkField`. No other element may use these tokens.
- `--color-overlay` is used exclusively for modal backdrop overlays.
- `--shadow-modal` / `--shadow-popover` are used for elevated surfaces (modals and context menus). Raw box-shadow values are not permitted.
- `--color-border-strong` is used exclusively for both `border-bottom` and `border-right` of column-header (`th`) cells. It is slightly more prominent than `--color-border` (same 1 px width) so the header row reads as slightly bolder than body rows. The column resize handle (`.resize-handle`) is transparent by default and reveals `--color-border-strong` only on hover. No other element may use this token.
- `--color-separator` is used for toolbar group hairlines. Do not use `--color-border` or raw hex for separators.
- `--color-statusbar-bg` / `--color-statusbar-text` are not applied to any component. The `StatusBar` uses `--color-bg-chrome` / `--color-text-chrome` in line with the `MenuBar` and `SideBar`.

**Component coverage rule:** Every element that renders a background color must use a CSS custom property from this spec. No component may omit a `background` declaration and rely on the browser's default white — this causes the element to remain white in dark mode even when `data-theme="dark"` is set on `<html>`.

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

## Test requirements

The theming test suite (`tests/frontend/theming.test.ts`) must cover both the Redux layer and the DOM wiring:

**Redux layer (already required):**
- `appSlice` initialises `theme` to `'system'`.
- `appSetTheme` updates state and writes to `localStorage['req.theme']`.
- `selectAppResolvedTheme` never returns `'system'`; resolves to `'light'` or `'dark'`.

**DOM wiring (required — currently missing):**
- After dispatching `appSetTheme('dark')`, `document.documentElement.getAttribute('data-theme')` must equal `'dark'`.
- After dispatching `appSetTheme('light')`, `document.documentElement.getAttribute('data-theme')` must equal `'light'`.

Without the DOM tests the gate can be green while dark mode never applies to a single pixel on screen.

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

- `app/src/frontend/store/appSlice.ts` — `theme`, `appSetTheme`, `selectAppResolvedTheme`
- `app/src/frontend/App.tsx` — `localStorage` bootstrap, `data-theme` effect, `matchMedia` listener
- `app/src/frontend/styles/themes.css` — all CSS custom property definitions
- `app/src/frontend/components/MenuBar.tsx` — theme toggle button
- `app/src/frontend/constants/app_constants.ts` — `THEME_STORAGE_KEY = 'req.theme'`

## Related specs

- `51-styling-architecture.md` — rules for how tokens must be applied in components
- `52-iconography.md` — SVG icon definitions for the theme toggle icons
- `60-menubar.md` — where the theme toggle sits in the MenuBar layout
- `53-design-brief.md` — the aesthetic direction and rationale these tokens serve