'''
# Coding Challenge 2

## 🧩 Task — JSONL Log Aggregator & Anomaly Finder

* **Build** `log_tool.py` (CLI) to read **one or more** JSONL files of events with keys: `ts_ms:int`, `level:str` in {DEBUG,INFO,WARN,ERROR}, `service:str`, `msg:str`, optional `user_id:str`.
* **Outputs**:

  * Write **CSV** `summary.csv` with columns: `service,level,count`.
  * Detect anomalies: (a) **time regressions** per service (non-monotonic `ts_ms`); (b) **bursts** > `N` events within any 1000 ms window per service (default `N=100`); write each anomaly as one line to **stderr**.

* **Rules**: skip invalid lines (count `skipped`), missing file → print clear error to stderr and **exit code 2**; success → **exit 0**; use stdlib only (`argparse, json, collections, datetime, itertools, csv, logging`).
* **Complexity**: one pass + per-service sort for anomaly checks is fine (**O(n log n)**).

**Expected (abridged)**

* **stdout (JSON)**: `{"total_events":4,"per_level":{"INFO":2,"ERROR":1,"WARN":1},"per_service":{"auth":3,"api":1},"top5_users":["u1","u2"],"first_ts":990,"last_ts":2000,"skipped":0}`
* **stderr**: `REGRESSION service=auth at ts_ms=990 (previous=1010)`
* **CSV**:

```
service,level,count
auth,INFO,2
auth,ERROR,1
api,WARN,1
```


**What I’ll grade (after you submit code)**

* **Correctness** (filters, counts, anomalies, exit codes)
* **Code quality** (structure, typing/docstrings, PEP-8, logging, clear errors)
* **Tests** (at least 2–3 pytest cases: happy path, invalid line, regression/burst).


'''
import argparse
import json

def parse_args():
    '''parse args'''

def read_jsonl(paths: list) -> list[dict]:
    '''Reads content of json-files and returns content as list[dict]'''
    content = []
    for path in paths:
        try: 
            with open(path, "r") as f:
                for line in f:
                    content.append(json.loads(line))
        except OSError:
            print("Error OS")
        else:
            print("Error in function read_jsonl")
    return content


def summarize(content: list[dict]) -> dict[dict]:
    '''Summarizes content to `total_events`, `per_level`, `per_service`, `top5_users`, `first_ts`, `last_ts`.'''
    total_events = len(content)
    levels = {}
    services = {}
    users = {}
    top5_users = {}
    first_ts = 0
    last_tst = 0
    result = {
        "total_events": total_events,
        "levels": levels,
        "services": services,
        "top5_users": top5_users,
        "first_ts": first_ts,
        "last_tst": last_tst
    }

    for v in content:
        if v.get("level") not in levels:
            levels[v["level"]] = {"events": 1}
        else:
            levels[v["level"]]["events"] += 1
        if v.get("service") not in services:
            services[v["service"]] = {"events": 1}
        else:
            services[v["service"]]["events"] += 1
        if v.get("user_id") != None and v.get("user_id") not in users:
            users[v["user_id"]] = {"count": 1}
        elif v.get("user_id") != None:
            users[v["user_id"]]["count"] += 1

    print(levels)
    print(services)
    print(users)
    return result

def find_anomalies(events, burst_n): ...


def write_csv(counts, path): ...


def main():
    '''Main entry point of the script'''
    #`--since TS`/`--until TS` (ms; filter range), `--min-level {DEBUG,INFO,WARN,ERROR}`, `--verbose` (logging INFO).
    parser = argparse.ArgumentParser(description="JSONL Log Aggregator & Anomaly Finder")
    parser.add_argument("--input", required=True, nargs="+", help="e.g file.jsonl file2.jsonl")
    parser.add_argument("--out", default="summary.csv", help="default summary.csv")
    parser.add_argument("--burst", type=int, default=100, help="default = 100")
    parser.add_argument("--since", help="ms; filter range")
    parser.add_argument("--until", help="ms; filter range")
    parser.add_argument("--min-level", help="{DEBUG,INFO,WARN,ERROR}")
    parser.add_argument("--verbose", help="logging INFO")
    args = parser.parse_args()
    # add logger

    if args.input:
        content = read_jsonl(args.input)
        summary = summarize(content)



if __name__ == "__main__":
    main()
