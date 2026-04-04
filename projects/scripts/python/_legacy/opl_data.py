"""
Task 2 — Data Handling & Validation
Parse two JSONL files (logs_a.jsonl, logs_b.jsonl), validate, merge, and write merged.csv.
Logs every skipped record with a reason; raises ValueError if all records are invalid.
"""

from __future__ import annotations
import csv
import json
import logging
from pathlib import Path
from typing import Iterable, Iterator, Tuple, Dict, Any, List

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

Record = Dict[str, Any]

def _strip_inline_comment(line: str) -> str:
    # Allow fixtures with trailing // comments
    return line.split("//", 1)[0].strip()

def read_jsonl(path: Path) -> Iterator[Tuple[Record | None, str | None]]:
    """Yield (record, error) for each line; exactly one of record/error is not None."""
    with path.open("r", encoding="utf-8") as f:
        for lineno, raw in enumerate(f, 1):
            line = _strip_inline_comment(raw)
            if not line:
                continue
            try:
                rec = json.loads(line)
                yield rec, None
            except json.JSONDecodeError as e:
                yield None, f"{path.name}:{lineno} JSON decode error: {e}"

def valid_byte_list(xs: Any) -> bool:
    return isinstance(xs, list) and all(isinstance(b, int) and 0 <= b <= 255 for b in xs)

def validate(rec: Record) -> Tuple[Record | None, str | None]:
    """Return (record, None) if valid; otherwise (None, reason)."""
    if not isinstance(rec, dict):
        return None, "not an object"
    id_ = rec.get("id")
    ts = rec.get("ts")
    ln = rec.get("len")
    data = rec.get("data")
    if not isinstance(id_, str) or not id_:
        return None, "id must be non-empty string"
    if not isinstance(ts, int):
        return None, "ts must be int"
    if not isinstance(ln, int) or ln < 0:
        return None, "len must be non-negative int"
    if not valid_byte_list(data):
        return None, "data must be list[int 0..255]"
    if len(data) != ln:
        return None, "len != len(data)"
    return {"id": id_, "ts": ts, "len": ln, "data": data}, None

def iter_valid_records(files: Iterable[Path]) -> Iterator[Record]:
    for p in files:
        for rec, err in read_jsonl(p):
            if err:
                logging.warning("Skipped: %s", err)
                continue
            ok, reason = validate(rec)
            if ok is None:
                logging.warning("Skipped %s: %s", p.name, reason)
            else:
                yield ok

def write_csv(rows: List[Record], path: Path) -> None:
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["id", "ts", "len", "data"])
        for r in rows:
            w.writerow([r["id"], r["ts"], r["len"], " ".join(map(str, r["data"]))])

def main() -> int:
    inputs = [Path("logs_a.jsonl"), Path("logs_b.jsonl")]
    records = list(iter_valid_records(inputs))
    if not records:
        raise ValueError("All records invalid; nothing to write.")
    # Optional: sort by ts then id for stable output
    records.sort(key=lambda r: (r["ts"], r["id"]))
    write_csv(records, Path("merged.csv"))
    logging.info("Wrote %d valid records to merged.csv", len(records))
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValueError as e:
        logging.error("%s", e)
        raise SystemExit(1)