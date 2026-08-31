---
updated: 2026-08-23
implemented: 
tested: 
---

# Spec: App Shell Layout

The app shell is the viewport-level frame that pins the MenuBar at the top, the StatusBar at the bottom, and fills the remaining space with a scrollable middle area. The layout must work identically in desktop (pywebview) and browser modes.

---

## Constraint: fill the viewport

The application must fill the entire viewport with no overflow onto the page. The browser should never show a document-level scrollbar. All scrolling happens inside the content area.

Root sizing, defined in `styles.css`:

```css
html, body {
  height: 100%;
  margin: 0;
}

#root {
  height: 100%;
}
```

---

## Shell structure

`Content` is a flex column that fills `#root`:

```
┌──────────────────────────────────────┐  ← top of viewport
│  MenuBar          (flex-shrink: 0)   │
├──────────────────────────────────────┤
│  Middle row       (flex: 1,          │
│  ┌──────────┬───────────────────┐    │   min-height: 0,
│  │ SideBar  │  View             │    │   overflow: hidden)
│  │          │                   │    │
│  └──────────┴───────────────────┘    │
├──────────────────────────────────────┤
│  StatusBar        (flex-shrink: 0)   │
└──────────────────────────────────────┘  ← bottom of viewport
```

CSS contract for the `Content` outer wrapper:

```css
display: flex;
flex-direction: column;
height: 100%;
```

MenuBar and StatusBar are natural flex children with `flex-shrink: 0` (their intrinsic height determines their size).

---

## Middle row

The middle row (the `<div>` wrapping `SideBar` and `View` in `Content`) must expand to fill the remaining height:

```css
display: flex;       /* side-by-side columns */
flex: 1;             /* take all height left after MenuBar + StatusBar */
min-height: 0;       /* allow flex child to shrink below its content height */
overflow: hidden;    /* clip; each column scrolls internally */
```

---

## SideBar column

```css
height: 100%;
overflow: hidden;    /* ReqTree scrolls internally via overflow: auto on its inner container */
flex-shrink: 0;      /* width is user-controlled; never shrinks due to content pressure */
```

The resize handle between SideBar and View is a zero-width flex child (`flex-shrink: 0`) — purely a drag target.

---

## View column

The `View` component and whichever view it renders (`TableView`, `RawStoreView`, etc.) must collectively fill the remaining column width and full column height:

```css
/* View wrapper */
flex: 1;
min-width: 0;
height: 100%;
display: flex;
flex-direction: column;
overflow: hidden;
```

Each individual view is responsible for its own internal scroll. `TableView` does this via `.table-scroll-container { overflow: auto; flex: 1; }` — this only works when all ancestors have a real height, which this spec guarantees.

---

## No-file state

When no file is open, `View` is replaced by the no-file panel (see `62-empty-states.md`). This panel must also fill the middle column:

```css
flex: 1;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
```

---

## Inline style vs CSS class

The shell structure values (`display: flex`, `flex-direction: column`, `flex: 1`, `height: 100%`, `min-height: 0`, `overflow: hidden`) are static layout — they do not change at runtime. They must be expressed as CSS classes in `styles.css`, not as inline `style` props, in accordance with `51-styling-architecture.md`.

The sidebar `width` and `min-width` remain inline `style` props because they are dynamically set by the drag-resize handler (an explicit carve-out in `51-styling-architecture.md`).

---

## Related specs

- `60-menubar.md` — MenuBar content and tab structure
- `31-sidebar.md` — SideBar content and tree rendering
- `30-table-view.md` — TableView scroll container and column layout
- `62-empty-states.md` — no-file panel content
- `51-styling-architecture.md` — CSS class vs inline style rules