# #UDS - Unified Diagnostic Services / #ISO14229

- Service: Diagnostics
- Transport: L7 over #CAN or #DoIP
- Routine: Client (Tester) - Server (ECU) : request - response
- Encapsulation:
    - Request: SID (e.g. 0x10 "Diag Session Control")
    - Positive Response: SID + 0x40 (e.g. 0x50)
    - Negative Response: 0x7F | SID | NRC (Negative Response Code)
      - Common NRC:
        - 0x11: Service Not Supported
        - 0x12: Sub-function Not Supported
        - 0x22: Condition Not Correct
        - 0x31: Request Out of Range
        - 0x35: Invalid Key
        - 0x78: Response Pending
- Artifact: ODX
- Mission: Troubleshooting, Flashing, and production line configuration

## Security Access 0x27 - 007

- Tester Requests Seed: 0x27 0x01
- ECU generates random number (seed) and send it back: 0x67 0x01 0xAA 0xBB 0xCC 0xDD
- Test and ECU calculate the key from the seed
- Tester sends key: 0x27 0x02
- ECU checks key and send
  - positive Response: 0x67 0x02
  - negative Response: 0x7F 0x27 0x35

## DID - Data Identifier - Data in Drawer

- F190: VIN, F188: ECU SW Nr, 0100-EFF; OEM specific
- Read Data By Identifier
  - Request: 0x22 + DID High Byte + DID Low Byte
  - Positiv Response: 0x62 + DID + Data Value
- Write Data By Identifier -> Often Extended Session + Security Access needed
  - Request: 0x2E + DID + New Data Value
  - Positive Response: 0x6E + DID 

## DTC - Diagnostic Trouble Code - 0x19: 9-1-1 Emergency + 0x14: For-gotten 

- Request to Read DTC: 0x19 0x02 0xFF
  - 0x19: SID
  - 0x02: Report DTC by Status Mask (common, other options available)
  - 0xFF: MASK - Show me everything (history, pending, active)
    - Other MASKs
      - 0x01: Show me only currently active faults
      - 0x09: Show me active faults or confirmed faults
  - Response: 0x59 0x02 [AvailibilityMask] [DTC1_Byte1] [DTC1_Byte2] [DTC1_Byte2] [Status] [DTC2...]
    - list with 3 bytes for the ID + 1 byte for status
- Request to clear Diagnostic Information: 0x14 [Group]
  - Group: 0xFF 0xFF 0xFF (Clear All DTCs)
  - Response: 0x54 (Success)

## Routine Control 0x31 - 3(2)1 - 123 ACTION

- Request: 0x31 0x01 + RID + Optional Parameters
  - 0x01: Sub function
    - 0x01: Start
    - 0x02: Stop
    - 0x03: Request Result
  - RID
    - 0x0202: Check Memory Integrity
    - 0xFF00: Erase Memory (for flashing)
    - 0x4001: Roll Window Down
- Positive Response: 0x71 0x01 + RID + Status
- Example - Turn on the Radiator Fan (RID 0xABCD) at 50% speed
  - Tester: 0x31 0x01 0xAB 0xCD 0x32
    - 0x31 0x01: Routine Control -> Start.
    - 0xAB 0xCD: Routine ID for Fan Control.
    - 0x32: 50 (decimal) -> The argument for the function (50% duty cycle).
  - ECU: 0x71 0x01 0xAB 0xCD 0x01
    - 0x71: Success.
    - 0x01: Confirming "Start".
    - 0xAB 0xCD: Confirming RID.
    - 0x01: Status (e.g., "Fan commanded successfully").