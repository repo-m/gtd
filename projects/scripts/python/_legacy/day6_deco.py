'''
🧠 Task – Add Logging and Timing via Decorator
Requirements

1. Write a decorator @logger that:
    - Prints the function name and its arguments before calling it.
    - Prints the returned value after execution.
2. Write a decorator @timeit that:
    - Measures and prints execution time in milliseconds.
3. Apply both (stacked) to the same function.
'''

import time
from functools import wraps

def logger(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with args = {args}, kwargs = {kwargs}")
        result = func(*args, **kwargs)
        print(f"Returned {result}")
        return result
    return wrapper

def timeit(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"Execution time: {(end - start) * 1000:.2f} ms")
        return result
    return wrapper

@logger
@timeit
def multiply(a, b):
    return a * b

print(multiply(3, 4))
