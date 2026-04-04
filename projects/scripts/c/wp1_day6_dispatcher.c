/*
# Safe Arithmetic Dispatcher

## Goal

Implement a safe arithmetic dispatcher that uses a static function pointer table to perform add, sub, mul, and div operations based on a command character (+, -, *, /).

## Requirements

1. Use a typedef for the function pointer type.
2. Store all operations in a static const table (no runtime assignment).
3. Implement compute(char op, int a, int b, int *result) returning a status code.
4. Handle errors safely:
  - Invalid operator → return E_NOT_OK;
  - Division by zero → return E_NOT_OK;
  - NULL result pointer → return E_NOT_OK.
5. Add simple test cases in main() to verify behavior.

## Expected Output

6 + 2 = 8
6 - 2 = 4
6 * 2 = 12
6 / 2 = 3
Invalid operator
Divide by zero

*/
