# #SFD - Sichere Fahrzeug Diagnose


- Service: #Cybersecurity #UDS Service 0x27 (Security Access).
- Transport: Operates as a sub-protocol within #UDS , typically over **CAN** or **DoIP**.
- Routine**: Asymmetric Challenge-Response with Remote Authorization (VW Backend).
    - **Step 1**: Tester requests access; ECU generates a Challenge (Random String).
    - **Step 2**: Tester sends Challenge to the OEM Portal (Server) for signing.
    - **Step 3**: Server returns a Signed Token (Response).
    - **Step 4**: ECU verifies Token using its internal Public Key.
- Encapsulation: #UDS 0x27 payloads
- Artifact:
    - Public Key injected in ECU during production
    - Private Key held by OEM Server
- Mission: Write Protection to ensure high traceability and prevent unauthorized modifications (e.g., coding/tuning).

## Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Tool as Diagnostic Tool (ODIS/VCDS)
    participant ECU as Car Control Unit
    participant Server as VW SFD Portal

    Note over Tool, ECU: Connection: OBD-II Port
    Tool->>ECU: Request "Write" Access
    ECU-->>Tool: Sends Challenge Code (Random String)

    Note over Tool, Server: Connection: Internet Required
    alt Online Mode
        Tool->>Server: Automatically sends Challenge
        Server-->>Tool: Returns Response Token
    else Offline Mode
        Tool->>Tool: Display Challenge to User
        Note right of Tool: User manually copies code<br/>to a PC with internet
        Tool->>Server: User enters Challenge on Portal
        Server-->>Tool: User types Token into Tool
    end

    Tool->>ECU: Sends Response Token
    ECU->>ECU: Verifies Token
    ECU-->>Tool: Access Granted (90 Minutes)
```