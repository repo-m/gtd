import uuid
import webview
import prefs


class Api:
    def __init__(self, window_id: str, filepath: str | None) -> None:
        self._id = window_id
        self._filepath = filepath

    def getState(self) -> dict:
        return {
            'id': self._id,
            'filepath': self._filepath or '',
            'lastFilepath': prefs.read().get('last_filepath', ''),
        }


def create_window(url: str, filepath: str | None = None):
    window_id = str(uuid.uuid4())
    api = Api(window_id, filepath)
    window = webview.create_window(
        'Req.rw',
        url,
        js_api=api,
        width=1200,
        height=800,
    )
    return window_id, window, api
