'''
# Coding Challenge 1

Build a CLI `event_summarizer.py` that reads one or more `.jsonl` files of events and prints a JSON summary + writes `summary.csv`.
 
required keys: `ts` (int, ms), `user` (str), `event` (str), optional `value` (int, default 0).

**Requirements (deliverables):**
* Write `summary.csv` columns: `event,count,sum_value,first_ts,last_ts`; print compact JSON summary to **stdout**.
* Structure: helper functions (`read_events(paths)`, `aggregate(records)`, `write_csv(summary, out_path)`); typing hints; `argparse`; exceptions handled.
* Tests (pseudo-pytest): tiny fixture with ~6 lines; assert totals, top3, CSV header present.

**Example lines & expected CSV (minimal):**

* `summary.csv`:

  | event | count | sum_value | first_ts | last_ts |
  | ----- | ----: | --------: | -------: | ------: |
  | click |     2 |         6 |        2 |       7 |
  | login |     1 |         0 |        1 |       1 |

**Stretch (only if time remains):**

* `--workers N` using `ThreadPoolExecutor` for reading files; `--min-ts`/`--max-ts` filter; `--format csv|json` for output.
'''

import argparse
import json
import csv


def print_summary_json(summary):
    '''Prints summary as jsonl'''

def write_summary_csv(path: str, summary: list[dict]) -> bool:
    '''Writes summary in csv and creates file'''
    result = False
    try:
        with open(path, "w") as f:
            #complete writing csv
            #csv.DictWriter.writeheader(fieldnames = "event, count, sum_value, first_ts, last_ts")
            result = True
    except OSError:
        print("Error - write_summary_csv: OS Error")
        result = False
    return result

def check_content(content: list[dict]) -> list[dict]:
    '''Compute per-`event`: `count`, `sum_value`, `first_ts`, `last_ts`; compute global: 
    `total_events`, `unique_users`, `top3_events` by count.'''
    events = []
    for ev in content:
        if ev["event"] not in events:
            events.append({"event" : ev["event"]})
            #continue here
    print(events)


def parse_json(path: list[str]) -> list[dict]:
    '''Parses multiple jsonl files and returns content as list[dict]'''
    result = []
    if len(path) == 0:
        print("Error parse_jsop: path empty")
    else:
        for i in range(len(path)):
            try:
                with open(path[i], "r") as f:
                    for line in f:
                        content = json.loads(line)
                        result.append(content)
            except OSError:
                print("parse_json: OS Error")
    return result


def main():
    '''Main entry point of the script'''
    #todo: add logger
    parser = argparse.ArgumentParser(description="event_summarizer")
    parser.add_argument("--inp", required=True, nargs='+', type = str, help="e.g. a.jsonl b.jsonl")
    #todo: activate add args
    parser.add_argument("--out", required=True, type = str, help="e.g. summary.csv")
    #parser.add_argument("--verbose", required=True, type = str, help="e.g. summary.csv")
    args = parser.parse_args()

    #todo: implement full CLI requirements
    if args.inp and args.out:
        content = parse_json(args.inp)
        summary = check_content(content)
        write_summary_csv(args.out, summary)
    else:
        print("Error: Missing input files")


if __name__ == "__main__":
    main()
