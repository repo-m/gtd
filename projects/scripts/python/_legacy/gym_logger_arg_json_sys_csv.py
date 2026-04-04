import logging
import argparse
import json
import sys
import csv

log = logging.getLogger(__name__)

def write_csv(path:str, content: list[dict]) -> bool:
    with open(path, "w") as f:
        writer = csv.DictWriter(f, delimiter=";", fieldnames=["timestamp_ms", "id", "len", "data"])
        writer.writeheader()
        writer.writerows(content)

def read_input() -> list:
    '''Reads std input and return its content as list[dict]'''
    content = []
    log.info("Type input and end with newline +'EOF'")
    for line in sys.stdin:
        line = line.strip()
        if line == "EOF":
            break
        content.append(line)
    return content

def read_jsonl(path: str) -> list[dict]:
    '''Read jsonl-file and returns its content as list[dict]'''
    content = []
    with open(path, "r") as f:
        for line in f:
            stream = json.loads(line)
            content.append(stream)
    return content

def main(args) -> None:
    '''Main entry point of the script'''

    log.debug("Checking args")
    if args.file:
        print(args.file)
        log.debug(f"Path given, read_jsonl({args.file}) called.")
        content = read_jsonl(args.file)
        log.debug(f"Content: {content}")
        if args.out:
            log.debug(f"Output path for csv file, writing_csv({args.out}) called.")
            write_csv(args.out, content)
    else:
        log.debug(f"No path given, reading_input() called.")
        content = read_input()
        log.debug(f"Content: {content}")


if __name__ == "__main__":
    '''Main entry point guard'''
    logging.basicConfig(level = logging.DEBUG)
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", type=str)
    parser.add_argument("--out", type=str)
    args = parser.parse_args()

    main(args)

