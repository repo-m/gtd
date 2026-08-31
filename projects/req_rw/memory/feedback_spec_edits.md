---
name: feedback_spec_edits
description: When editing spec files, always update frontmatter and README in the same pass
metadata:
  type: feedback
---

When modifying any spec file in `specs/`, always update the following in the same pass — not as a follow-up:

1. Set `updated:` to today's date in the spec file's frontmatter.
2. Clear `implemented:` and `tested:` if they were previously set (reset rule).
3. Update the relevant `*Covers:*` line in `README.md` to reflect new content.

**Why:** The convention is documented in CLAUDE.md and the user had to explicitly remind me after the fact. This is considered complete work, not optional cleanup.

**How to apply:** Before finishing any task that touches spec files, check all three points as a final step.
