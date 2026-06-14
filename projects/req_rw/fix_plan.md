STATUS: DONE

## Steps

- [x] `StatusBar.tsx` contains no `style` prop on any element — every layout and visual property is expressed through CSS class names.
- [x] Two new classes, `.status-bar` and `.status-btn`, exist in `styles.css` and use only `var(--*)` tokens; no raw hex, `rgb()`, or pixel literals appear in either rule.
- [x] The edit-mode toggle button continues to receive `.is-active` conditionally (and only that — no inline style).
- [x] `npx tsc --noEmit` exits 0.
