'''
## 🧩 **Task — Log Aggregator & Summary Generator**

You are given several JSONL log files (each line is a JSON object) representing ECU events.
Each record looks like this:

```json
{"timestamp_ms": 1728543100, "id": "0x101", "len": 8, "data": [10, 20, 30, 40, 50, 60, 70, 80]}
```

Some lines may be **invalid** (missing fields, wrong data length, etc.).


2. Reads all logs safely and validates each line:
   * Skip invalid entries but **count how many were skipped**.
   * Validation rule: all required keys exist and `len(data) == len`.
3. Aggregates by message `id`:

   * Count frames per ID.
   * Sum total bytes transmitted per ID.
   * Compute **average inter-arrival time** per ID from sorted timestamps.
4. Writes a summary CSV `summary.csv` with columns:

   ```
   id,count,total_bytes,avg_delta_ms
   ```
5. Prints a final JSON summary to **stdout**:

   ```json
   {"total_frames": 123, "unique_ids": 8, "skipped": 3}
   ```

### ⚙️ **Requirements**

* Use `with open()`, `json`, `csv`, `defaultdict`, and type hints.
* Handle errors gracefully with `try/except` and `sys.exit(1)` on fatal errors.
* Code should be modular (`main()`, helper functions) and PEP-8 compliant.
* Add a short docstring to each function.

'''
import argparse
import json

def print_json(agg_data: dict) -> bool:
    '''Prints a final JSON summary to stdout.'''


def write_summary_csv (agg_data: dict) -> bool:
    '''Writes a summary CSV `summary.csv` with columns'''


def aggregate_ids(content: dict) -> list[dict]:
    '''Aggregates by message `id`.'''
    result: list[dict] = []
    for i in content:
        if i["id"] not in result:
            result.append(i["id"])
            result[i["id"]] = ["timestamp_ms": i["timestamp_ms"]]
    print(result)



def validate_data(content: dict) -> dict:
    '''Validates lines with json objects. Some lines may be **invalid** (missing fields, wrong data
    length, etc.).'''
    result = {}
    valid_keys = ("timestamp_ms", "id", "len", "data")
    data_skipped = 0
    for v, k in zip(valid_keys, content.keys()):
        if v != k:
            print("Missing keys. Data skipped.")
    if len(content["data"]) != content["len"]:
        print("Invalid data: len != Data lenght. Data skipped")
        data_skipped += 0
        result = content
    else:
        result = content
    return result


def read_logs(path: str) -> list[dict]:
    '''Reads all logs safely and validates each line.'''
    result: list[dict] = []
    for i in range(len(path)):
        try:
            with open(path[i], "r") as f:
                for line in f:
                    content = json.loads(line)
                    valid_content = validate_data(content)
                    result.append(valid_content)
        except OSError:
            print("ERROR")
    print(result)
    return result


def main():
    '''Main entry point for the script'''
    #tbd: logger instead of print
    parser = argparse.ArgumentParser(description="log aggregator")
    parser.add_argument("--files", nargs='+', type = str, help="e.g. log1.jsonl log2.jsonl")
    args = parser.parse_args()
    
    if args.files:
        content = read_logs(args.files)
        agg_data = aggregate_ids(content)
        write_summary_csv(agg_data)
        print_json(agg_data)
    

if __name__ == "__main__":
    main()

