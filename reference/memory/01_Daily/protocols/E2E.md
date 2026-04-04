# #E2E - End-to-End Protection

- #FuSa #ISO26262
- COM-Path = Black Box -> QM (❌ #SecOC)
- E2E Header = SQC (Sequence Counter) + CRC (Cyclic Redundancy Check) (Data ID, Counter, Data) 
- State Machine (❌ #SecOC)
    - INIT (windowing: 8/10 valid to switch to valid, otherwise invalid)
    - VALID (windowing: 8/10)
    - INVALID (windowing: <8/10)

## Example Sequence

```mermaid
sequenceDiagram
    participant App1 as ECU1 Application (ASIL C)
    participant E2ELib1 as ECU1 E2E Library
    participant COM as Communication Stack (CAN/Eth)
    participant E2ELib2 as ECU2 E2E Library
    participant App2 as ECU2 Application (ASIL C)

    Note over App1, App2: Data Transmission Phase
    App1->>E2ELib1: Protect(Data)
    Note right of E2ELib1: Increment Counter <br/> Calculate CRC (incl. ID)
    E2ELib1->>COM: Transmit(CRC (incl. ID) + Counter)
    COM->>COM: Propagation (Potential Noise/Delay)
    COM->>E2ELib2: Receive(CRC (incl. ID) + Counter)

    Note over E2ELib2: Data Validation Phase
    Note right of E2ELib2: 1. Verify CRC<br/>2. Check Sequence Counter<br/>3. Validate Data ID
    
    alt Validation Success
        E2ELib2->>App2: Check(E2E_OK, Data)
    else Validation Failed
        E2ELib2->>App2: Check(E2E_ERROR, Null)
        Note right of App2: Enter Safe State
    end
```

