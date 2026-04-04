'''
**WP3 — Mini-Project: Log Aggregator - Build a script `day5_log_aggregator.py` that merges and summarizes multiple log files.

* **Core functions**


  * `main()`
    * Read → aggregate → sort → summarize → write CSV → print JSON summary.

* **Error handling**

  * Catch `FileNotFoundError`, `ValueError` gracefully; print to `stderr`.
  * Exit with code `1` on fatal error.

### 🧪 **Tests (test_log_aggregator.py)**

* Use 2–3 small JSONL fixtures.
* Assert merged order and summary counts.
* Verify CSV file creation and correct headers.

'''
import argparse
import json 
from day5_data_trafo import transform_stream, merge_stream


def summarize(records: list[dict]) -> dict:
    '''Return:
    "total_frames": len(records),
    "unique_ids": len({r["id"] for r in records}),
     "first_ts": records[0]["timestamp_ms"],
     "last_ts": records[-1]["timestamp_ms"]'''
    result = []
    return result


def aggregate_logs(files: list[str]) -> list[dict]:
    '''Use `transform_stream()` and `merge_stream()`'''
    
    return merge_stream(transform_stream(files))


def validate_json(d: dict) -> dict:
    '''Skip invalid JSON or missing keys.'''
    print(f"dbg:{d}")
    return d


def read_jsonl(path: str) -> list[dict]:
    '''Safely open and parse each line with `json.loads()`. '''
    result: list[dict] = []
    try:
        with open(path, "r") as f:
            for line in f:
                validate_json(line)
                result = json.loads(line)
    except OSError:
        print("Error")
    return result


def main():
    '''Control flow: Read → aggregate → sort → summarize → write CSV → print JSON summary'''
    parser = argparse.ArgumentParser(description="Log Aggregator")
    parser.add_argument("--file", required=True, help="*.jsonl files")
    parser.add_argument("--out", default="merged.csc",
                        help="default file merged.csc will be genrated")
    args = parser.parse_args()

    if args.file:
        path = args.file
        content = read_jsonl(path)
        print(summarize(aggregate_logs(content)))
    else:
        print("Path missing")


if __name__ == "__main__":
    main()
