# Notes on C

## Types

| Type                               | Typical size (32-bit MCU) | Example                   | Embedded use? (why)                        |
| ---------------------------------- | ------------------------- | ------------------------- | ------------------------------------------ |
| `char` / `unsigned char`           | 1B                        | `char c='A';`             | ✅ Often as bytes/ASCII.                    |
| `short` / `unsigned short`         | 2B                        | `unsigned short v=60000;` | ⚠️ OK; prefer `uint16_t` for clarity.      |
| `int` / `unsigned int`             | 4B                        | `int x=42;`               | ✅ Common; but fixed-width types clearer.   |
| `long` / `unsigned long`           | 4B                        | `unsigned long t=ms;`     | ⚠️ Platform-dependent; prefer `uint32_t`.  |
| `long long` / `unsigned long long` | 8B                        | `uint64_t acc;`           | ⚠️ Heavier; use if needed for 64-bit math. |
| `float`                            | 4B                        | `float f=3.14f;`          | ✅ If FPU; otherwise costly.                |
| `double`                           | 8B                        | `double d=…;`             | ❌ Usually avoided: speed/size.             |
| `_Bool` / `bool`                   | 1B                        | `bool ok=true;`           | ✅ Clear logic flags.                       |
| `enum`                             | int-sized                 | `enum State{ON,OFF};`     | ✅ Great for states; readable.              |
| `<stdint.h>` types                 | fixed                     | `uint8_t, uint16_t…`      | ✅ Best practice: explicit width.           |

## Libs

| Library       | Purpose                                          | Likely in Embedded? | Notes                                                                               |
| ------------- | ------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------- |
| `<stdint.h>`  | Fixed-width integer types (`uint8_t`, `int32_t`) | ✅ Yes              | Crucial for hardware-register-level programming.                                    |
| `<stdbool.h>` | Boolean type/values                              | ⚠️ Maybe            | Teams often replace with custom header for control.                                 |
| `<stddef.h>`  | `size_t`, `ptrdiff_t`, `NULL`, `offsetof`        | ✅ Yes               | Needed for memory handling, arrays, structs.                                        |
| `<string.h>`  | String/memory ops (`memcpy`, `strlen`)           | ⚠️ Limited          | Often only `memcpy`, `memcmp`, `memset`; unsafe funcs avoided.                      |
| `<stdio.h>`   | I/O (`printf`, `scanf`)                          | ❌ Rare              | Heavy, non-deterministic, no standard I/O on MCU. Sometimes `snprintf` for logging. |
| `<math.h>`    | Math functions (`sin`, `sqrt`)                   | ⚠️ If FPU present   | Avoid if no FPU → slow.                                                             |
| `<stdlib.h>`  | Memory mgmt (`malloc`, `free`)                   | ❌ Often banned      | Dynamic allocation unsafe for real-time systems.                                    |
| `<ctype.h>`   | Char classification (`isdigit`, `isspace`)       | ⚠️ Rare             | Some projects reimplement instead of pulling full lib.                              |
