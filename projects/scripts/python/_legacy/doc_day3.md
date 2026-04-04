# Day 3 — Review & Reflection

## Summary

- Built data models, ops speed tests, search/sort utils, robust reader, and CLI; all pytest green and Pylint clean.
- Chose Python built-ins (Timsort via `sorted`, `bisect`, `heapq`, `Counter`) for correctness and performance.

## Big-O Cheat Sheet

| Structure | Membership | Insert(end) | Notes |
|---|---:|---:|---|
| list | O(n) | O(1) | Mid-insert O(n) |
| set  | O(1) | O(1) | Hash-based |
| dict | O(1) | O(1) | Key→value map |
| tuple | O(1) access | — | Immutable |

## Evidence

- Tests: `pytest -q` → all passing.  
- Lint: `pylint` → 10.00/10 on key files.  
- CLI examples:
  - `python day3_cli.py --nums "1,3,5,7,9" --target 7` → `3`
  - `python day3_cli.py --verbose ...` → INFO logs shown.

## Key Insights

1. Sets/dicts beat lists for membership; prefer dict/set in hot paths.  
2. Stable sort with tuple keys simplifies multi-criteria ordering.  
3. Robustness: custom exceptions + `logging` > `print`, clearer failure modes.

## Gaps & Next Steps

- Add streaming/iterator parsing for large files.  
- Benchmark `nlargest` vs full sort for big *k*.  
- Package layout + `pyproject.toml` and `mypy` type checks.

## Interview Talking Points

- Data modeling with `@dataclass` (immutability trade-offs), error boundaries, and CLI UX design.  
- Choosing built-ins over custom algorithms; when to switch to `bisect`/`heapq`.  
- Logging levels and how to debug failures quickly.
