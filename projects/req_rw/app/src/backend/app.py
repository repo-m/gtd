import json
import os
import re
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

import constants
import dialogs
import files
import prefs

_windows: dict = {}

CONTENT_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.map': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
}


def register_window(window_id: str, window, api) -> None:
    _windows[window_id] = window


class _Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def _send_json(self, data, status: int = 200) -> None:
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        m = re.match(r'^/window/([^/]+)/api/(.+)$', parsed.path)
        if m:
            self._handle_api_get(m.group(1), m.group(2), parsed.query)
            return
        self._serve_static(parsed.path)

    def _handle_api_get(self, window_id: str, endpoint: str, query: str) -> None:
        if endpoint == 'file':
            qs = parse_qs(query)
            filepath = qs.get('filepath', [None])[0]
            if not filepath:
                self._send_json({'error': 'filepath required'}, 400)
                return
            try:
                content = files.read_file(filepath)
                prefs.write({'last_filepath': filepath})
                self._send_json(content)
            except OSError as e:
                self._send_json({'error': str(e)}, 500)
            return

        if endpoint == 'dialog/file/open':
            window = _windows.get(window_id)
            if window is None:
                self._send_json({'error': 'window not found'}, 404)
                return
            filepath = dialogs.open_file_dialog(window)
            self._send_json({'filepath': filepath})
            return

        if endpoint == 'dialog/file/save':
            window = _windows.get(window_id)
            if window is None:
                self._send_json({'error': 'window not found'}, 404)
                return
            filepath = dialogs.save_file_dialog(window)
            self._send_json({'filepath': filepath})
            return

        if endpoint == 'prefs':
            self._send_json(prefs.read())
            return

        self._send_json({'error': 'not found'}, 404)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        m = re.match(r'^/window/([^/]+)/api/(.+)$', parsed.path)
        if not m:
            self.send_response(404)
            self.end_headers()
            return

        window_id, endpoint = m.group(1), m.group(2)
        length = int(self.headers.get('Content-Length', 0))
        data = json.loads(self.rfile.read(length))

        if endpoint == 'file':
            filepath = data.get('filepath')
            content = data.get('content')
            if not filepath or content is None:
                self._send_json({'error': 'filepath and content required'}, 400)
                return
            try:
                files.write_file(filepath, content)
                prefs.write({'last_filepath': filepath})
                self._send_json({'ok': True})
            except OSError as e:
                self._send_json({'error': str(e)}, 500)
            return

        if endpoint == 'window':
            self._send_json({'ok': True})
            return

        if endpoint == 'prefs':
            current_file_state = prefs.read().get('file_state', {})
            incoming_file_state = data.get('file_state', {})
            merged_file_state = {**current_file_state, **incoming_file_state}
            for key, incoming_value in incoming_file_state.items():
                current_value = current_file_state.get(key)
                if isinstance(current_value, dict) and isinstance(incoming_value, dict):
                    merged_file_state[key] = {**current_value, **incoming_value}
            prefs.write({'file_state': merged_file_state})
            self._send_json({'ok': True})
            return

        self._send_json({'error': 'not found'}, 404)

    def _serve_static(self, path: str) -> None:
        if path == '/':
            path = '/index.html'

        fs_path = constants.STATIC_DIR + path

        if not os.path.isfile(fs_path):
            fs_path = os.path.join(constants.STATIC_DIR, 'index.html')

        if not os.path.isfile(fs_path):
            self.send_response(404)
            self.end_headers()
            return

        with open(fs_path, 'rb') as f:
            body = f.read()

        ext = os.path.splitext(fs_path)[1]
        ct = CONTENT_TYPES.get(ext, 'application/octet-stream')
        self.send_response(200)
        self.send_header('Content-Type', ct)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def start_server() -> HTTPServer:
    server = HTTPServer(('127.0.0.1', constants.PORT), _Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server
