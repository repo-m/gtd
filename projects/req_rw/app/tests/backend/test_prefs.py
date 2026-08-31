import os
import sys
from unittest.mock import patch

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src/backend'))

import prefs


def test_read_missing_file(tmp_path, monkeypatch):
    monkeypatch.setattr(prefs, '_PREFS_PATH', str(tmp_path / 'prefs.json'))
    assert prefs.read() == {}


def test_read_missing_directory(tmp_path, monkeypatch):
    monkeypatch.setattr(prefs, '_PREFS_PATH', str(tmp_path / 'nonexistent' / 'prefs.json'))
    assert prefs.read() == {}


def test_round_trip(tmp_path, monkeypatch):
    monkeypatch.setattr(prefs, '_PREFS_PATH', str(tmp_path / '.req_rw' / 'prefs.json'))
    prefs.write({'last_filepath': '/foo/bar.rq'})
    assert prefs.read() == {'last_filepath': '/foo/bar.rq'}


def test_write_silent_on_oserror(tmp_path, monkeypatch):
    monkeypatch.setattr(prefs, '_PREFS_PATH', str(tmp_path / 'prefs.json'))
    with patch('builtins.open', side_effect=OSError('disk full')):
        prefs.write({'last_filepath': '/foo/bar.rq'})
