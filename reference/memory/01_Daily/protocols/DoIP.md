# #DoIP - Diagnostics over Internet Protocol


- Service: High-speed diagnostic communication and parallel flashing.
- Transport: L7 over #TCP #UDP Port 13400.
- Routine:*Let Diagnostics Try Run Everywhere*
    - Link & Activation: Physical connection (L1) and optional 12V on Pin 8.
    - Discovery (via #UDP ): Vehicle broadcasts its VIN/EID. Tester identifies the target.
    - Transport Setup ( #TCP / #TLS )
        - #TCP 3-way handshake
        - #TLS Handshake (optional)
    - Routing Activation
        - Tester send Source Address (SA)
        - GW checks: Is this SA allowed on this socket?
        - GW send "Routing Activation Response"
    - Diagnostic Exchange #UDS
- Encapsulation:
    - Protocol Version — Inverse Version — Payload Type — Payload Length — Payload.
    - [Ethernet [IP [ #TCP [ #TLS [ #DoIP [ #UDS ]]]]]]
- Artifact: ARXML (Ethernet configuration).
- Mission: High-bandwidth data transfer for rapid software updates and vehicle diagnostics.


```Mermaid
sequenceDiagram
    participant T as External Tester
    participant G as DoIP Gateway (ECU)
    participant E as Target ECU

    Note over T, G: L1: Link & Physical Activation
    T->>G: L4: Vehicle Identification Request (UDP)
    G-->>T: L4: Vehicle Announcement (UDP)

    Note over T, G: L4: TCP Connection
    T->>G: TCP SYN
    G-->>T: TCP SYN-ACK

    Note over T, G: --- TLS ASYMMETRICAL HANDSHAKE (L5/L6) ---
    T->>G: Client Hello (Cipher Suites)
    G-->>T: Server Hello + Certificate (Public Key)
    Note over T: Verify Certificate & Authenticity
    T->>G: Client Key Exchange (Pre-Master Secret encrypted via Public Key)
    Note over G: Decrypts Pre-Master Secret via Private Key

    Note over T, G: --- TLS SYMMETRICAL SESSION (L5/L6) ---
    Note over T, G: Both generate Session Key
    T->>G: Change Cipher Spec (Encrypted from here)
    G-->>T: Change Cipher Spec (Encrypted from here)

    Note over T, G: L5: Routing Activation (Inside TLS)
    T->>G: DoIP Routing Activation Request
    G-->>T: DoIP Routing Activation Response (Success)

    Note over T, E: L7: Diagnostic Exchange (Inside TLS)
    T->>G: UDS: Read Data by ID (0x22)
    G->>E: Forward to Target Bus (CAN/LIN/Eth)
    E-->>G: UDS Response
    G-->>T: UDS: Data Transfer (Encrypted)
```

#DoIP #OSI