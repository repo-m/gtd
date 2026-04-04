'''
WP3 – Fault Counter Project: Parse one or more JSON log files containing ECU fault events, validate entries, and produce a fault summary with counts and timestamps.

#### 🧠 **Task Description**

Write a Python script that:

4. Aggregates:
   * Track first and last `timestamp` per `code`.
5. Prints a final JSON summary to stdout and writes `fault_summary.csv` with columns:

   ```
   code,count,severity_count,first_ts,last_ts
   ```
#### ⚙️ **Requirements**

* Structure your code into clean helper functions:
  * `write_csv(summary: dict)`
* Use `with open()` and `json.loads()` safely.
* Print well-formatted JSON summary using `json.dumps(summary, indent=4)`.
* All logic should complete within 30 minutes of focused coding.
'''
import logging
import argparse
import json


logging.basicConfig(level = logging.DEBUG)
logger = logging.getLogger(__name__)

def summarize(records: list[dict]) -> dict:
    summary: dict = {"timestamp check": ' ', "severity check": '', "Count of fault code": 0,
                     
                     }
    if all(i["timestamp"] for i in records):
        summary["timestamp check"] = "timestamps present"
    else:
        summary["timestamp check"] = "Not all timestamps present"
    if any(i["severity"] not in ["info", "warn", "error"] for i in records):
        summary["severity check"] = "Not all severities covered"
    else:
        summary["severity check"] = "All severities covered"
    for i in records:
        if i['code'] == "fault":
            summary["Count of fault code"] += 1
        if i["severity"] not in summary:
            summary[i["severity"]] = 1
        else:
            summary[i["severity"]] += 1           
    return summary


def load_records(files: list[str]) -> list[dict]:
    result: list[dict] = []
    for path in files:
        try:
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                if not line:
                    continue
                try:
                    result.append(json.loads(line))
                except json.JSONDecodeError:
                    logging.warning(f"Skip invalid JSON in {path}: {line!r}")
        except OSError as e:
            logging.error(f"Cannot open {path}: {e}")
    return result


def main():
    parser = argparse.ArgumentParser(description="Fault Counter Project")
    parser.add_argument("--files", nargs='+', help="e.g. file1.json file2.json")
    args = parser.parse_args()

    if args.files is not None:
        logger.debug(f"arguments:{args.files}")
        d_json = load_records(args.files)
        logger.info(f"load record({args.files}): {d_json}")
        logger.info(f"summarize{summarize(d_json)}")
        


if __name__ == "__main__":
    main()
