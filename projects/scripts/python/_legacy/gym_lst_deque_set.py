'''
**Task (3 min limit):**

Write a function `process_tasks(tasks: list[str]) -> tuple[list[str], set[str]]` that:

1. Uses a **list as a stack** to reverse the task order.
2. Uses a **`deque` as a queue** to process tasks in FIFO order.
3. Stores all **unique task names** in a `set`.
4. Returns a **tuple** containing the reversed task list (stack output) and the unique task set.

**Example:**

```python
from collections import deque

print(process_tasks(["build", "test", "deploy", "build"]))
# Output: (['deploy', 'test', 'build'], {'build', 'test', 'deploy'})
```

'''
from collections import deque

def process_tasks(tasks: list[str]) -> tuple[list[str], set[str]]:
    '''Processes tasks and returns it result as tuple.'''
    stack = tasks[::-1]
    queue = deque(tasks)
    while queue:
        queue.popleft()
    unique = set(tasks)
    return (stack, unique)

def main() -> None:
    '''Main entry point for the script.'''
    print(process_tasks(["build", "test", "deploy", "build"]))

if __name__ == "__main__":
    main()



