'''
**Task (3 min limit):**

Write a function `combine_and_filter(words: list[str]) -> dict[str, int]` that:

1. Uses **`enumerate`** to number each word.
2. Uses **`itertools.cycle`** to repeat through `['A', 'B', 'C']` and pair each word with a label.
3. Creates a **dictionary comprehension** mapping `{word: index}` but only for words longer than 3 letters.
4. Creates a **set comprehension** of all uppercase words and prints it.

**Example:**

```python
print(combine_and_filter(["sun", "ocean", "sky", "mountain"]))
# Output:
# {'ocean': 1, 'mountain': 3}
# {'SUN', 'OCEAN', 'SKY', 'MOUNTAIN'}
```

'''
import itertools

def combine_and_filter(words: list[str]) -> dict[str, int]:
    words_numbers = {k: v for k, v in enumerate(words)}
    label = itertools.cycle(['A', 'B', 'C'])
    words_label = {k: v for k, v in zip(words, label)}
    words_numbers_3l = {k: v for k, v in enumerate(words) if len(v) > 3}
    words_upper = {word.upper() for word in words}
    return (words_numbers_3l, words_upper)


def main():
    '''Main entry point for the script'''
    print(combine_and_filter(["sun", "ocean", "sky", "mountain"]))


if __name__ == "__main__":
    main()
