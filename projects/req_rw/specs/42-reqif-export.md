---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: ReqIF Import / Export

Req.rw reads and writes **ReqIF 1.2** (Requirements Interchange Format), an XML-based standard for exchanging requirements between tools.

---

## Export

### Preview

The `REGIF` content mode (`RegIfView`) renders the current document as formatted ReqIF XML in a read-only `<pre>` block. It is regenerated from the current Redux state on every render.

```
selectFile(state)
  └─ mapToParams(fileState)    ← maps Redux state to ReqIF parameter structure
      └─ ReqIF(params).render()  ← builds an XML DOM
          └─ XMLSerializer.serializeToString(doc)
              └─ formatXml(xmlString)   ← xml-formatter for indentation
```

### Export to file

The MenuBar *File* tab includes an *Export ReqIF* entry. Triggered via `api.exportReqIf()`:

- **Desktop**: serialises to XML string → OS save dialog for a `.reqif` filepath → `POST /window/<id>/api/file`.
- **Web**: creates a `data:` URI blob and triggers an `<a download>` click.

---

## Import

The MenuBar *File* tab includes an *Import ReqIF* entry. Triggered via `api.importReqIf()`:

- **Desktop**: OS open dialog for `.reqif` / `.reqifz` files → reads XML → `parseReqIF(xmlString)` → `reqIfToState()` → `fileInit` dispatch.
- **Web**: Hidden `<input type="file" accept=".reqif,.reqifz">` click → reads file text → same parse/dispatch path.

### Import pipeline

```
ReqIF XML string
  └─ parseReqIF()    ← parses XML DOM, extracts spec objects and attributes
      └─ reqIfToState()  ← maps ReqIF structure to Req.rw FileState
          └─ fileInit dispatch → Redux state
```

`parseReqIF` and `reqIfToState` live in `app/src/frontend/transform/ReqIF/`.

---

## Transform pipeline (export)

### `mapToParams` (`app/src/frontend/transform/mapping.ts`)

Converts the Redux file state to a parameter object for the `ReqIF` builder:

- **Header**: `title`, `description`, `identifier` (from file state), `reqIFToolId`, `sourceToolId` (from `APP_ID`), `creationTime` (current time)
- **Datatypes**: one per field, mapped through `content.types[field.type]`. Each datatype gets a UUID (v5, namespaced by `APP_IDENTIFIER` for built-in types or the document identifier for custom types) and a `lastChange` timestamp.
- **SpecObjects**: one per requirement, with attribute values mapped from req fields.
- **Specifications**: hierarchy built from the `children` tree.
- **SpecRelations**: built from `req.links`.

### ReqIF builder (`app/src/frontend/transform/ReqIF/`)

| File | Builds |
|------|--------|
| `ReqIF.ts` | Root `<REQ-IF>` document with header, core content, tool extensions |
| `ReqIFHeader.ts` | `<REQ-IF-HEADER>` element |
| `ReqIFContent.ts` | `<REQ-IF-CONTENT>` with datatypes, spec objects, spec relations |
| `RegIfDocument.ts` | XML `Document` with the ReqIF namespace |
| `ReqIFElement.ts` | Generic XML element builder |
| `DatatypeDefinition*.ts` | Builders for each datatype (Boolean, Date, Enumeration, Integer, Real, String, XHTML) |
| `AttributeValue.ts`, `Identifiable.ts`, `SpecElementWithAttributes.ts`, `Specification.ts` | Builders for spec objects |
| `parseReqIF.ts` | Parses ReqIF XML into an intermediate structure |
| `reqIfToState.ts` | Converts parsed ReqIF structure to `FileState` |

---

## Spec reference

The ReqIF 1.2 specification is included in the repo at `spec/2016-07-01_spec_ReqIF_1.2.pdf`.

---

## Relevant files

- `app/src/frontend/views/RegIfView.tsx`
- `app/src/frontend/transform/mapping.ts`
- `app/src/frontend/transform/ReqIF/` (all files)
- `app/src/frontend/transform/XMLDocument.ts`, `XMLElement.ts`
- `spec/2016-07-01_spec_ReqIF_1.2.pdf`