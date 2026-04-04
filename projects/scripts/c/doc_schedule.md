# Plan

## Goal

Prepare for a programming tech interview as **professional embedded software engineer**, handling **safety-related software** in **RTOS context**.

* C theory (WP1, WP3)
* Practical coding (WP2, WP6)
* Real-world embedded skills (WP5, WP7, WP8, WP9)
* Interview simulation (WP4)
* Automotive/Safety context (WP10)

---

## 📦 Work Packages

1. **WP1 – C Essentials** (syntax, pointers, memory, structs, file I/O, bit ops, volatile)
2. **WP2 – Programming Tasks** (ChatGPT + self-coding, safe embedded style)
3. **WP3 – Select K&R Exercises** (cut to essentials, focus on arrays/pointers)
4. **WP4 – Mock Tech Review Simulation** (pair-programming style)
5. **WP5 – Debugging & Tools** (`gdb`, watchpoints, tracing basics, sanitizers optional)
6. **WP6 – Algorithms & Data Structures** (lists, stacks, queues, circular buffer, hash table)
7. **WP7 – Testing & Edge Cases** (systematic validation mindset, MISRA style)
8. **WP8 – Build Systems & Compiler Mastery** (`gcc` flags, Makefiles, linking, memory map)
9. **WP9 – RTOS & Concurrency** (tasks, semaphores, mutexes, ISRs, watchdogs, priority inversion)
10. **WP10 – Automotive Context** (MISRA-C principles, ISO 26262 basics, CAN/LIN overview, safety-critical patterns)

---

## 📅 10-Day Prep Plan

## ✅ Day 1 → DONE

* [x] WP1: Refresh C basics
* [x] WP2: Parsing/counting tasks
* [x] WP3: K&R Ch1 [1-8, 1-12]
* [x] WP6: Arrays & strings intro

## ✅ Day 2 → DONE

* [x] WP1: Functions, scope, headers, storage classes
* [x] WP2: Struct-based parsing task
* [x] WP3: K&R Ch2 [2-3, 2-6]
* [x] WP6: Bubble sort
* [x] WP10: MISRA-C intro
* [x] WP10: ISO 26262 overview

## ✅ Day 3 → DONE

* [x] WP1: Pointers & arrays – 1 h
* [x] WP2: Pointer exercises – 1 h
* [x] WP3: K&R Ch3 [3-3, 3-5] – 1 h
* [x] WP5: Compiler flags – 0.5 h
* [x] WP8: gcc workflow (map file) – 0.5 h
* [x] WP10: MISRA-C intro – 15 min (shifted)
* [x] WP10: ISO 26262 overview – 15 min (shifted)
* [x] WP10: Safety coding rules (no malloc, init rules) – 15 min

### ✅ Day 4 → DONE

* [x] WP1: Structs, bitfields, unions, `volatile` – 1h
* [x] WP2: Parser using structs – 1h
* [x] WP6: Searching (linear, binary) – 0.5h
* [x] WP5: gdb basics – 1h
* [x] WP10: CAN/LIN frame basics – 15min

### Day 5

* [x] WP2: Mid-size project (CAN/log parser) – 2h
* [x] WP7: Write test harness – 0.5h
* [x] WP5: Watchpoints, backtrace – 1h
* [x] WP8: Makefile basics – 0.5h
* [x] WP10: Safety concept examples – 15min

### Day 6

* WP1: Advanced pointers + function pointers – 1h
* WP2: Bitmask/bitfield tasks – 1h
* WP3: K&R Ch5 [5-3, 5-5] – 1h
* WP6: Linked list – 1h
* WP10: ISR & latency limits – 15min

### Day 7

* WP2: Word counter with hash table – 1.5h
* WP6: Stack/queue + circular buffer – 1.5h
* WP5: Debugging practice (pointer bug) – 1h
* WP10: Watchdog role – 15min

### Day 8

* WP9: RTOS essentials (tasks, priorities, semaphores) – 2h
* WP4: Mock Interview #1 (45+45min, pair-programming style) – 1.5h
* WP7: Edge-case analysis – 0.5h
* WP10: Priority inversion & mutex protocol – 15min

### Day 9

* WP2: Final medium project (parser + analysis + summary) – 2h
* WP6: Hash table/dictionary – 1h
* WP8: Makefile + compiler flags + link analysis – 1h
* WP10: Memory sections in safety SW – 15min

### Day 10

* WP4: Mock Interview #2 – 2h
* WP7: Final test & edge-case review – 1h
* WP5: Debugging session (`gdb`, sanitizers) – 1h
* WP10: Last safety recap (MISRA checklist) – 15min

## OPL

* **WP3:** Exercise 1-20 to 1-24
* **WP6:** Copy string safely into another buffer
* **Day 2 Topics:**
  * Type precision and matching format specifiers
  * Operator precedence → use parentheses in bitwise operations
  * Functional abstraction → helper functions (`swap()`, `parse_line()`)
  * Systematic testing loops for intermediate validation
  * Bitwise mastery → masking, shifting, extracting the rightmost bit
* **Dynamic Memory:** Use `malloc` only when memory needs vary at runtime (e.g., communication buffers, diagnostic logs)
* **ISO 26262:** International standard for functional safety in automotive systems
* **Memory Storage:** When and how to save data in RAM vs. ROM
* **C File Layout:** Includes, function declarations, constants, typedefs, etc.
* **Naming Conventions:** Functions, variables, constants, etc.
* **Constant Definitions:** `enum { LIMIT = 100 };` vs `#define LIMIT 100`
* **Code Formatting:** Positioning of `{}` in `if`, `else`, and loops
* **Struct Access:**
  * `out->id` → when `out` is a pointer to a struct
  * `out.id` → when `out` is a struct object
  * Example:

    ```c
    Sensor s;  
    Sensor *p = &s;  
    p->id == s.id; // true
    ```

* **Return Values:** Define return codes (e.g., `AUTOSAR E_OK`, etc.) consistently
* **Tiny Logger:** Implement levels, timestamps, and ring buffer over UART/SWO/SEGGER RTT; compile out or reduce for production to avoid timing/ROM overhead
* **Heisenbugs:** Non-deterministic bugs that disappear or change behavior when debugged
* **Debug Flow:** Assertions + unit tests on host → structured logs (`printf`) for control flow and values → GDB + hardware trace for crashes, races, hard faults, and timing issues
* **GDB Usage:** Connect and debug with ECU (e.g., STM32)
* handle CAN messages in an AUTOSAR Stack
* handle CAN messages in RTOS
* file structure (any standards?)
