# Boot & Execution

- Boot
    - ROM Code: Immutable trusted starting point, Early Init (CPU, HSM, Pins, eFuses)
    - Bootloader: Check SW Signature, Flashing, Fallback
- Init
    - Startup: Vector Relocation, BIST, RAM
    - HW: MPU, Clocks, WD, HAL, I/O
    - RTOS: Tasks, Stacks, Sync (Mutexes, Semaphores, Lockstep)
- Runtime
    - Schedulers in RTOS w. Memory barriers: Context Switch, IPC
    - Loop: Tasks & ISR, Safety Checks/PWR Modes/Diagnostics
- Shutdown
    - Safety State
    - Data Save NVM (EEPROM/Flash)
    - Reset / Power Down
