import json

def print_summary_json(path: str, log: dict) -> None:
    '''Prints a JSON summary'''
    try:
        with open(path, "w") as f:
            # ❌ json.dumps() only returns a string — it doesn’t write to file
            # ✅ use json.dump(log, f) instead
            json.dumps(f, log)
    except OSError:
        print("ERROR")


def merge_all_information(logs, log_levels, unique_error):
    # ✅ good structure for final summary
    # ❌ total_files is hardcoded to 1; should count actual .log files
    result = {"total_files": 1, "levels": log_levels, "unique_errors": unique_error}
    return result


def collect_uniqe_error_messages(logs: list) -> list:
    '''Collect unique error messages in records and return result as list'''
    result = []
    for line in logs:
        if "ERROR" in line:
            # ✅ splitting is fine
            # ❌ you assume 3 tokens before the actual message; not always true
            temp = line.split()
            temp = temp[3:]
            temp = " ".join(temp)
            result.append(temp)
    # ❌ you print instead of returning; must return the result to caller
    print(result)


def count_log_level(logs: list) -> dict:
    '''Counts log levels from logs and returns result as dict'''
    result = {"INFO": 0, "ERROR": 0, "WARNING": 0}
    for i in logs:
        # ✅ works, simple and readable
        # ⚠️ can use elif chain, but if multiple keywords exist on a line,
        # only the first match will count — OK for this case
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
        # ✅ graceful error handling
        print("Error")
    return result


def main():
    '''Main entry point for the script'''
    path = "interview4.log"
    path_json = "interview4.json"
    logs = read_log_file(path)
    log_levels = count_log_level(logs)
    unique_error = collect_uniqe_error_messages(logs)  # ❌ this function returns None
    log_info = merge_all_information(logs, log_levels, unique_error)
    print_summary_json(path_json, log_info)  # ❌ will fail because of json.dumps(f, log)


if __name__ == "__main__":
    main()
