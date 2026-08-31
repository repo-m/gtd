import json
import os

_PREFS_PATH = os.path.expanduser('~/.req_rw/prefs.json')


def read() -> dict:
    try:
        with open(_PREFS_PATH) as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return {}


def write(data: dict) -> None:
    try:
        os.makedirs(os.path.dirname(_PREFS_PATH), exist_ok=True)
        merged = {**read(), **data}
        with open(_PREFS_PATH, 'w') as f:
            json.dump(merged, f)
    except OSError:
        pass
