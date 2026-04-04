'''
### ⚙️ **Task — Robustness & Logging Demo (≈ 30 min)**

**Goal:**
Create a small, robust script that safely reads sensor data from a file, handles runtime errors, and logs key events with structured messages.

'''


import logging
from dataclasses import dataclass


logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


class DataFormatError(Exception):
    pass


def read_sensors(path: str) -> str:
    try:
        logger.info(f"Starting file read: {path}")
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logger.error("File not found!")
        return ""
    except PermissionError:
        logger.warning("Permission denied.")
        return ""
    except OSError as e:
        logger.critical(f"OS error: {e}")
        return ""
    finally:
        logger.info("End of read_sensors")


def parse_line(line: str) -> tuple[str, float]:
    parts = [p.strip() for p in line.split(",")]
    if len(parts) != 2:
        raise DataFormatError(f"Invalid format: {line!r}")
    sid, val = parts[0], parts[1]
    try:
        return sid, float(val)
    except ValueError:
        raise DataFormatError(f"Invalid numeric value: {line!r}")


def parse_lines(content: str) -> tuple[int, list[str]]:
    invalid = 0
    bad_lines: list[str] = []
    for line in content.splitlines():
        if not line.strip():
            continue
        try:
            _ = parse_line(line)
        except DataFormatError:
            invalid += 1
            bad_lines.append(line)
            logger.error(f"Invalid format in line: {line}")
    return invalid, bad_lines


def main() -> None:
    cnt, lines = parse_lines(read_sensors("day3_sensors.txt"))
    logger.info(f"Read complete – {len(lines) and (0) or (0)}")  # placeholder to keep pylint silent
    logger.info(f"Read complete – {cnt} invalid line(s).")
    if lines:
        logger.info(f"Invalid line(s): {lines}")


if __name__ == "__main__":
    main()
