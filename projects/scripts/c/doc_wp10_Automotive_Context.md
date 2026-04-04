# WP10 Automotive Context

## Core Principles

| Rule                                    | Rationale                                            |
| --------------------------------------- | ---------------------------------------------------- |
| **No dynamic memory (`malloc/free`)**   | Causes fragmentation, non-deterministic behavior.    |
| **Static initialization only**          | All data must be defined and initialized before use. |
| **No recursion**                        | Stack depth unpredictable → use iteration.           |
| **No implicit type conversions**        | Prevent overflow or sign errors.                     |
| **No pointer arithmetic beyond arrays** | Avoid undefined behavior.                            |
| **Volatile for HW registers**           | Prevent compiler reordering/optimization.            |
| **Check all return values**             | Never ignore error codes.                            |
| **Single point of exit per function**   | Improves traceability.                               |
| **Bound all loops and arrays**          | Ensure termination and prevent overflow.             |

## Common Static Analysis Tools

| Tool                       | Function                                             | Notes                                             |
| -------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| **PC-Lint / FlexeLint**    | Classic static code analyzer for MISRA compliance.   | Detects rule violations, dead code, type issues.  |
| **Coverity Scan**          | Advanced static analysis & data-flow tracking.       | Detects security, concurrency, and memory issues. |
| **Klocwork**               | MISRA/ISO-ready code analysis with detailed metrics. | Used in automotive & avionics.                    |
| **Polyspace (MathWorks)**  | Formal verification of run-time errors.              | Proves absence of overflows, divide-by-zero, etc. |
| **QAC / QAC++ (Perforce)** | Industry-standard for MISRA checking.                | Deep rule coverage and compliance reporting.      |
| **Cppcheck**               | Open-source static analyzer.                         | Lightweight, can check MISRA subsets.             |

## CAN & LIN

| Bus                   | Frame fields (order)                                                                                                                                            | Payload    | Speed / Topology                                      | Error handling                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| **CAN 2.0 (Classic)** | SOF → **Arbitration** (11-bit ID, RTR) → **Control** (IDE, r0, **DLC**) → **Data** → **CRC** (15) + delim → **ACK** slot+delim → **EOF** (7) → Intermission (3) | 0–8 bytes  | up to ~1 Mbit/s, multi-master, differential (CAN_H/L) | Bit stuffing, CRC, ACK, error frames, automatic retransmit |
| **CAN FD**            | Same layout concept; adds **BRS** (bit-rate switch) & **ESI**; longer CRC (17/21)                                                                               | 0–64 bytes | data phase faster (e.g., 2–8 Mbit/s)                  | Stronger CRC; otherwise as CAN                             |
| **LIN**               | **Break** → **Sync** (0x55) → **ID** (6-bit + 2 parity) → **Data** (2–8 bytes) → **Checksum** (classic or enhanced)                                             | 2–8 bytes  | ~1–20 kbit/s, single master + slaves, single wire     | Parity on ID + checksum; no arbitration/retransmit         |

- CAN 2.0 Classic
  - [  0] SOF (1)
  - [ 1–11] ID[10:0] (11)
  - [   12] RTR (1)            // 0=data, 1=remote
  - [   13] IDE (1)            // 0=standard frame
  - [   14] r0  (1)            // reserved, dominant
  - [15–18] DLC (4)            // data length code: 0..8
  - [... ] DATA (0..8 bytes)   // 0..64 bits in classic CAN
  - [... ] CRC (15) + CRC delimiter (1 recessive)
  - [... ] ACK slot (1) + ACK delimiter (1)
  - [... ] EOF (7 recessive)
  - [... ] Intermission (3 recessive)  // interframe space

- Extended CAN
  - [  0] SOF (1)
  - [1–11] ID[28:18] (11)
  - [   12] SRR (1)            // recessive; used in 29-bit arbitration
  - [   13] IDE (1)            // 1=extended frame
  - [14–31] ID[17:0] (18)
  - [   32] RTR (1)
  - [   33] r1 (1), [34] r0 (1)
  - [35–38] DLC (4)
  - [... ] DATA (0..8 bytes)
  - [... ] CRC (15) + CRC delimiter (1)
  - [... ] ACK slot (1) + ACK delimiter (1)
  - [... ] EOF (7), Intermission (3)

## Wire Length CAN, CANFD and LIN

It depends on bitrate, transceivers, cable, and stubs—rule-of-thumb values below.
Use these as planning numbers; validate with your PHY vendor and harness spec.

| Bus                     |       Bit rate |                        Typical max bus length |
| ----------------------- | -------------: | --------------------------------------------: |
| **CAN (Classic)**       |       1 Mbit/s |                                         ~40 m |
|                         |     500 kbit/s |                                        ~100 m |
|                         |     250 kbit/s |                                        ~250 m |
|                         |     125 kbit/s |                                        ~500 m |
|                         |      50 kbit/s |                                       ~1000 m |
| **CAN FD** (nominal)    | 500 k–1 Mbit/s | ~100–40 m (same as Classic for nominal phase) |
| **CAN FD** (data phase) |       2 Mbit/s |                                         ~50 m |
|                         |       5 Mbit/s |                                      ~10–20 m |
|                         |       8 Mbit/s |                                       ~5–10 m |
| **LIN**                 |    19.2 kbit/s |  ~40 m (typical); ~10–20 m common in vehicles |

## Core Safety Concepts (ISO 26262 / Automotive Context)

| Concept                     | Meaning                                                                                                | Example                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Fail-silent**             | When a fault occurs, the system stops transmitting or acting to avoid unsafe outputs.                  | If a sensor module detects corrupted data → stop sending CAN messages instead of sending wrong values. |
| **Redundant monitoring**    | Two components independently check each other’s output for consistency.                                | Two ECUs calculate torque independently and compare results.                                           |
| **Watchdog supervision**    | A hardware or software timer ensures tasks execute cyclically; resets system on timeout.               | Safety manager resets MCU if the watchdog task doesn’t “kick” it within 100 ms.                        |
| **Graceful degradation**    | System continues in a limited safe mode after a fault.                                                 | Steering assist disables but mechanical steering remains active.                                       |
| **Safety mechanisms in SW** | Defensive coding (range checks, timeouts, asserts in dev), redundant variable storage (mirrored CRCs). | Use `uint16_t val; uint16_t val_inv = ~val;` and verify before use.                                    |
