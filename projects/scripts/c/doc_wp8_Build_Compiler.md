# WP 8: Build Systems & Compiler Mastery

## Pipeline overview

| Stage                            | Command                                       | Output File(s) | Explanation / Purpose                                                                                                               | Critical Inspection Points                                                                                                                                                                 |
| ------------------------------------ | ------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preprocessing                    | `gcc -E main.c > main.i`                          | `.i`               | Expands all macros and includes headers (`#define`, `#include`). Removes comments.                                                      | ✔ Check that all includes resolve correctly.<br>✔ Ensure no macro conflicts or multiple inclusion.<br>🧩 Only used for debugging, not release.                                                 |
| Compilation → Assembly (Codegen) | `gcc -S main.c -o main.s`                         | `.s`               | Converts high-level C to assembly (human-readable CPU instructions). This step is called code generation (DE: Codeerzeugung).   | ✔ Check if compiler correctly optimizes loops or inlines functions.<br>✔ Verify `volatile` variables produce real load/store.<br>✔ Ensure ISR code compiles with correct context save/restore. |
| Assembly → Object                | `gcc -c main.s -o main.o`                         | `.o`               | Converts assembly to machine code (binary). Each `.o` has its own sections (.text, .data, .bss).                                    | ✔ Use `readelf -S main.o` to inspect section sizes.<br>✔ Ensure symbol names exist (`nm main.o`).                                                                                              |
| Linking                          | `gcc main.o util.o -Wl,-Map=prog.map -o prog.elf` | `.elf` + `.map`    | Combines all `.o` files into one executable ELF. The linker arranges memory, resolves external references, and creates entry point. | ✔ Inspect map file for RAM/Flash usage, misplaced data, and growth of `.bss`.<br>✔ Ensure startup code, vector table, and reset handler are at correct addresses.                              |
| Conversion (optional)            | `objcopy -O ihex prog.elf prog.hex`               | `.hex` / `.bin`    | Converts ELF to flashable binary.                                                                                                       | ✔ Verify size matches limits; checksum; Flash image boundaries.                                                                                                                                |

* **`-g`** → Adds **debug information** (symbols, line numbers, variable names) into the compiled file so tools like **GDB** can inspect code during debugging. It doesn’t affect program behavior.
* **`-c`** → Compiles the source file into an **object file (`.o`)** but does **not link** it — used when you want to build pieces separately before linking them together.


## MAP File

| Section                     | Meaning                                                                                                           | Location                    | Unit / Size     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------- |
| `.text`                     | Executable code (your compiled functions).                                                                    | Flash (ROM)                 | Bytes (not kB). |
| `.rodata`                   | Read-only data (constants, format strings).                                                                   | Flash                       | Bytes.          |
| `.data`                     | Initialized global/static variables that reside in RAM but get an initial value copied from Flash at startup. | RAM (load address in Flash) | Bytes.          |
| `.bss`                      | Uninitialized global/static variables, automatically zeroed at startup.                                       | RAM                         | Bytes.          |
| `.stack` (not always shown) | Local variables, return addresses, and temporary data per function call.                                          | RAM                         | Dynamic.        |

## Linker Script

| Block                    | Role                                                                              |
| ------------------------ | --------------------------------------------------------------------------------- |
| `MEMORY`                 | Defines physical regions and their attributes (`r=read`, `w=write`, `x=execute`). |
| `.text`, `.data`, `.bss` | Assign sections to those regions.                                                 |
| `> RAM AT > FLASH`       | Means `.data` runs in RAM but is stored initially in Flash.               |
| `*(.text*)`              | Wildcard collects all matching sections from `.o` files.                          |
| `*(COMMON)`              | Merges uninitialized global variables.                                            |

### Example Linker Script

MEMORY
{
  FLASH (rx)  : ORIGIN = 0x00000000, LENGTH = 512K
  RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 128K
}

SECTIONS
{
  .text :
  {
    *(.text*)          /* All code */
    *(.rodata*)        /* Read-only data */
  } > FLASH            /* Place in Flash */

  .data :
  {
    *(.data*)          /* Initialized data */
  } > RAM AT > FLASH   /* Copy from Flash to RAM */

  .bss :
  {
    *(.bss*)           /* Uninitialized vars */
    *(COMMON)
  } > RAM
}

## Custom Map Inspection Checklist

1. Sizes & fit: Verify region totals vs limits.
    * Flash = `.text + .rodata + .data`; RAM = `.data + .bss + stack`.
    * Red flag: any section exceeding `MEMORY` LENGTH.

2. Placement sanity:
    * Code/consts in FLASH; RW data (`.data`, `.bss`, stacks) in RAM.
    * Red flag: `.data` or `.bss` mapped to FLASH; huge `.rodata` (strings, lookup tables).

3. Unexpected growth:
    * Look for large contributors under each section (file and symbol lines).
    * Red flag: big C library pulls (e.g., `printf.o`)—consider `-ffunction-sections -fdata-sections -Wl,--gc-sections` or smaller `printf`.

4. Startup correctness:
    * `.data` shows load address in FLASH and VMA in RAM; `.bss` only in RAM.
    * Entry point correct (`_start`/`Reset_Handler`), vector table in expected address.

5. Symbols & duplicates:
    * Use `nm prog.elf | sort -k2` to spot duplicates or unexpected globals.
    * Red flag: multiple definitions or huge globals.

Commands: `size prog.elf`, `objdump -h prog.elf`, search in map (`.text`, `.rodata`, `.data`, `.bss`), and sum culprits to decide refactors (move to `const`, shrink tables, drop heavy libs).

## Review Flags in Makefile

| Purpose            | Flags                                                   | Notes                                          |
| ------------------ | ------------------------------------------------------- | ---------------------------------------------- |
| Warnings (must)    | `-Wall -Wextra -Werror -Wshadow -Wconversion`           | Zero-warning policy; catch silent casts.       |
| Standard & debug   | `-std=c11 -g`                                           | Pick `c99`/`c11` consistently.                 |
| Opt/debug profiles | Debug: `-O0` · Release: `-O2` · Size: `-Os` | Let compiler decide inlining.                  |
| Dead-code removal  | `-ffunction-sections -fdata-sections -Wl,--gc-sections` | Drops unused funcs/data at link.               |
| ABI/UB safety      | `-fno-strict-aliasing -fwrapv`                          | Avoids aliasing UB; signed overflow wraps.     |
| Volatile/bitfields | `-fstrict-volatile-bitfields`                           | Respect HW register layouts.                   |
| Stack insights     | `-fstack-usage -fno-omit-frame-pointer`                 | Generates `.su`; easier backtraces.            |
| LTO (optional)     | `-flto`                                                 | Whole-program optimizations (check toolchain). |

## Makefiles

- Core Ideas
  - Centralize flags/config (toolchain, CPU, warnings, optimize) and build objects → ELF → HEX/BIN reproducibly
  - Use pattern rules and variables to avoid duplication; keep CFLAGS vs LDFLAGS separate
  - Treat warnings as errors; generate map files and size reports on every build
- Tips
  - Debug vs Release: switch OPT=-O0 -g (debug) / -O2 or -Os (release)
  - Determinism: add -fno-strict-aliasing -fwrapv -fstrict-volatile-bitfields
  - Safety artifacts: keep firmware.map, size output, compiler version, and linker.ld under version control
