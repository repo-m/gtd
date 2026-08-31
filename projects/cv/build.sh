#!/bin/bash
set -e
cd "$(dirname "$0")"
mkdir -p output

echo "Building CV..."
npx md-to-pdf --stylesheet themes/match.css cv.md
mv cv.pdf output/cv-match.pdf
echo "Done: output/cv-match.pdf"
ls -lh output/cv-match.pdf
