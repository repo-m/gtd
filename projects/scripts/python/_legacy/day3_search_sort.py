'''
Implement and test practical searching and sorting helpers using Python’s 
built-ins (`bisect`, `heapq`, `Counter`, `sorted`).

## Deliverables

* `algos.py`
* `test_algos.py`
'''


import bisect
import heapq
from collections import Counter


def sort_products(products: list[dict]) -> list[dict]:
    '''Custom Sort Function sorts by `"category"` ascending, then `"price"` 
    descending'''
    return sorted(products, key=lambda p: (p["category"], -p["price"]))


def most_common(items: list[str], n: int) -> list[tuple[str, int]]:
    '''Frequency Counter: Function uses collections, Counter & mostcommons'''
    counter = Counter(items)
    return counter.most_common(n)


def top_k(nums: list[int], k: int) -> list[int]:
    '''Function uses heapq.nlargest and returns results'''
    return heapq.nlargest(k, nums)


def find_index(n, x) -> int:
    '''Binary Search Helper: Function uses `bisect_left` and returns index if 
    found, else `-1`.'''
    pos = bisect.bisect_left(n, x)
    if pos < len(n) and n[pos] == x:
        return pos
    return -1
