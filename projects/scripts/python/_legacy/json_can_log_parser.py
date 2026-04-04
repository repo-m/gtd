'''
**Task — JSON CAN log parser (backend-style)**

- Read `logs.jsonl` (one JSON object per line with `timestamp` (ms), `id` (hex/int), `dlc`, `data` array) and produce a summary JSON to stdout plus `counts.csv`.
- Compute: total frames; unique IDs; per-ID frame count (`defaultdict(int)`), total bytes, top-3 IDs; basic validation (skip or flag lines with missing fields, non-matching `len(data)!=dlc`); average inter-arrival time per ID from sorted timestamps.
- Deliverables: `day2_can_parser.py` and `test_can_parser.py` (pytest) with a tiny fixture file asserting totals, per-ID counts, and that invalid records are handled without crashing.

## Example Output – Summary (printed as JSON):

{
    "total_frames": 6,
    "unique_ids": 4,
    "id_summary": {
        "0x101": {"count": 2, "bytes": 16, "avg_delta_ms": 10.0},
        "0x102": {"count": 2, "bytes": 8, "avg_delta_ms": 15.0},
        "0x103": {"count": 1, "bytes": 2, "avg_delta_ms": 0},
        "0x104": {"count": 1, "bytes": 8, "avg_delta_ms": 0}
    },
    "invalid_frames": 1,
    "top_3_ids": ["0x101", "0x102", "0x103"]
}

## Example Output File – day2_counts.csv:

| ID    | Count | Total_Bytes | Avg_Delta_ms |
| ----- | ----- | ----------- | ------------ |
| 0x101 | 2     | 16          | 10.0         |
| 0x102 | 2     | 8           | 15.0         |
| 0x103 | 1     | 2           | 0            |
| 0x104 | 1     | 8           | 0            |

'''
import json
import csv

def create_csv(c, p):
    '''Creates the csv-file p with the data from c.'''
    with open(p, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Count", "Total_Bytes", "Avg_Delta_ms"])
        for can_id, info in c["id_summary"].items():
            writer.writerow([can_id, info["count"], info["bytes"], info["avg_delta_ms"]])


def read_log(p):
    '''Reads the file (in path p), converts json objects in to a dictionary 
    and return it'''
    try:
        with open(p, "r", encoding="utf-8") as f:
            total_frames = 0
            unique_ids = 0
            id_summary = {}
            invalid_frames = 0
            top_3_ids = ["0", "0", "0"]
            timestamps = {}
            avg_delta_ms = 0
            deltas = 0

            try:
                for line in f:
                    di = json.loads(line.strip())
                    if not all (k in di for k in (
                        "timestamp", "id", "dlc", "data")):
                        invalid_frames += 1
                    elif di["dlc"] != len(di["data"]):
                        invalid_frames += 1
                    else:
                        total_frames += 1
                    if di["id"] not in id_summary:
                        unique_ids += 1
                        id_summary[di["id"]] = {
                                                "count": 1, 
                                                "bytes": di["dlc"]
                                                }
                        timestamps[di["id"]] = {"t": [di["timestamp"]]}
                        print(timestamps)
                    else:
                        id_summary[di["id"]]["count"] += 1
                        id_summary[di["id"]]["bytes"] += di["dlc"]
                        timestamps[di["id"]]["t"].append(di["timestamp"])
                    for i in range(0,3):
                        if di["id"] not in top_3_ids:
                            if top_3_ids[i] == "0":
                                top_3_ids[i] = di["id"]
                            else:
                                if (
                                    id_summary[top_3_ids[i]]["count"]
                                    < id_summary[di["id"]]["count"]):
                                    top_3_ids[i] = di["id"]
            except json.decoder.JSONDecodeError:
                print("Invalid Data")
                invalid_frames += 1

            for i in timestamps:
                deltas = [
                    timestamps[i]["t"][k] - timestamps[i]["t"][k-1] for k in range(1, len(timestamps[i]["t"]))
                ]
                timestamps[i]["avg"] = sum(deltas) / len(deltas) if deltas else 0
                id_summary[i]["avg_delta_ms"] = timestamps[i]["avg"]
            result = {
                "total_frames": total_frames,
                "unique_ids": unique_ids,
                "id_summary": id_summary,
                "invalid_frames": invalid_frames,
                "top_3_ids": top_3_ids
            }
            return result
    except OSError:
        print("OS Error")

def main():
    path = "day2_logs.jsonl"
    csv_path = "day2_counts.csv"
    content = read_log(path)
    print(content)
    create_csv(content, csv_path)


if __name__ == "__main__":
    main()

