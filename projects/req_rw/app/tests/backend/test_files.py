import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src/backend'))

import files


def test_round_trip_utf8(tmp_path):
    filepath = str(tmp_path / 'doc.rq')
    content = 'title: "Café — 需求 — naïve"\n'
    files.write_file(filepath, content)
    assert files.read_file(filepath) == content


def test_write_overwrites_existing_content(tmp_path):
    filepath = str(tmp_path / 'doc.rq')
    files.write_file(filepath, 'first version, much longer than the second\n')
    files.write_file(filepath, 'second\n')
    assert files.read_file(filepath) == 'second\n'


def test_read_nonexistent_path_raises(tmp_path):
    filepath = str(tmp_path / 'missing.rq')
    with pytest.raises(FileNotFoundError):
        files.read_file(filepath)


def test_write_creates_new_file(tmp_path):
    filepath = str(tmp_path / 'new.rq')
    assert not os.path.exists(filepath)
    files.write_file(filepath, 'content')
    assert os.path.exists(filepath)
    assert files.read_file(filepath) == 'content'
