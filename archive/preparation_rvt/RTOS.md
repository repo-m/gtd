# Embedded Systems Architecture & SafeRTOS

## SafeRTOS

- **Metaphor**: HW is the physical infrastructure; SWC are the vehicles; SafeRTOS is Air Traffic Control.
- **Determinism**: Guarantees high-priority task execution within specific timeframes.
- **Certification**: FuSa ISO 26262 ASIL D certified.
- **Task Management**: CRUD operations for tasks and priority adjustments.
- **Scheduler**: Priority-based brain determining the next active task.
- **Inter-Task Communication (IPC)**: Task Notifications, Semaphores, and Mutexes for shared resource management (e.g., SPI bus).
- **Time Management**: System Ticks (heartbeat) for Delay() functions and timeouts.
- **Memory Management**: Strict Static Allocation (no malloc) at compile-time to prevent OOM crashes.
- **Spatial Isolation**: MPU-based "Sandboxing" where each task has a dedicated RAM block/stack; unauthorized access triggers a Memory Manage Fault.

### Performance & Reliability

- **Environmental Standards**: VW 80000 compliance (thermal, voltage, and bus load stress).
- **Timing Metrics**: BCET (Best Case) vs. WCET (Worst Case Execution Time).
- **WCET Analysis Tools**:
    - **Trace Hooks**: Macros like `traceTASK_SWITCHED_IN()` toggling GPIOs for oscilloscope measurement.
    - **Software Profilers**: Vector TA Tool Suite, Percepio Tracealyzer, or CANalyzer for visual timelines.
    - **Static Analysis**: AbsInt aiT for mathematical longest-path calculation on compiled binaries.
- **Timing Budget**: Brittle systems occur when WCET is too close to the RTOS Tick.

### Technical Leadership & Strategy

- **Priority Escalation Trap**: Avoid "Priority Inflation" to fix lag.
- **Risks**: System starvation (starving Watchdog/Braking tasks) and masking root causes like Jitter or Latency.
- **Resolution Path**: Analyze Execution Traces for preemption or Priority Inversion (Mutex bottlenecks) before changing budgets.
- **Interface Management**: SSoT via ICD (Interface Control Document) and SysML Block Diagrams.
- **Validation Hierarchy**: HiL (Hardware-in-the-Loop) simulation for environment validation prior to "Mule" vehicle testing.
- **Debugging**: Correlation of CAN bus load with CPU utilization and Trace32 profiling.