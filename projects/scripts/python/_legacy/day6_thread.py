import time
from concurrent.futures import ThreadPoolExecutor

def process_file(name):
    print(f"Start {name}")
    time.sleep(1)  # simulate long file read
    print(f"End {name}")
    return f"{name} processed"

def main():
    files = ["log1.txt", "log2.txt", "log3.txt"]
    with ThreadPoolExecutor(max_workers=3) as executor:
        results = list(executor.map(process_file, files))
    print("Results:", results)

if __name__ == "__main__":
    main()
