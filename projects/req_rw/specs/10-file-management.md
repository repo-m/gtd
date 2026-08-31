---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: File Management

Files are stored as YAML with the `.rq` extension. The format is the same whether the app runs as a desktop app or in a browser; the mechanism for reading/writing differs.

---

## File format

A `.rq` file is YAML. Top-level keys:

| Key | Type | Notes |
|-----|------|-------|
| `title` | string | Human-readable document title |
| `identifier` | UUID string | Stable document identity (used in ReqIF export and cross-file paste merge detection) |
| `prefix` | string | Short prefix used in link labels, e.g. `REQ` → `REQ-1` |
| `description` | string | Free-text document description |
| `max` | integer | Highest requirement id ever assigned (monotonically increasing) |
| `next` | integer | Pre-computed next id (`max + 1`); persisted so readers can allocate ids without scanning |
| `root` | integer | Id of the root requirement |
| `requirements` | list of Req | Sorted by id on write |
| `fields` | list of FieldDef | Custom field definitions |
| `types` | list of TypeDef | Custom type definitions (filtered to built-in types on write) |

View configuration (named views, column widths, active view) is **not** stored in `.rq` files. It lives in user-specific workspace preferences (see `13-workspace-prefs.md`). `.rq` files are pure requirement data.

Each Req in `requirements`:

| Key | Notes |
|-----|-------|
| `id` | Unique integer |
| `heading` | If present, this is a section heading |
| `text` | Rich text content (serialized Lexical editor state as JSON string) |
| `children` | Ordered list of child req ids (empty list or absent if no children) |
| `links` | List of link targets (integer id, URL string, or `{label, href}` object) |
| custom fields | Any other field defined in `fields` |

Each FieldDef in `fields`:

| Key | Type | Notes |
|-----|------|-------|
| `name` | string | Unique key used in requirements and view columns |
| `type` | string | One of: `String`, `RichText`, `Integer`, `Real`, `Boolean`, `Date`, `Enumeration`, `Links` |
| `editable` | boolean | Whether the field can be edited inline in the table |
| `values` | list of string | Allowed values; present only when `type` is `Enumeration` |

### Default fields in new files

`getNewFileState()` seeds two fields so a freshly created document is immediately useful:

```yaml
fields:
  - name: Status
    type: Enumeration
    editable: true
    values: [Draft, In Review, Approved, Deprecated]
  - name: Category
    type: Enumeration
    editable: true
    values: [Functional, Non-Functional, Safety, Interface, Performance]
```

These are regular custom fields — users can rename, modify, or delete them via the Attributes dialog.

---

## Operations

### New file

- Desktop: `api.new()` → dispatches `fileInit` with `getNewFileState()` inline. Replaces the current window's document state; no new window is opened.
- Web: `api.new()` → dispatches `fileInit` with `getNewFileState()` (a single heading + one text req) inline.

### Open file

- Desktop: `api.open()` → `GET /window/<id>/api/dialog/file/open` → OS open dialog → if a filepath is returned, reads the file via `GET /window/<id>/api/file` and dispatches `fileInit` into the current window. Replaces current document; no new window.
- Web: `api.open()` → programmatically clicks a hidden `<input type="file">` → on `change`, reads the file text, parses YAML, dispatches `fileInit`.

### Save file

- Desktop: `api.save(filepath?)` → serialises Redux state to YAML (`storeToYaml`) → `POST /window/<id>/api/file`
- Web: `api.save()` → creates a `data:` URI blob and triggers an `<a download>` click

### Save As

- Desktop only: `api.saveAs()` → `GET /window/<id>/api/dialog/file/save` → OS save dialog → returns new filepath → calls `save(filepath)`
- Web: not separately implemented (same as save, always prompts browser download)

---

## Serialisation pipeline

```
Redux state (fileSlice present)
  └─ stateToFile()    ← drops internal fields, sorts requirements, strips undefined
      └─ jsonToYaml() ← YAML.stringify with indent:2, indentSeq:false
          └─ written to disk / downloaded

YAML on disk
  └─ yamlToJson()  ← YAML.parse
      └─ fileToState()  ← normalises arrays→dicts, merges FIELD_DEFAULT, assigns UUID if missing
          └─ fileInit dispatch → Redux state
```

Relevant files:
- `app/src/frontend/store/file.ts` – `fileToState`, `stateToFile`, `yamlToJson`, `storeToYaml`, `getNewFileState`
- `app/src/frontend/api/pythonApi.ts` – desktop API
- `app/src/frontend/api/webApi.ts` – web API
- `app/src/backend/app.py` – REST routes
- `app/src/backend/files.py` – raw read/write
- `app/src/backend/dialogs.py` – OS dialog wrappers

## Validation

`fileToState()` applies a validation contract to every `.rq` file it loads. The goal is graceful degradation: a file with incomplete or partially invalid data must never crash the loader; it must always produce a well-formed `FileState`.

### Top-level key policy

All top-level keys are **optional**. Missing or unrecognised values fall back to the defaults listed below:

| Key | Default |
|-----|---------|
| `identifier` | Fresh UUID (`crypto.randomUUID()`) |
| `title` | `''` (empty string) |
| `prefix` | `'REQ'` |
| `description` | `''` (empty string) |
| `max` | `0` |
| `next` | `max + 1` |
| `root` | Id of the first entry in `requirements`, or `null` if the list is empty (see Root fallback below) |
| `requirements` | `[]` (empty list → empty map) |
| `fields` | `[]` (empty list) |
| `types` | `[]` (empty list) |

**Unknown top-level keys** (any key not in the table above) are **silently dropped** on load — they never appear in Redux state.

### FieldDef validation

A `FieldDef` entry in `fields` whose `type` value is not one of the eight recognised types (`String`, `RichText`, `Integer`, `Real`, `Boolean`, `Date`, `Enumeration`, `Links`) is **dropped** and never imported into state. Valid entries are kept in their original order.

### Root fallback

If the `root` value is absent, non-numeric, or references an id that does not appear in the loaded `requirements` map, `root` falls back to:

1. The id of the **first** requirement in the order they appear in the file.
2. `null` if the `requirements` list is empty.

## Related specs

- `12-session-restore.md` — desktop startup auto-reopens last-used file; `app.py` open/save/save-as handlers must call `prefs.write()` after each successful file operation