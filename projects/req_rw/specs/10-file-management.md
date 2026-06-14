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
| `views` | map | Named column configurations |
| `fields` | list of FieldDef | Custom field definitions |
| `types` | list of TypeDef | Custom type definitions (filtered to built-in types on write) |
| `defaultView` | string | Name of the view to activate on open |

Each Req in `requirements`:

| Key | Notes |
|-----|-------|
| `id` | Unique integer |
| `heading` | If present, this is a section heading |
| `text` | Rich text content (serialized Lexical editor state as JSON string) |
| `children` | Ordered list of child req ids (empty list or absent if no children) |
| `links` | List of link targets (integer id, URL string, or `{label, href}` object) |
| custom fields | Any other field defined in `fields` |

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
- `src/frontend/store/file.ts` – `fileToState`, `stateToFile`, `yamlToJson`, `storeToYaml`, `getNewFileState`
- `src/frontend/api/pythonApi.ts` – desktop API
- `src/frontend/api/webApi.ts` – web API
- `src/backend/app.py` – REST routes
- `src/backend/files.py` – raw read/write
- `src/backend/dialogs.py` – OS dialog wrappers
