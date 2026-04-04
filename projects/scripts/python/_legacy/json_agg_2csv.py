'''
**Task:** Log Analytics
1. Build a single-file CLI `cc6.py` + implements three subcommands: `top-urls`, `status-counts`, `active-users`.
  - support `--since/--until` (ISO-8601)
2. that reads a JSONL web log (fields: `ts`, `user`, `url`, `status`, `bytes`) 
  - stream the file;
3. validate input
4. print CSV with headers to stdout
5. sort deterministically (desc by count, then lexicographically)
6. exit code `2` on invalid input and `1` on fatal errors


url
  - count
  - bytes

status : count

user
  - request
  - bytes 


```bash
# Expected (top-urls)
$ python cc6.py top-urls sample.jsonl
url,count,bytes
/api/v1/items,4,1856
/api/v1/login,2,256
```

```bash
# Expected (status-counts)
$ python cc6.py status-counts cc6.jsonl
status,count
200,4
401,1
500,1
```

```bash
# Expected (active-users)
$ python cc6.py active-users cc6.jsonl
user,requests,bytes
alice,3,1664
bob,2,384
carol,1,64
```

'''

import argparse
import json

def write_csv(path:str, summary:list[dict]) -> bool:
    #tbd
    return False

def aggregate_information(content: list[dict], flag: str) -> list[dict]:
    url = []
    status = []
    users = []
    for events in content:
        #continue here: tbd
        print(f"DBG:{events}")
    if flag == "top-urls":
        result = url
    elif flag == "status-count":
        result = status
    elif flag == "active-users":
        result = users
    return result



def validate_data(stream: dict) -> dict:
    '''Validates data and returns validated data if data is valid otherwise it return empty dict'''
    result = {}
    valid_fields = ("ts", "user", "url", "status", "bytes")

    if all(i in stream for i in valid_fields):
        result = stream
    return result

def stream_jsonl(path_jsonl: str) -> list[dict]:
    "Reads jsonl file, evaluates it and return valid content as list[dict]."
    content = []
    try:
        with open(path_jsonl, "r") as f:
            for line in f:
                stream = json.loads(line)
                valid_stream = validate_data(stream)
                if validate_data != []:
                    content.append(valid_stream)
    except OSError:
        raise OSError
    return content



def main(args) -> None:
    '''Main entry point for the script.'''
    if args.file:
        path_jsonl = args.file
        content = stream_jsonl(path_jsonl)
        # parse args and impelement if elif
        summary_urls = aggregate_information(content, "top-urls")
        summary_status = aggregate_information(content, "status-count")
        summary_users = aggregate_information(content, "active-users")
        write_csv("urls.csv", summary_urls)
        write_csv("status.csv", summary_status)
        write_csv("summary.csv", summary_users)



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    #parser.add_argument("--out", choices="top-urls" "status-count" "active-users",action="store_true") # todo: understand how to reference args w/o name, then remove --file 
    parser.add_argument("--file", required=True, type=str) # todo: understand how to reference args w/o name, then remove --file 
    args = parser.parse_args()

    main(args)