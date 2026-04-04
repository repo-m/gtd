'''
**Task (3 min limit):**

Write a function `student_summary(names: list[str], scores: list[int]) -> dict[str, str]` that:

1. Combines `names` and `scores` using `zip`.
2. Assigns a grade (`A`, `B`, `C`, `D`, `F`) based on the score.
3. Returns a dictionary `{name: grade}`.
4. Removes duplicate names using a `set`.
5. Prints each entry with `enumerate`.

**Example:**

```python
names = ["Ali", "Sara", "Ali", "Omar"]
scores = [95, 82, 70, 58]
print(student_summary(names, scores))
# Output:
# 1. Ali: A
# 2. Sara: B
# 3. Omar: D
# {'Ali': 'A', 'Sara': 'B', 'Omar': 'D'}
```

'''

def student_summary(names: list[str], scores: list[int]) -> dict[str, str]:
    '''Creates student summary and return it as dict[str, str]'''
    result = {k: v for k, v in zip(names, scores)}
    for k, v in result.items():
        if v >= 90:
            result[k] = "A"
        elif v >= 80:
            result[k] = "B"
        elif v > 70:
            result[k] = "C"
        elif v > 60:
            result[k] = "D"
        else:
            result[k]= "F"
    for i, (name, grade) in enumerate(result.items(), start=1):
        print(f"{i}. {name}: {grade}")
    return result


def main() -> None:
    '''Main entry point for the script'''
    names = ["Ali", "Sara", "Ali", "Omar"]
    scores = [95, 82, 70, 58]
    print(student_summary(names, scores))

if __name__ == "__main__":
    main()




