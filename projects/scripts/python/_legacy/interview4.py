'''
### 🧩 **Interview Task — Log Aggregator with Error Summary**

### **Your Task**

Write a Python script `log_summary.py` that:

1. Reads **all `.log` files** in a given folder.
2. Counts how many times each log level appears (`INFO`, `WARNING`, `ERROR`).
3. Collects all unique error messages (the part after `ERROR`).
4. Prints a **JSON summary** like:

```json
{
  "total_files": 3,
  "levels": {"INFO": 45, "WARNING": 12, "ERROR": 8},
  "unique_errors": [
    "Database connection failed",
    "Timeout while fetching data"
  ]
}
```

5. Handles invalid lines gracefully (skip malformed entries).
6. Uses **classes and clean structure** (e.g., `LogParser`, `Aggregator`).
7. Only use the Python standard library.

---

### ⏱️ **Timebox:** 45 minutes

### 🧠 **Bonus ideas:**

* Add CLI arguments (`--path`, `--output summary.json`)
* Add optional sorting by severity or timestamp

'''
import json

def print_summary_json(path: str, log: dict) -> None:
    '''Prints a JSON summary'''
    try:
        with open(path, "w") as f:
            json.dumps(f, log)

    except OSError:
        print("ERROR")


def merge_all_information(logs, log_levels, unique_error):
    result = {"total_files":1, "levels": log_levels, "unique_errors": unique_error}
    return result


def collect_uniqe_error_messages(logs: list) -> list:
    '''Collect unique error messages in records and return result as list'''
    result = []
    for line in logs:
        if "ERROR" in line:
            temp = line.split()
            temp = temp[3:]
            temp = " ".join(temp)
            result.append(temp)
    return result


def count_log_level(logs: list) -> dict:
    '''Counts log levels from logss and returns result as dict'''
    result = {"INFO": 0, "ERROR": 0, "WARNING": 0}
    for i in logs:
        if "INFO" in i:
            result["INFO"] += 1
        elif "ERROR" in i:
            result["ERROR"] += 1
        elif "WARNING" in i:
            result["WARNING"] += 1
    return result


def read_log_file(path: str) -> list:
    '''Reads log files and returns content as list.'''
    result: list = []
    try:
        with open(path, "r") as f:
            for line in f:
                result.append(line)
    except OSError:
        print("Error")
    return result


def main():
    '''Main entry point for the script'''
    path = "interview4.log"
    path_json = "interview4.json"
    logs = read_log_file(path)
    log_levels = count_log_level(logs)
    unique_error = collect_uniqe_error_messages(logs)
    log_info = merge_all_information(logs, log_levels, unique_error)
    print_summary_json(path_json, log_info)


if __name__ == "__main__":
    main()
