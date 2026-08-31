#!/usr/bin/env node
// Bridges jest@30's --testPathPatterns flag from the old --testPathPattern spelling.
const { execSync } = require('child_process');
const args = process.argv.slice(2)
  .map(a => a.replace(/^--testPathPattern=/, '--testPathPatterns='));
try {
  execSync(['jest', ...args].join(' '), { stdio: 'inherit' });
} catch {
  process.exit(1);
}
