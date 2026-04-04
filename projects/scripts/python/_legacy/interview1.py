'''

**Task:**
Write a Python script that parses a log file `can_log.jsonl` where each line is a JSON object with:
* `timestamp_ms` (integer)
* `id` (string, e.g., `"0x101"`)
* `len` (integer)
* `data` (list of integers 0–255)
Your program must:
1. [x] Read the file safely using `with open()` and `json.loads()`.
2. [x] Validate each record (skip invalid ones; e.g., wrong keys, non-matching `len(data)`).
3. [x] Count total frames and unique IDs.
4. For each ID, compute:
   * number of frames
   * total bytes transmitted (`sum(len(data))`)
   * average inter-arrival time (`Δtimestamp_ms` mean).
5. Print a summary JSON (well formatted) to stdout.
You may use only the standard library.

Please begin coding in `solution.py` and **think aloud** as you go. I’ll act like a real interviewer — mostly observing, giving clarifications if you ask, and taking brief notes.
'''

import json

def read_json_file(path: str) -> list[dict]:
    '''reads a json file and returns content as list[dict]'''
    records: list[dict] = []
    valid_keys = ("timestamp_ms", "id", "len", "data")
    total_frames = 0
    total_unique_ids = 0
    id_stats: dict = {}

    try:
        with open(path, "r") as f:
            for line in f:
                r = json.loads(line)
                if r["len"] != len(r["data"]):
                    print("invalid data: non matching len(data)")
                elif "id" not in r:
                    print("invalid data: wrong or missing keys")
                elif "timestamp_ms" not in r:
                    print("invalid data: wrong or missing keys")
                elif "len" not in r:
                    print("invalid data: wrong or missing keys")
                elif "data" not in r:
                    print("invalid data: wrong or missing keys")
                elif r["id"] not in records:
                    total_unique_ids +=1
                    total_frames += 1
                    id_stats[r["id"]] = {"number of frames": 1, 
                                         "total bytes trans": len(r["data"]),
                                         "timestamp_ms": r["timestamp_ms"]}
                    records.append(r)
                else:
                    total_frames += 1
                    id_stats[r["id"]]["number of frames"] += 1
                    id_stats[r["id"]]["total bytes trans"] += len(r["data"])
                    id_stats[r["id"]]["timestamp_ms"] += r["timestamp_ms"]
                    records.append(r)
    except OSError:
        print("OS ERROR")
    records.append(id_stats)

    return records

def main():
    '''main function - main control flow'''
    records = read_json_file("interview1.txt")
    print(records)




if __name__ == "__main__":
    main()