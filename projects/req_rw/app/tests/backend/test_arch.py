"""Architectural boundary gate.

These tests scan the source tree with plain string/regex checks (no
ESLint custom rules, no `tsc --noEmit` wiring) to enforce the layering
rules from specs/00-system-architecture.md:

1. `frontend/config.ts` exports only `isWeb`.
2. `PythonApi` and `WebApi` both extend `BaseApi`.
3. No direct `fetch(` calls outside `frontend/api/`.
4. No literal `pywebview` references outside the API bridge layer
   (`config.ts`, `global.d.ts`, and files under `frontend/api/`).
5. The Python backend never imports frontend code.
"""

import os
import re

REPO_ROOT = os.path.join(os.path.dirname(__file__), '../..')
FRONTEND_DIR = os.path.join(REPO_ROOT, 'src/frontend')
BACKEND_DIR = os.path.join(REPO_ROOT, 'src/backend')


def _read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def _walk_files(root, extensions=None):
    for dirpath, _dirnames, filenames in os.walk(root):
        for filename in filenames:
            if extensions and not filename.endswith(extensions):
                continue
            yield os.path.join(dirpath, filename)


def test_config_exports_only_is_web():
    content = _read(os.path.join(FRONTEND_DIR, 'config.ts'))
    exports = re.findall(r'^export\s+(?:const|let|var|function|class)\s+(\w+)', content, re.MULTILINE)
    exports += re.findall(r'^export\s*{\s*([^}]+)\s*}', content, re.MULTILINE)
    # Flatten any brace-style export lists into individual names.
    flattened = []
    for name in exports:
        flattened.extend(part.strip() for part in name.split(','))
    assert flattened == ['isWeb'], (
        f'config.ts must export only `isWeb`, found: {flattened}'
    )


def test_python_api_and_web_api_extend_base_api():
    for filename, classname in (('PythonApi.ts', 'PythonApi'), ('WebApi.ts', 'WebApi')):
        content = _read(os.path.join(FRONTEND_DIR, 'api', filename))
        assert re.search(rf'class\s+{classname}\s+extends\s+BaseApi\b', content), (
            f'{filename} must declare `class {classname} extends BaseApi`'
        )


def test_no_direct_fetch_outside_api_dir():
    api_dir = os.path.join(FRONTEND_DIR, 'api')
    violations = []
    for path in _walk_files(FRONTEND_DIR, extensions=('.ts', '.tsx')):
        if os.path.commonpath([os.path.abspath(path), os.path.abspath(api_dir)]) == os.path.abspath(api_dir):
            continue
        content = _read(path)
        if re.search(r'\bfetch\(', content):
            violations.append(os.path.relpath(path, REPO_ROOT))
    assert not violations, (
        f'`fetch(` calls found outside frontend/api/: {violations}'
    )


def test_no_pywebview_outside_api_bridge():
    api_dir = os.path.join(FRONTEND_DIR, 'api')
    allowed_files = {
        os.path.abspath(os.path.join(FRONTEND_DIR, 'config.ts')),
        os.path.abspath(os.path.join(FRONTEND_DIR, 'global.d.ts')),
    }
    violations = []
    for path in _walk_files(FRONTEND_DIR, extensions=('.ts', '.tsx')):
        abs_path = os.path.abspath(path)
        if abs_path in allowed_files:
            continue
        if os.path.commonpath([abs_path, os.path.abspath(api_dir)]) == os.path.abspath(api_dir):
            continue
        content = _read(path)
        if 'pywebview' in content:
            violations.append(os.path.relpath(path, REPO_ROOT))
    assert not violations, (
        f'`pywebview` referenced outside config.ts/global.d.ts/api/: {violations}'
    )


def test_backend_does_not_import_frontend():
    violations = []
    for path in _walk_files(BACKEND_DIR, extensions=('.py',)):
        content = _read(path)
        if re.search(r'\b(?:import|from)\s+.*\bsrc[./]frontend\b', content) or \
                re.search(r'\bfrom\s+frontend\b', content) or \
                re.search(r'\bimport\s+frontend\b', content):
            violations.append(os.path.relpath(path, REPO_ROOT))
    assert not violations, (
        f'Backend files must not import frontend code: {violations}'
    )
