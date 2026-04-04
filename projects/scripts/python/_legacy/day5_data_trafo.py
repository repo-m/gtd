'''
WP2 — Data Transformation
'''
import csv

def normalize_event(evt: dict) -> dict:
    '''Normalize data'''
    invalid_keys = ["ts", "timestamp"]
    valid_keys = {"timestamp_ms", "id", "len", "data"}
    result: dict = {}
    data:list = []

    for k in evt:
        if k in invalid_keys:
            if isinstance(evt[k], int):
                result["timestamp_ms"] = evt[k]
            else:
                raise TypeError
        if k == "timestamp_ms" and not isinstance(evt[k], int):
            raise TypeError
        if k == "id":
            if isinstance(evt["id"], int):
                result["id"] = hex(evt["id"])
            elif isinstance(evt["id"], str):
                result["id"] = evt["id"].lower()
            else:
                raise TypeError
        if k == "data":
            if isinstance(evt["data"], str):
                raise TypeError
            else:
                data = evt["data"]
            for i in range(len(data)):
                if not (0 <= data[i] <= 255):
                    print(f"Data {data[i]} out of range. Data set to 255")
                    raise ValueError
            result["data"] = data
    if not valid_keys.issubset(result.keys()):
        for i in list(valid_keys - result.keys()):
            if i == "len":
                result["len"] = len(result["data"])
            else:
                raise ValueError
    return result

def transform_stream(records: list[dict]) -> list[dict]:
    '''Transform stream'''
    result = []
    for v in records:
        try:
            result.append(normalize_event(v))
        except ValueError:
            continue
        except TypeError:
            continue
        else:
            print("ERROR")
    result.sort(key = lambda x: x["timestamp_ms"])
    return result

def merge_stream(*streams: list[list[dict]]) -> list[dict]:
    '''Merge stream'''
    result = []
    for v in streams:
        result = result + v
    result.sort(key = lambda x: x["timestamp_ms"])
    return result

def write_csv(records: list[dict], path: str) -> None:
    '''Write records to a CSV file.'''
    try:
        with open(path, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["timestamp_ms", "id", "len", "data"])
            for i in records:
                writer.writerow([i["timestamp_ms"], i["id"], len(i["data"]), i["data"]])
    except OSError:
        print("OS Error")
