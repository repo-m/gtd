# Bug Report: 10-file-management.md
Date: 2026-06-09
Status: FIXED

## Summary
The serialisation pipeline mostly matches the spec, but two deviations were found: an undocumented `next` field is written to disk, and `types` is not filtered to built-in types on write as the spec requires.

## Bugs

### Bug 1: `next` field written to file but not in spec
- **Location:** `src/frontend/store/file.ts:93`
- **Issue:** `stateToFile` includes `next: state.next` in the serialised output. The spec's file format table does not list `next` as a top-level key.
- **Expected:** Only the fields listed in the spec (`title`, `identifier`, `prefix`, `description`, `max`, `root`, `requirements`, `views`, `fields`, `types`, `defaultView`) should be written. `next` is a derived internal value (`max + 1`) and should not be persisted.
- **Status:** FIXED

### Bug 2: `types` not filtered to built-in types on write
- **Location:** `src/frontend/store/file.ts:98`
- **Issue:** `stateToFile` writes `types: state.types` verbatim. The spec states the `types` field is "filtered to built-in types on write", but no filtering is applied.
- **Expected:** `stateToFile` should filter `state.types` to only include built-in type definitions before writing to YAML.
- **Status:** FIXED
