# Prep Last One

- Service
- Transport
- Routine
- Encapsulation
- Artifact
- Mission



- Difference between I2C, SPI & XCP

harmonize
- The "Stolen Time" View: In the task timeline, look for gaps in a task's execution. If a task is "Running" but there is a gap where no instructions are retiring, that is often a "hidden" ISR stealing the CPU.
- trace32 (Lauterbach): via JTAG or SWD and monitors the CPU directly (option to use it over XCP if ECU is already sealed)
- ADS (Analog-To-Digital-Converter) Limit Checking (expl trigger only if temp > 100°C)
- Kubernetes -> Orchestration of multiple docker containers



## Embedded C/C++ & Memory Safety

- Use `volatile` for memory-mapped I/O (motor registers) and variables shared with ISRs to prevent compiler optimization.
- Use `static` 
    - inside functions to retain values between calls
    - outside functions to limit visibility to the specific file.
- Use `const` to ensure data remains unchanged, allowing the linker to store it in Flash/ROM instead of RAM.
- Implement `std::unique_ptr` and `std::shared_ptr` in non-safety-critical layers for automated memory management.
- Protect SerDes data streams (camera feeds) via CRCs, hardware validation, and length checks.
- Pre-allocate fixed-size buffers at compile time to prevent buffer overflows during deserialization.

## RTOS, Concurrency & Scheduling

- Use Mutexes with Priority Inheritance to prevent Priority Inversion. (One Key)
- Use Semaphores for signaling between ISRs and tasks or managing resource pools. (Library Example)
- Apply Spinlocks for minimal-latency locking in extremely short tasks.
- Implement "Top Half/Bottom Half" ISR management: ISR performs minimal work (clears flags, buffers data) and triggers a high-priority task for processing.
- Prevent CPU starvation
    - via interrupt throttling (set min tiem between interrupts)
    - hardware filtering (e.g., CAN ID filtering)
- Manage task overruns by 
    - skipping activations
    - terminating with errors 
    - allowing delayed execution

## Memory Management & Hardware Offloading

- Utilize DMA (Direct Memory Access) to move data without CPU intervention; use interrupts to signal completion.
- Maintain cache coherency during DMA operations:
    - DMA to RAM: Invalidate CPU cache to ensure it reads new data from RAM
    - CPU to RAM: Clean/Flush CPU cache to push new data into RAM before DMA access
- Configure MPU to treat specific memory addresses as non-cacheable
- Monitor stack "high-water marks" and maintain a 30% safety margin (trace32)
- Memory
    - Registers: Fast, internal CPU storage for immediate calculations and instruction pointers.
    - RAM (Random Access Memory): Volatile working memory.
        - Stack: Stores local variables, function return addresses, and interrupt contexts.
        - Heap: Stores dynamically allocated memory (used sparingly in safety-critical automotive code).
    - ROM (Read Only Memory): Non-volatile storage containing the immutable program code and constant lookup tables.
    - NVM / Flash (Non-Volatile Memory): Writable storage that persists after power-off, used for calibration data, "learned" vehicle parameters, and Diagnostic Trouble Codes (DTCs).

## Debugging & Trace32 (Lauterbach)

- trace32 (Lauterbach): via JTAG or SWD and monitors the CPU directly (option to use it over XCP if ECU is already sealed)
- Map hardware traces to source code using ELF/DWARF symbols and ORTI/ARTI files.
- Visualize task preemption, ISR latency, and periodicity via Gantt charts without code instrumentation.
- Monitor CPU Load: $\text{Active Task Duration} / \text{Total Cycle Duration}$.
- Distinguish between
    - Core/Net Time (function execution)
    - Gross Time (includes interruptions)
- Use hardware tracing (ETM/PTB) to identify "Stolen Time" where ISRs hide within task timelines.
- Automate testing and flashing in CI loops using PRACTICE scripts (.cmm files).
- Identify "Heisenbugs" caused by following differences between Debug and Release builds:
    - timing changes (printf) 
    - memory padding
    - compiler optimization 

## OTA & Security

- Sign software hashes with Private Keys in an HSM; verify on-vehicle with Public Keys and crypto engines.
- Utilize A/B Partitioning (dual-bank) for background downloads and safe rollbacks.
- Coordinate `dmesg` SoC logs with MCU real-time tracing to debug integration bottlenecks.

## Hardware-in-the-Loop (HIL) Testing

- Stress electrical interfaces and validate integration using real-time processors (e.g., dSpace).
- HIL - FPGA - I/O Signal Conditioning - FIU - Pins/Wires - ECU (DUT) 
    - DSpace example
        - CPU: Runs Simulink Model
        - Multifunction I/O Boards (FPGA Layer): cards that slot into the rack -> Handles high-speed timing/protocols
        - Signal Conditioning & Load Cards: Boost signals + pushes/pull current (Amps)
            - - to convert HIL digital logic into realistic analog signals (DAC -> Filter -> Op-Amp).
        - FIU Cards -> short circuits, open circuits, and reverse polarity.
        - BOB -> Break out Box
- Validate ECU behavior during open circuits: check for DTCs based on pull-up (High Input) or pull-down (Low Input) designs.
- Verify Ethernet configurations (Master/Slave) and CAN termination/stub lengths.

## File Types & Memory Categories

- **Machine Code:** .bin, .hex (Flashing).
- **Debug/OS:** .elf, .out, .svd (Peripherals), .orti (RTOS).
- **Configuration:** .map (Linker report), .ld (Linker script), .arxml (AUTOSAR).
- **Network:** .dbc (CAN), .ldf (LIN), .fibex (Multi-bus).
- **Tuning:** .a2l (Calibration), .padd (Parameters).
- **Storage:** Registers (Immediate), RAM (Stack/Heap), ROM (Immutable code), Flash (NVM/DTCs).
