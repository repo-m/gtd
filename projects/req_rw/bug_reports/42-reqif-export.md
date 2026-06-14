# Bug Report: 42-reqif-export.md
Date: 2026-06-09
Status: FIXED

## Summary
The core export/import pipeline works end-to-end (RegIfView preview, Web export/import, and Desktop export/import are all wired up), but several spec requirements are not implemented: SpecRelations export is stubbed out, datatypes are hard-coded to a single String instead of one-per-field, the UUID generation scheme doesn't follow the spec, the REQ-IF-VERSION value is wrong, the Desktop dialog calls lack file-type filters, and the full set of individual builder files named by the spec do not exist.

## Bugs

### Bug 1: SpecRelations not exported from `req.links`
- **Location:** `src/frontend/transform/ReqIF/ReqIF.ts:147`
- **Issue:** `<SPEC-RELATIONS>` is emitted as an empty stub. The comment reads "SpecRelations export is out of scope". The spec says SpecRelations must be built from `req.links`.
- **Expected:** Iterate `req.links` for each requirement and emit `<SPEC-RELATION>` elements inside `<SPEC-RELATIONS>`.
- **Status:** FIXED

### Bug 2: Only a single String datatype is generated regardless of field types
- **Location:** `src/frontend/transform/mapping.ts:106-108`
- **Issue:** `mapToParams` always produces exactly one `DATATYPE-DEFINITION-STRING`. The spec requires "one per field, mapped through `content.types[field.type]`", supporting Boolean, Date, Enumeration, Integer, Real, String, and XHTML types.
- **Expected:** Iterate the document's fields, resolve each field's type through `content.types[field.type]`, and emit one datatype definition per distinct field type.
- **Status:** FIXED

### Bug 3: UUID namespace for built-in datatypes uses hardcoded URL namespace instead of APP_IDENTIFIER
- **Location:** `src/frontend/transform/mapping.ts:77-81`
- **Issue:** `stableId` uses the hardcoded URL-namespace UUID `6ba7b810-9dad-11d1-80b4-00c04fd430c8` for all identifiers. The spec states: "UUID (v5, namespaced by `APP_IDENTIFIER` for built-in types or the document identifier for custom types)". `APP_IDENTIFIER` is `'req-rw'` (a string, not a UUID namespace), but the spec intent is that it seed the namespace for built-in types, distinct from the document-specific namespace.
- **Expected:** Use `APP_IDENTIFIER` (or a UUID derived from it) as the v5 namespace when generating identifiers for built-in types; use the document identifier as the namespace for custom types.
- **Status:** FIXED

### Bug 4: REQ-IF-VERSION is '1.0' instead of '1.2'
- **Location:** `src/frontend/transform/ReqIF/ReqIF.ts:48`
- **Issue:** `<REQ-IF-VERSION>` is hard-coded to `'1.0'`. The spec document is ReqIF 1.2 and the feature spec states this tool reads/writes ReqIF 1.2.
- **Expected:** `<REQ-IF-VERSION>1.2</REQ-IF-VERSION>`
- **Status:** FIXED

### Bug 5: Desktop import dialog does not filter for `.reqif` / `.reqifz`
- **Location:** `src/frontend/api/PythonApi.ts:125`
- **Issue:** `importReqIf` calls `${this.baseUrl}/dialog/file/open` with no file-type filter parameter. The spec requires "OS open dialog for `.reqif` / `.reqifz` files". The Web path correctly uses `input.accept = '.reqif,.reqifz'` (`WebApi.ts:92`) but the Desktop path does not pass an equivalent filter to the backend dialog endpoint.
- **Expected:** Pass a file-extension filter (e.g., `?accept=.reqif,.reqifz`) to the dialog API so the OS file-picker restricts to `.reqif` and `.reqifz` files.
- **Status:** FIXED

### Bug 6: Desktop export dialog does not hint `.reqif` extension
- **Location:** `src/frontend/api/PythonApi.ts:101`
- **Issue:** `exportReqIf` calls `${this.baseUrl}/dialog/file/save` with no extension hint. The spec says "OS save dialog for a `.reqif` filepath". The WebApi download correctly appends `.reqif` to the filename (`WebApi.ts:83`) but the Desktop dialog gets no such hint.
- **Expected:** Pass a default filename with `.reqif` extension (or an extension filter) to the save-dialog endpoint.
- **Status:** FIXED

### Bug 7: Individual ReqIF builder files named by the spec do not exist
- **Location:** `src/frontend/transform/ReqIF/` (directory)
- **Issue:** The spec's builder table names these files: `ReqIFHeader.ts`, `ReqIFContent.ts`, `RegIfDocument.ts`, `ReqIFElement.ts`, `DatatypeDefinitionBoolean.ts`, `DatatypeDefinitionDate.ts`, `DatatypeDefinitionEnumeration.ts`, `DatatypeDefinitionInteger.ts`, `DatatypeDefinitionReal.ts`, `DatatypeDefinitionString.ts`, `DatatypeDefinitionXHTML.ts`, `AttributeValue.ts`, `Identifiable.ts`, `SpecElementWithAttributes.ts`, `Specification.ts`. None of these files exist; all logic is consolidated inside `ReqIF.ts`.
- **Expected:** Each builder class/file listed in the spec table should exist as a separate module.
- **Status:** FIXED

### Bug 8: `XMLDocument.ts` and `XMLElement.ts` are missing
- **Location:** `src/frontend/transform/` (directory)
- **Issue:** The spec lists `src/frontend/transform/XMLDocument.ts` and `XMLElement.ts` as relevant files. Neither exists in the repository.
- **Expected:** Both helper files should exist under `src/frontend/transform/`.
- **Status:** FIXED
