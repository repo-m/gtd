---
updated: 2026-08-23
implemented:
tested:
---

# Spec: Design Brief

This spec is descriptive, not prescriptive: it does not introduce new rules. It names the aesthetic direction that `50-theming.md`, `51-styling-architecture.md`, and `52-iconography.md` already enforce through their token and architecture rules, so a future styling change can be checked against an explicit brief instead of ad hoc taste — the same role `bugs.md` plays for spec conformance generally.

Every claim below is tied to a specific spec passage, commit, or `bugs.md` entry. Where the evidence is mixed or approximate, that is noted rather than smoothed over.

---

## Design direction

**Req.rw pairs a VS Code–style chrome shell around a spreadsheet-style content grid.** The chrome (MenuBar, SideBar, StatusBar) is benchmarked against VS Code; the primary content surface (the table, and the grid-line treatment of it specifically) is benchmarked against Excel/Google Sheets. These are two distinct reference points for two distinct zones of the UI, not one blended aesthetic.

Evidence for the chrome half:
- `50-theming.md:119–120` — `--color-bg-chrome` and `--color-text-chrome` are documented as mapping directly to VS Code's `titleBar.activeBackground` / `titleBar.activeForeground` tokens.
- Commit `753d41b` — "Update theming to VS Code Dark+/Light+ palette with chrome surface layer".
- Commit `ba6261e` — "Apply eight shell chrome stability fixes to bring the app's VS Code-style chrome up to spec".
- Commit `4452299` — "Restyle the StatusBar to VS Code–style borderless items".
- Commit `d77b409` — sidebar resize handle given "a hover-expand affordance matching VS Code panel handles".
- `specs/63-statusbar.md:26` — section literally titled "VS Code–style item appearance".
- `specs/31-sidebar.md:34` — sidebar header row "matching VS Code's Explorer header pattern".
- `specs/13-workspace-prefs.md:9` and `specs/33-views.md:35` — the prefs/`.rq`-file split is explicitly modeled on VS Code's "documents are pure data, personal state lives outside them," though that is an architectural borrowing, not a visual one.

Evidence for the content-grid half:
- Commit `862cf15` — "Add Excel-style table visual polish: grid lines, sticky headers, row hover, heading row, resize handle, column widths".
- `specs/30-table-view.md:106` — "The table renders a full **Excel-style grid**."
- Commit `edbc44e` — the commit that introduced `--color-border-strong` for header cells describes the goal as "matching the **Google Sheets** visual treatment."
- `specs/35-filter.md:9` — filtering behaves "exactly like column filters in Excel or Google Sheets."

Note the source material itself alternates between "Excel" and "Google Sheets" for the same grid-line/filter behavior — the codebase treats them as interchangeable shorthand for "familiar desktop spreadsheet," not a commitment to one specific product's visual system. This spec preserves that ambiguity rather than picking one to sound more precise than the evidence supports.

---

## Minimalism by subtraction

**Principle:** the content surface (table, tree) is where styling effort is spent — grid lines, hover/selection states, sticky headers, resize affordances. Chrome (MenuBar, SideBar, StatusBar) is deliberately kept flat and undecorated. Restraint in the chrome is what makes the content surface's polish legible; the two are not held to the same visual budget.

This is already load-bearing in the code, via the class split in `51-styling-architecture.md`'s "Button class system":

- `.btn` (and its modifiers `.btn--primary`, `.btn--lg`, `.btn--icon`) is explicitly scoped to "the content area only" — modals and dialogs. It carries hover transitions, a primary/accent variant, and disabled-state opacity handling (`51-styling-architecture.md:110–126`).
- `.menu-btn` is the chrome-context counterpart, using `--color-text-chrome` instead of content-area tokens (`51-styling-architecture.md:122`).
- `StatusBar` follows the same split one tier further: `specs/63-statusbar.md:28` requires its items to be "borderless text or icons on the chrome background, with a background-color shift on hover only. No box borders, no border-radius on standard items." That is a stronger subtraction than anything asked of `.btn` — chrome items don't even get the shape treatment content buttons get.

So "minimalism by subtraction" here doesn't mean "everything is minimal" — it means the chrome tier has features actively withheld (borders, radius, accent color, elevation) that the content tier is permitted to use.

---

## Single scale as enforced rhythm

`50-theming.md` defines one spacing scale (`--space-1` … `--space-6`) and one type scale (`--font-size-xs` … `--font-size-lg`), each a short fixed list. This spec does not restate those values — see `50-theming.md`'s "Spacing tokens" and "Typography tokens" sections for the current numbers.

Why a single scale matters, rather than just what it contains: `51-styling-architecture.md`'s "No raw values — tokens only" rule turns the scale into an audit surface. Because there are only six spacing steps and four font sizes, any raw pixel value that doesn't match one of them is visibly *not* a token reference — it can't hide as "a reasonable-looking number." `bugs.md`'s BUG-005 ("Scattered raw pixel values across components") is exactly this kind of drift, and it was catchable precisely because the raw values (`'4px 8px'`, `4`, `6`) fell outside the fixed scale and could be mapped back to a specific token in the writeup. A large, unbounded scale (or none at all) would not produce that signal — near enough to a token is not the same as being it.

---

## Micro-state consistency

**Named rule:** every interactive or contentful state — hover, focus, active/selected, disabled, and empty — must be expressed as a CSS class or native pseudo-class, never as inline `style` computed in JS and never as a JS-driven event handler setting style. This is `51-styling-architecture.md`'s "CSS classes for interactive states" and "Hover states via CSS only" rules (`.is-focused` / `.is-active` classes, native `:disabled`/`:hover`, no `onMouseEnter`/`onMouseLeave` style mutation).

This is the single rule most of `bugs.md`'s historical churn traces back to:

- **BUG-001** — `TableView`'s focused row/cell state was computed as an inline `style` conditional instead of an `.is-focused`-style class, the exact violation the rule exists to prevent.
- **BUG-002** — `ContextMenu` set hover background via `onMouseEnter`/`onMouseLeave` handlers mutating `style` directly, in place of a `:hover` CSS rule.
- **BUG-003** — the column resize handle's hover-reveal affordance used a raw `rgba()` value rather than a token, undermining the same hover-state styling this rule governs.
- **BUG-004** — `StatusBar` expressed its entire presentation, states included, as inline style objects (`barStyle`/`btnStyle`), rather than CSS classes.
- **BUG-006** — `.menu-bar`'s base font-size token drifted from the spec value, a smaller-scale instance of the same category of ad hoc, per-component override that the CSS-class-only rule is meant to head off.

Five of the twelve entries in `bugs.md` are one rule being violated in five different components. That repetition, not a general appeal to "consistency is good," is the justification for calling this out as a named rule rather than leaving it implicit inside `51-styling-architecture.md`'s per-topic sections. `bugs.md` marks all five as resolved; this spec exists so the next component doesn't quietly reopen the same category.

The "empty" state (no file open, empty document, empty sidebar, no search results) is covered concretely in `62-empty-states.md` — this spec only asserts that it belongs in the same consistency bucket as hover/focus/active/disabled, not that it has separate rules of its own.

---

## Relevant files

This spec documents existing behavior; it does not add files. See:
- `app/src/frontend/styles.css` — `.btn`, `.menu-btn`, `.status-bar`/`.status-btn`, `:focus-visible`, `:hover` rules
- `app/src/frontend/styles/themes.css` — token definitions
- `bugs.md` — BUG-001 through BUG-006 (evidence cited above)

## Related specs

- `50-theming.md` — the token system this brief's rhythm/color reasoning is built on
- `51-styling-architecture.md` — the enforcement rules (CSS-class-only states, tokens-only values, `.btn`/`.menu-btn` split) this brief explains the intent behind
- `52-iconography.md` — icon sizing/style, subject to the same content-vs-chrome sizing distinction (14px toolbar vs 12px inline/status)
- `62-empty-states.md` — concrete empty-state content referenced above
