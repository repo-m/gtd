# #XCP - Universal Measurement and Calibration Protocol


- Service: High-performance internal ECU variable measurement and calibration.
- Transport: Abstraction layer that runs over #CAN #Ethernet #UDP #TCP #SPI USB
- Routine: Master (Tool) / Slave (ECU),
    - Measurement (DAQ): Periodic "Push" of memory values from ECU to Tool
    - Calibration (STIM): "Poke" or overwrite ECU RAM values to tune behavior in real-time
- Encapsulation:
    - **CTO** (Control Transmit Object): For commands, responses, and errors.
    - **DTO** (Data Transmit Object): For synchronous measurement data and stimulation data.
- Artifact: A2L File (contains memory addresses and scaling formulas )
- Mission: Real-time fine-tuning of control algorithms and signal monitoring during the R&D and vehicle testing phases.

## Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Tool as Calibration Tool (CANape/INCA)
    participant A2L as A2L Database
    participant ECU as ECU (XCP Slave)

    Note over Tool, A2L: Tool maps variable "Target_Torque" <br/> to Address 0xDEADBEEF
    
    Tool->>ECU: CONNECT (0xFF)
    ECU-->>Tool: Session Info & Max Packet Size

    Note over Tool, ECU: Measurement Phase (DAQ)
    Tool->>ECU: SET_DAQ_PTR (List 1, Event: 10ms)
    Tool->>ECU: WRITE_DAQ (Address: 0xDEADBEEF)
    Tool->>ECU: START_STOP_DAQ_LIST (Start)
    loop Every 10ms
        ECU->>Tool: DAQ_DTO (Timestamp + Payload)
    end

    Note over Tool, ECU: Calibration Phase (STIM)
    Tool->>ECU: DOWNLOAD (Address: 0xDEADBEEF, Value: 400Nm)
    ECU->>ECU: Overwrites value in RAM
    ECU-->>Tool: COMMAND_RESPONSE (OK)
```