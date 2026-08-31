# Req.rw — Claude Code Project File

## What this directory is

This is the **spec repository** for Req.rw. It contains no application source code — only specifications that drive AI-assisted implementation via a spec-driven loop.

## Operational rules

Read `AGENT.md` before doing any work. It defines the boot sequence, context isolation, iteration protocol, and all hard constraints.

## What Req.rw is

A desktop + browser requirements management tool:

- **File format:** `.rq` (YAML) — human-readable, Git-mergeable
- **Desktop mode:** Python backend (`uv run app/src/backend/req.py`) + pywebview window + stdlib HTTP server on `:9876`
- **Browser mode:** Pure frontend, Parcel dev server (`npm run web`), no Python
- **Frontend:** React SPA, state via Redux (3 slices: `appSlice`, `fileSlice`, `searchSlice`)
- **Build tool:** Parcel 2 — three targets: `dev`, `web`, `release`

## Source layout (derived from specs)

```
app/
  src/
    backend/         req.py · app.py · gui.py · files.py · dialogs.py · constants.py
    frontend/
      api/           BaseApi · PythonApi · WebApi
      store/         appSlice · fileSlice · searchSlice · searchMiddleware
      views/         TableView · AttributesView · RawStoreView · RawFileView · RegIfView
      components/    MenuBar · SideBar · StatusBar · RichTextEditor · ContextMenu · Modal
      transform/     ReqIF/ · mapping.ts
      constants/     app_constants.ts · field_constants.ts · view_constants.ts
      config.ts      isWeb runtime detection
  build/               Parcel output (gitignored)
  spec/                ReqIF 1.2 reference PDF
  tests/
    fixtures/          .rq fixture files used by both frontend and backend tests
    frontend/          Jest test files (*.test.ts)
    backend/           pytest test files (test_*.py)
```

## Key commands

| Task | Command |
|------|---------|
| Run desktop (dev) | `uv run app/src/backend/req.py --dev` |
| Run browser (dev) | `npm run web` |
| Build release | `npm run release` |
| Run loop | `bash loop.sh` |
| Run tests | `npm test && (cd app && uv run python -m pytest tests/)` |
| Run E2E tests | `npm --prefix app run test:e2e` |

## Spec system layout

```
README.md          Spec map — routing index, load order, scope boundaries
PROMPT.md          Active task directive for the current loop iteration
AGENT.md           Hard operational guardrails for loop mode
fix_plan.md        Mutable state: progress, blockers, next step (updated each iteration)
test_concept.md    Test strategy — layers, tooling, generation order
specs/
  00-system-architecture.md
  10–11  Manage a document
  20–23  Author requirements
  30–33  Navigate & find
  40–42  Share & trace
```
