'''
**Task (3 min limit):**

Write a function `even_square_sum(limit: int) -> int` that:

1. Uses a **generator** (`yield`) to produce even numbers up to `limit`.
2. Uses a **list comprehension** to square them.
3. Returns the **sum** of those squares.
4. Also, create a **set comprehension** that holds only squares greater than 50 and print it.

**Example:**

```python
print(even_square_sum(10))
# Output:
# {64, 100}
# 220
```

'''
def get_even_number(limit:int):
    yield from [k for k in range(0, limit) if k % 2 == 0]

def even_square_sum(limit: int) -> int:
    '''Returns even numbers up to limit.'''
    even_numbers_square = list(k * k for k in get_even_number(limit))
    even_numbers_square_sum = sum(even_numbers_square)
    set_numbers_square_50 = set(k for k in even_numbers_square if k > 50)
    return even_numbers_square_sum, set_numbers_square_50

def main() -> None:
    '''Main entry point for the script.'''
    print(even_square_sum(10))


if __name__ == "__main__":
    main()
