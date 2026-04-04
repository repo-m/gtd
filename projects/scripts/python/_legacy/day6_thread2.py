import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def process_log(filename):
    print(f"Start {filename}")
    time.sleep(1)  # simulate long file read
    print(f"End {filename}")
    return f"{filename} processed"

def main():
    files = ["log1.txt", "log2.txt", "log3.txt"]
    with ThreadPoolExecutor(max_workers=3) as executor:
        results = list(executor.map(process_log, files))
    return results

if __name__ == "__main__":
    main()
