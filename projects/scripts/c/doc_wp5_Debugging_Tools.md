# WP5: Debugging & Tools

## gcc Flags

| Flag                          | Purpose                             | Embedded Context                               |
| ----------------------------- | ----------------------------------- | ---------------------------------------------- |
| `-Wall`                       | Enables common warnings             | Catches typical mistakes early                 |
| `-Wextra`                     | Adds more detailed warnings         | Detects unused vars, uninitialized reads       |
| `-Werror`                     | Treat warnings as errors            | Enforces zero-warning policy (safety critical) |
| `-pedantic`                   | Enforces strict ISO C compliance    | Ensures portability                            |
| `-O0` / `-O1` / `-O2` / `-O3` | Optimization levels                 | `-O2` typical for embedded release builds      |
| `-g`                          | Generate debug info (for gdb)       | Needed for symbolic debugging                  |
| `-std=c99` / `-std=c11`       | Define language standard            | Avoids compiler-specific extensions            |
| `-Wshadow`                    | Warns when a variable hides another | Prevents subtle bugs in nested scopes          |
| `-fstack-usage`               | Generates stack usage files         | Helps estimate memory per function             |

- Typical debug build command: `gcc -std=c11 -Wall -Wextra -Werror -O0 -g main.c -o main.elf`
- Typical release build: `gcc -std=c11 -Wall -Wextra -O2 -Werror -o main.elf`
- Common Optimization Levels in Embedded SW
  - Debug builds: -O0 or -O1
  - Release builds: -O2 (safe and predictable)
  - Memory-constrained MCUs: -Os (optimize for size)

## C99 vs C11

| Standard | Key Additions                                                          | Use Case                                                          |
| -------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **C99**  | `inline`, fixed-width integers (`stdint.h`), `//` comments             | Most common in embedded; stable and portable                      |
| **C11**  | Threading library, `_Static_assert`, optional bounds-checking, atomics | For modern compilers or when multi-core/threaded systems are used |

## Debug vs Release build

| Aspect       | Debug                     | Release                 |
| ------------ | ------------------------- | ----------------------- |
| Optimization | `-O0` (none)              | `-O2` or `-O3`          |
| Debug Info   | `-g` enabled              | Often disabled          |
| Warnings     | Enabled (`-Wall -Wextra`) | Still enabled           |
| Purpose      | Development, testing      | Production, performance |

## Debugger

| Category     | Debugger                             | Description                                                                    |
| ------------ | ------------------------------------ | ------------------------------------------------------------------------------ |
| **Debugger** | **GDB**                              | Cross-platform debugger for C/C++; used with JTAG/OpenOCD in embedded targets. |
|              | **LLDB**                             | Clang/LLVM’s debugger (used on macOS).                                         |
|              | **IAR C-SPY**                        | Integrated debugger for IAR compilers.                                         |
|              | **Keil µVision Debugger**            | Integrated MCU debugger/simulator.                                             |
|              | **Segger Ozone / J-Link GDB Server** | GUI debugger + GDB bridge for ARM Cortex devices.                              |
|              | **Green Hills MULTI Debugger**       | Advanced debugger for safety-critical systems.                                 |

Good question — both are tools that connect your **PC debugger (like GDB)** to the **microcontroller hardware** via a debug interface (e.g., JTAG or SWD).

## Embedded Debugging

- In embedded, GCC + GDB + OpenOCD + J-Link is the most common open-source toolchain for real hardware debugging.
  - **GDB** = the *brain* (debug logic)
  - **OpenOCD / J-Link** = the *hands* (hardware access)
  - **Target MCU** = the *body* (code running on the chip)
  - PC (HW) + GDB (SW) ⇄ USB ⇄ Probe (HW) + OpenOCD (SW) ⇄ JTAG (or SWD/DAP) ⇄ ECU (Target MCU)



| Tool                                  | Purpose                                                                                                                                        | How It Fits In                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **OpenOCD** (*Open On-Chip Debugger*) | Open-source server that bridges **GDB ↔ MCU hardware** through JTAG/SWD. It programs flash, halts/resumes the CPU, and reads memory/registers. | You run `openocd`, then connect GDB with `target remote localhost:3333`.   |
| **J-Link** (by SEGGER)                | Commercial hardware debugger and software suite. It provides a **USB-to-SWD/JTAG** interface plus a **GDB server**.                            | GDB connects to the **J-Link GDB Server**, which in turn controls the MCU. |

## JTAG

| Use                         | Description                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| **Programming / Flashing**  | Uploading firmware or bootloaders directly to MCU memory.                                     |
| **Boundary Scan (Testing)** | Hardware test of PCB interconnections (IEEE 1149.1). Detects open/shorted pins between chips. |
| **Device Identification**   | Reading chip IDCODEs for production test.                                                     |
| **Chain Access**            | Accessing multiple devices on one JTAG chain (e.g., MCU + FPGA).                              |

## Probes

| Use Level                     | Common Probe                                  | Typical Targets       |
| ----------------------------- | --------------------------------------------- | --------------------- |
| **Professional / Automotive** | Lauterbach TRACE32, PLS UAD3+, iSYSTEM iC5700 | AURIX, RH850, PowerPC |
| **Industrial / Consumer**     | SEGGER J-Link                                 | ARM Cortex-M/R/A      |
| **Low-cost / Open-source**    | ST-Link, CMSIS-DAP, Black Magic Probe         | STM32, NXP, etc.      |

- For Infineon TC397, prefer PLS UAD3+ or Lauterbach TRACE32 instead of OpenOCD