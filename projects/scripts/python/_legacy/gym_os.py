'''
| Category          | Function                    | Description                               |
| ----------------- | --------------------------- | ----------------------------------------- |
| **Directories**   | `os.getcwd()`               | Get current working directory.            |
|                   | `os.chdir(path)`            | Change current working directory.         |
|                   | `os.listdir(path)`          | List files and folders in a directory.    |
| **Paths & Files** | `os.path.join(a, b)`        | Join paths safely using system separator. |
|                   | `os.path.exists(path)`      | Check if a path exists.                   |
|                   | `os.remove(path)`           | Delete a file.                            |
|                   | `os.rename(src, dst)`       | Rename or move a file or folder.          |
| **Environment**   | `os.environ`                | Access environment variables.             |
|                   | `os.getenv('VAR', default)` | Get environment variable value.           |
| **System Info**   | `os.name`                   | Get OS type (`'posix'`, `'nt'`, etc.).    |
|                   | `os.system(cmd)`            | Run a shell command.                      |
'''

import os


def main() -> None:
    path = "/c/m/coding/"
    print(os.getcwd())
    print(os.chdir(path))
    print(os.getcwd())
    print(os.listdir(path))
    print(os.path.exists(path))
    print(os.environ)
    print(os.getenv('VAR'))
    print(os.name)
    os.system("ls")


if __name__ == "__main__":
    main()
