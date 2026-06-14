#!/usr/bin/env python3
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import webview
import app as _app
import constants
import gui


def main() -> None:
    parser = argparse.ArgumentParser(prog=constants.APP_NAME)
    parser.add_argument('--debug', action='store_true')
    parser.add_argument('--dev', action='store_true')
    parser.add_argument('filepath', nargs='?', default=None)
    args = parser.parse_args()

    _app.start_server()

    url = f'http://127.0.0.1:{constants.PORT}/'
    window_id, window, api_obj = gui.create_window(url, args.filepath)
    _app.register_window(window_id, window, api_obj)

    webview.start(debug=args.debug or args.dev)


if __name__ == '__main__':
    main()
