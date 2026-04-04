# WP1: C Essentials

- `static`
  - Local static → remember values between calls
  - Global static → limit visibility to one file (like private in OOP)
- header + c-files -> see example wp1_day2
- Init an array
  - int a[5] = {0};      // all elements = 0 ✅
  - int b[5] = {1,2};    // rest auto-filled with 0
- const vs volatile
  - const: read-only data, compiler may cache it.
  - volatile: tells compiler “value can change anytime — always read it fresh.” -> Example: reading from a hardware register or shared flag in ISR.
- array vs pointer
  - The array has a fixed name and size determined at compile time.
  - A pointer is dynamic; it can point anywhere, even beyond (but that’s unsafe unless within bounds).

| Concept                | Key Idea                                            | Example                              |
| ---------------------- | --------------------------------------------------- | ------------------------------------ |
| Pointer Definition     | Stores address of a variable                        | `int *p = &x;`                       |
| Dereferencing          | Access value at stored address                      | `int y = *p;`                        |
| Array–Pointer Relation | `arr[i] == *(arr + i)`                              | `char a[3] = {'A','B','C'};`         |
| Pointer Arithmetic     | `p++` moves by `sizeof(*p)` bytes                   | `int *p = a; p++;`                   |
| Const Correctness      | Promise + compiler-enforced protection              | `void f(const int *p);`              |
| Decay                  | Arrays *decay* → pointers to first element          | `func(a)` ↔ `func(&a[0])`            |
| Multi-Dim Arrays       | Pointer to rows/flat memory access                  | `*(*(m+1)+2)` → `m[1][2]`            |
| Volatile               | Prevents compiler from optimizing away reads/writes | hardware registers                   |
| Pointer Type           | Defines value type + step size                      | `char*` moves 1 byte, `int*` 4 bytes |

- Embedded Safety Notes
  - Never access beyond last index (arr[MAX] ❌).
  - Arrays are fixed blocks; pointers are flexible but must stay in bounds.
  - Initialize all pointers before use; avoid dangling pointers.
  - Prefer static arrays; avoid malloc unless absolutely needed (dynamic logs, configurable buffers).
  - Use const for read-only data, volatile for hardware or ISR-shared variables.
- insights
  - arr[i] ↔ *(arr+i) defines how arrays work internally.
  - Arrays cannot be reassigned; pointers can.
  - {0} gives compile-time zero init; loops enable runtime initialization.
  - char handles bytes; int handles numbers (system-dependent size).
  - Const correctness is enforced by compiler — not just a promise.

## History

* **ANSI X3J11** → The *American National Standards Institute* committee (formed 1983) that standardized C (→ ANSI C 1989 → ISO C 1990). It consisted of compiler vendors, academics, and industry engineers.

* **Dennis Ritchie (1941–2011)** → Co-creator of C and UNIX at Bell Labs (1970s). He also contributed to Multics and the C compiler toolchain. Turing Award (1983, with Ken Thompson). He passed away in 2011.

* **Brian Kernighan (1942 – )** → Co-author of *The C Programming Language* (K&R), worked on Unix utilities (`awk`, `troff`), and helped shape software engineering education. He’s still active as a professor at Princeton University.

* **Other key C influencers:**
  *Ken Thompson* (co-creator of Unix and B language), *Bjarne Stroustrup* (C++ founder from C), *Steve Bourne* (shell), *Herb Sutter* (modern C++ committee).

* **Important in embedded software:**
  *Jack Ganssle* (embedded engineering author and consultant), *Jean Labrosse* (author of µC/OS RTOS), *Michael Barr* (embedded safety expert, Barr Group), *Erich Styger* (FreeRTOS educator), and *David Kalinsky* (real-time systems specialist).

## struct vs union

| Type     | Memory use             | Members valid simultaneously? | Typical use                                             |
| -------- | ---------------------- | ----------------------------- | ------------------------------------------------------- |
| `struct` | sum of all members     | ✅ yes                         | group data logically                                    |
| `union`  | size of largest member | ❌ no                          | reinterpret same memory (e.g., `uint32_t ↔ uint8_t[4]`) |

`u.word = 0x12345678;  // write as 32-bit`
`printf("%X", u.bytes[0]);  // read first byte -> type reinterpretation`

## Little-endian vs Big-endian

| Type              | Description                         | Example for `0x12345678` in memory |
| ----------------- | ----------------------------------- | ---------------------------------- |
| **Little-endian** | Least significant byte stored first | `78 56 34 12`                      |
| **Big-endian**    | Most significant byte stored first  | `12 34 56 78`                      |

- Most CPUs today (e.g., x86, ARM in little-endian mode) use little-endian.
- Network protocols (CAN, TCP/IP) define big-endian as network byte order.
- You detect the system’s endianness by writing a known value into a union and printing its bytes.

## Type and specifier

| Type            |specifier (`printf`,`scanf`)  | Description                         |
| --------------- | ---------------------------- | ----------------------------------- |
| `int`           | `%d`                         | Signed decimal integer              |
| `unsigned int`  | `%u`                         | Unsigned decimal integer            |
| `long`          | `%ld`                        | Signed long integer                 |
| `float`         | `%f`                         | Floating-point number               |
| `double`        | `%lf`                        | Double-precision float              |
| `char`          | `%c`                         | Single character                    |
| `char*`         | `%s`                         | String                              |
| `unsigned int`  | `%x`                         | Unsigned int in hexadecimal         |
| `unsigned char` | `%hhx`                       | Unsigned char (byte) in hexadecimal |
| `int8_t`        | `%hhd`                       | 8-bit signed integer                |
| `uint8_t`       | `%hhu` / `%hhx`              | 8-bit unsigned integer              |
| `int16_t`       | `%hd`                        | 16-bit signed integer               |
| `uint16_t`      | `%hu` / `%hx`                | 16-bit unsigned integer             |
| `int32_t`       | `%d`                         | 32-bit signed integer               |
| `uint32_t`      | `%u` / `%x`                  | 32-bit unsigned integer             |
| `int64_t`       | `%lld`                       | 64-bit signed integer               |
| `uint64_t`      | `%llu` / `%llx`              | 64-bit unsigned integer             |

## Pointer Syntax

| Form        | Meaning                          | Example      |
| ----------- | -------------------------------- | ------------ |
| `int *p;`   | pointer to `int`                 | declaration  |
| `p = &x;`   | assign address of `x`            | `int x = 5;` |
| `*p`        | value at address `p`             | prints `5`   |
| `int **pp;` | pointer to pointer               | `pp = &p;`   |
| `**pp`      | value at address pointed by `pp` | prints `5`   |

## Pointer for functions

```
int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }

int compute(int a, int b, int (*op)(int, int)) {
    return op(a, b);
}

int main(void) {
    int result1 = compute(4, 5, add);
    int result2 = compute(4, 5, sub);
}
```

## Callback

A callback is a function passed as an argument to another function.
It lets the caller decide what to do while the callee controls when to do it.
This pattern is common in drivers, ISRs, and modular frameworks.

### Example

void execute(int a, int b, int (*callback)(int, int)) {
    if (callback != NULL) {
        int result = callback(a, b);
        printf("Result = %d\n", result);
    }
}

int add(int x, int y) { return x + y; }
int sub(int x, int y) { return x - y; }

int main(void) {
    execute(3, 4, add);
    execute(7, 2, sub);
}

## Dispatcher

A dispatcher is a function or module that decides which specific function to call based on some input (like a command, event, or ID).