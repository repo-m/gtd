#!/usr/bin/env bash
# Unified launcher for Req.rw.
# Usage:
#   scripts/start.sh          — start desktop mode (production build)
#   scripts/start.sh --dev    — start desktop mode with HMR watch
#   scripts/start.sh web      — start browser dev server
set -euo pipefail

if [ "${1:-}" = "web" ]; then
  npm run web
else
  uv run src/backend/req.py "$@"
fi
