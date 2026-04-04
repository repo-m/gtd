'''
### Problem

* Input: JSON Lines (`.jsonl`) 
  - via `--input FILE` or stdin if omitted; 
  - each line has: `timestamp` (ms int), `level` (`DEBUG|INFO|WARN|ERROR`), `service` (str), `msg` (str), optional `user_id` (str|int).

* Output: 
  - print a **JSON summary** to stdout with: `total`, `invalid`, `levels` (counts), `services` (counts), `unique_users`, `top_messages` (list of `{"msg","count"}` size ≤ N).

```json
{
  "total": 5,
  "invalid": 1,
  "levels": {"INFO": 3, "WARN": 1, "ERROR": 1},
  "services": {"api": 3, "db": 1, "web": 1},
  "unique_users": 2,
  "top_messages": [{"msg": "login ok", "count": 2}, {"msg": "slow query", "count": 1}, {"msg": "deadlock", "count": 1}, {"msg": "render", "count": 1}]
}
'''
import logging, json, argparse

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("JSONL log summarizer CLI")

def aggreagrate_info(content: list, stats:dict) -> dict:
    '''Aggregates information for summary and returns it as dict'''
    total = stats.get("total")
    invalid = stats.get("invalid")
    levels = {}
    services = {}
    users = []
    unique_user = 0
    top_messages = []
    for line in content:
        if line.get("level") not in levels:
            levels[line.get("level")] = 1
        else:
            levels[line.get("level")] += 1
        if line.get("service") not in services:
            services[line.get("service")] = 1
        else:
            services[line.get("service")] += 1
        if line.get("users") not in users:
            users.append(line.get("users"))
            unique_user += 1
        if line.get("message") not in top_messages:
            message = {"message": line.get("message"), "count": 1}
            top_messages.append(message)

    levels = dict(sorted(levels.items(), key=lambda x:x[1], reverse=True))
    services = dict(sorted(services.items(), key=lambda x:x[1], reverse=True))
    print(levels)
    print(services)

def validate_stream(stream: dict) -> dict:
    '''Validate json stream and return valid stream.'''
    required_fields = ("timestamp", "level", "service", "msg")
    valid_levels = ("INFO", "WARN", "ERROR")
    if all(field in stream.keys() for field in required_fields):
        if (isinstance(stream.get("timestamp"),int)):
            if stream.get("level") in valid_levels:
                if (isinstance(stream.get("service"),str)):
                    if (isinstance(stream.get("msg"),str)):
                        valid_stream = stream
                    else: raise KeyError
                else: raise KeyError
            else: raise KeyError
        else: raise KeyError
    else: raise KeyError
    return valid_stream

def parse_jsonl(path_jsonl:str) -> list:
    '''Parsing jsonl file and returns content as list.'''
    invalid = 0
    total = 0
    content = []
    try:
        with open(path_jsonl, "r") as f:
            for lines in f:
                stream = json.loads(lines)
                try:
                    content.append(validate_stream(stream))
                    total += 1
                except KeyError:
                    invalid += 1
                except ValueError:
                    invalid += 1
    except FileNotFoundError:
         raise FileNotFoundError(f"File {path_jsonl} not found")
    stats = {"total": total, "invalid": invalid}
    return (content, stats)


def main(args) -> None:
    '''Main entry point for the script'''
    if args.input:
        path_jsonl = args.input
        try:
            content, stats=parse_jsonl(path_jsonl)
            aggreagrate_info(content, stats)
        except FileNotFoundError as e:
            logger.error(f"File Not Found Error: {e}")
    else:
        logger.info("No path to jsonl file given")


if __name__ == "__main__":
    '''
    * CLI args: `--input PATH` (repeatable), `--since ISO8601`, `--until ISO8601`, `--level LEVEL` (repeatable), `--service NAME` (repeatable), `--top N` (default 5), `--out-csv PATH` (optional: write `service,count`), `--verbose` (INFO logs).
    * `python logsum.py --input logs.jsonl --top 3 --out-csv service_counts.csv`
    * `cat logs.jsonl | python logsum.py --level ERROR --since 2025-10-14T00:00:00`
    '''
    parser = argparse.ArgumentParser(description="JSONL log summarizer CLI")
    parser.add_argument("--input", type=str, required=True)
    parser.add_argument("--since", help="ISO8601")
    parser.add_argument("--until", help="ISO8601")
    parser.add_argument("--level")
    parser.add_argument("--service")
    parser.add_argument("--top", default=5, help="default=5")
    parser.add_argument("--out-csv", required=True)
    parser.add_argument("--verbose")
    args = parser.parse_args()

    main(args)