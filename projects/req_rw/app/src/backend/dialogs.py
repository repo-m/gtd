import webview


def open_file_dialog(window) -> str | None:
    result = window.create_file_dialog(
        webview.OPEN_DIALOG,
        file_types=('Req files (*.rq)', 'All files (*.*)'),
    )
    if result:
        return result[0]
    return None


def save_file_dialog(window) -> str | None:
    result = window.create_file_dialog(
        webview.SAVE_DIALOG,
        file_types=('Req files (*.rq)', 'All files (*.*)'),
    )
    if result:
        return result[0]
    return None
