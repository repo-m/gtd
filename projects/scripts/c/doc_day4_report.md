# 🗓️ DAY 4 REPORT

* **Overall C readiness:** **7.5/10** — solid progress, good safety mindset; a few consistency gaps keep you from 9/10.
* **Types & formats:** Occasional mixing of `size_t`/`int`, and wrong specifiers (e.g., `%u` for `int16_t`); standardize on fixed-width types and matching `printf/scanf` (or `strto*` + range checks).
* **API contracts:** Missing unified error enums and `const` correctness; avoid storing `-1` in `size_t`, always check `realloc` via a temp, and document preconditions/invariants.
* **Parsing robustness:** Still reliant on `sscanf` forms; prefer tokenization + `%n` or `strtol` with `endptr`, handle duplicates/missing keys/whitespace rigorously, and build small unit tests.
* **Algorithms & layout:** Initial binary-search logic errors and some uncertainty with bitfields’ portability; keep practicing edge-case tests, left-most policies, and prefer masks/shifts over compiler-dependent bitfields.

