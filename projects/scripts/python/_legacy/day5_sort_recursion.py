'''
WP1 Task – Sorting & Recursion:  Practice recursive vs iterative thinking + implement efficient sorting.
'''

def merge_sort(seq):
    if len(seq) <= 1:
        return seq

    mid = len(seq) // 2
    left = merge_sort(seq[:mid])
    right = merge_sort(seq[mid:])

    merged = []
    while left and right:
        merged.append(left.pop(0) if left[0] <= right[0] else right.pop(0))
    merged.extend(left or right)
    return merged


def fibo_rec(n: int) -> int:
    '''Return fibonacci number of n computed recursively'''
    if n < 0:
        raise ValueError("n must be non-negative")
    if n == 1:
        return 1
    return n + fibo_rec(n-1)


def fibo_iter(n: int) -> int:
    '''Return fibonacci number of n computed iteratively'''
    result: int = 0
    if n < 0:
        raise ValueError("n must be non-negative")
    for i in range(1, n+1):
        result = result + i
    return result


def factorial_rec(n: int) -> int:
    """Return n! computed recursively."""
    if n < 0:
        raise ValueError("n must be non-negative")
    if n in (0, 1):       # base case
        return 1
    return n * factorial_rec(n - 1)   # recursive step


def factorial_iter(n: int) -> int:
    '''Return n! computed iteratively'''
    result: int = 1
    if n < 0:
        raise ValueError("n must be non-negative")
    for i in range(1, n+1):
        result = result * i
    return result


def main():
    print(factorial_iter(5))
    print(factorial_rec(5))
    print(fibo_iter(10))
    print(fibo_rec(10))

    numbers = [20, 35, 78, 100, 5, 32, 15, 8, 95, 50, 21, 72, 63, 54, 25, 14, 16, 58, 49, 28]
    merge_sort(numbers)


if __name__ == "__main__":
    main()
