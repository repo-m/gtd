'''
* Read a JSONL file of event records and print a JSON summary to **stdout**.

* Fields: `ts` (ISO-8601 UTC), `user` (str), `action` (str), `duration_ms` (int, optional).


* Sort groups by `count` desc, then group key asc; exit **2** on file/parse errors, else **0**.

### Tiny example
**Command:** `python events.py events.jsonl --group-by user --top 2`
**Output (shape):**

```json
{
  "total_events": 4,
  "unique_groups": 2,
  "skipped_bad_lines": 0,
  "top": [
    {"group":"u1","count":3,"avg_duration_ms":75.0,"first_ts":"...","last_ts":"..."},
    {"group":"u2","count":1,"avg_duration_ms":200.0,"first_ts":"...","last_ts":"..."}
  ]
}
```

### Scoring rubric (0–10)

* **Correctness (4)**; **CLI/UX & args (2)**; **Code quality & structure (2)**; **Edge cases/robustness (1)**; **Tests or docstring/README (1, bonus).**

### Notes

* Use only stdlib; be pragmatic; clean error messages to **stderr**.
* When ready, start your 20 minutes and reply **STARTED**.

'''
import argparse
import json

def aggregate_content(content: list[dict]) -> dict[dict]:
    '''Aggregates json content:
    * Compute: `total_events`, `unique_groups`, `skipped_bad_lines`; and for each top group: `group`, `count`, `avg_duration_ms` (ignore missing), `first_ts`, `last_ts`.
    '''
    total_events = len(content)
    unique_groups = []
    skipped_bad_lines = []
    top_group = []
    valid_keys = ('ts', 'user', 'action', 'duration_ms')
    for i in content:
        if not all(k in i.keys() for k in valid_keys):
            skipped_bad_lines.append(i)
        else:
            if i["action"] not in unique_groups:
                unique_groups.append(i["action"])
            if i["action"] not in top_group:
                top_group[i["action"]] = {}

    print(unique_groups)
    print(skipped_bad_lines)


    

def read_json_file(paths: list) -> list[dict]:
    '''Reads json files and returns its contents in a list[dict]'''
    result = []
    content = []
    for path in paths:
        try:
            with open(path, "r") as f:
                for lines in f:
                    content.append(json.loads(lines))
        except OSError:
            print("Error OS")
        else:
            print("Error in read_json_file")
    result = content
    return result

def main():
    '''Main entry point for the script'''

    '''ARG:`events.py <path> [--since ISO8601] [--top N] [--group-by user|action]`'''
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True, nargs='+', help="e.g. --file cc3.jsonl")
    parser.add_argument("--since", default="ISO8601", type=str, help="default= 'ISO8601'")
    parser.add_argument("--top", type=str, help="e.g. N")
    parser.add_argument("--group_by", default="user", help="type user or action")
    args = parser.parse_args()
    '''* Filter by `--since` if provided; default `--group-by user`; default `--top 3`.'''
    if args.since:
        if args.since== "ISO8601":
            since = "ISO8601"
    if args.group_by:
        group_by = "args.group-by"
    if args.file:
        content = read_json_file(args.file)
        aggregate_content(content)
    since = "ISO8601"
    group_by = "users"







if __name__ == "__main__":
    main()