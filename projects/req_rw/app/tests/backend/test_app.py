import json
import sys
import os
import threading
from http.server import HTTPServer
import urllib.request

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src/backend'))

import prefs as prefs_module
from app import _Handler


@pytest.fixture
def app_server(tmp_path, monkeypatch):
    monkeypatch.setattr(prefs_module, '_PREFS_PATH', str(tmp_path / 'prefs.json'))
    httpd = HTTPServer(('127.0.0.1', 0), _Handler)
    port = httpd.server_address[1]
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    yield f'http://127.0.0.1:{port}'
    httpd.shutdown()


def test_get_prefs_returns_full_prefs(app_server):
    prefs_module.write({'last_filepath': '/foo.rq'})
    with urllib.request.urlopen(f'{app_server}/window/1/api/prefs') as r:
        data = json.loads(r.read())
    assert data == {'last_filepath': '/foo.rq'}


def test_post_prefs_deep_merges_file_state(app_server):
    prefs_module.write({'last_filepath': '/foo.rq'})
    body = json.dumps({
        'file_state': {'/a.rq': {'active_view': 'default', 'views': {}}}
    }).encode()
    req = urllib.request.Request(
        f'{app_server}/window/1/api/prefs',
        data=body,
        method='POST',
        headers={'Content-Type': 'application/json', 'Content-Length': str(len(body))},
    )
    with urllib.request.urlopen(req) as r:
        result = json.loads(r.read())
    assert result['ok'] is True
    p = prefs_module.read()
    assert p['last_filepath'] == '/foo.rq'
    assert p['file_state']['/a.rq']['active_view'] == 'default'


def _post_prefs(app_server, body_dict):
    body = json.dumps(body_dict).encode()
    req = urllib.request.Request(
        f'{app_server}/window/1/api/prefs',
        data=body,
        method='POST',
        headers={'Content-Type': 'application/json', 'Content-Length': str(len(body))},
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def test_post_prefs_deep_merges_within_file_state_entry(app_server):
    _post_prefs(app_server, {
        'file_state': {'/a.rq': {'active_view': 'default', 'views': {'table': {'sort': 'id'}}}}
    })
    _post_prefs(app_server, {
        'file_state': {'/a.rq': {'filters': {'status': 'open'}}}
    })
    p = prefs_module.read()
    entry = p['file_state']['/a.rq']
    assert entry['active_view'] == 'default'
    assert entry['views'] == {'table': {'sort': 'id'}}
    assert entry['filters'] == {'status': 'open'}
