# ⚙️ **RTOS & Concurrency – Core Overview**

## 🧩 **Key Concepts**

| Concept                             | Description                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| **Task / Thread**                   | A small, independent function scheduled by the RTOS. Runs periodically or on events. |
| **Scheduler**                       | Decides which task runs next (preemptive or cooperative).                            |
| **Tick**                            | Hardware timer interrupt (e.g., every 1 ms) that drives the scheduler.               |
| **Priority**                        | Each task has a priority; higher priority tasks pre-empt lower ones.                 |
| **Context Switch**                  | Saving/restoring CPU state when switching tasks.                                     |
| **Semaphore**                       | Synchronization primitive — blocks until a resource/event becomes available.         |
| **Mutex**                           | Like a semaphore but with **ownership** to prevent priority inversion.               |
| **ISR (Interrupt Service Routine)** | High-priority code triggered by hardware events; often signals tasks.                |
| **Watchdog**                        | Safety mechanism that resets system if tasks hang or miss deadlines.                 |

## 💡 **Embedded Notes**

* **Avoid dynamic memory** (`malloc`); use static task stacks.
* **Protect shared data** with mutexes or atomic access.
* **Keep ISRs short**, signal tasks via semaphores or queues.
* **Measure deadlines** — missed deadlines = safety fault.
* In safety SW (ISO 26262), determinism and bounded timing are mandatory.

## Stack vs Heap

| Area      | Purpose                                                                                               | Managed by                    | Behavior                                             |
| --------- | ----------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------- |
| **Stack** | Holds local variables, return addresses, context. Each **task or function call** gets its own region. | Compiler + RTOS               | Grows/shrinks automatically (LIFO).                  |
| **Heap**  | General-purpose memory pool for `malloc()` or dynamic objects (e.g. `xTaskCreate`).                   | C library / RTOS heap manager | Grows and shrinks dynamically, manual `malloc/free`. |
