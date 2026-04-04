# #IVN - In-Vehicle Networking => CORE

## LIN (Local Interconnect Network)

- Connection
    - Single-master / multi-slave
    - Single wire 12V
    - Deterministic, schedule-based
- Output: ≤ 20 kbit/s, payload 0–8 bytes
- Role
    - Used for windows, seats, mirrors, interior lighting
    - Very low cost and simple implementation
    - LDF
- Encapsulation: Break - Sync - ID - Data - Checksum

## CAN (Controller Area Network)

- Connection
    - Multi-master broadcast
    - 2-wire differential (Twisted Pair)
    - Termination: 120 Ohm resistors at both ends
- Output
    - Classic: 125 kbit/s–1 Mbit/s, payload 0–8 bytes.
    - CAN FD: 8 Mbit/s, payload 0-64 bytes. -> Backward compatible with Classic CAN.
- Role
    - Used for powertrain, chassis, HVAC, braking.
    - Strong arbitration (ID-based priority) and error handling.
    - DBC
- Encapsulation: SOF → ID (Arbitration) → DLC → Data → CRC → ACK → EOF

## Automotive Ethernet

- Connection:
    - Switched, **point-to-point**, full-duplex communication
    - Unshielded Twisted Pair (UTP), PAM3 signaling.
    - Isolation via transformers or AC coupling (EMC robustness).
- Output:
    - Payload up to ~1500 bytes.
    - 100BASE-T1: 100 Mbit/s (15m).
    - 1000BASE-T1: 1 Gbit/s (15m).
- Role:
    - Vehicle backbone for ADAS, infotainment, OTA.
    - Supports IP-based protocols (TCP, UDP, SOME/IP).
    - Switching via MAC tables, VLANs, and QoS (Level 2)
    - FIBEX / ARXML
- Encapsulation: Preamble - SFD - Dest MAC - Src MAC - VLAN - EtherType - Payload - FCS.


### Ethernet Tracing

- Cannot passively sniff (unlike CAN) due to point-to-point switches.
- **Methods:**
    - **Port Mirroring (SPAN):** Switch copies traffic to a monitor port (intrusive, may drop packets if overloaded).
    - **TAPs (Test Access Points):** Physical hardware inserted in line; adds slight latency but captures physical errors.
    - **ECU Instrumentation:** ECU sends traces via separate channel (high overhead).

### Ethernet Classic vs Automotive Ethernet

- Why not earlier with Ethernet Classic?
  - 4 wires instead of 2 wires -> weight & costs
  - not robust against EMC
  - no support of needed power modes (Sleep, ...)
  - to slow wake up time -> Automotive Req: Wake-Up-Time < 100ms
- 10/100BASE-TX (Standard Eth): 4 wires, not EMC robust enough for auto core.

## Tracing Encrypted Messages

- TLS/DTLS: Trace shows "Application Data" (opaque). Debugging requires the Session Key (logged by the ECU) or the Private Key (imported into Wireshark).
- #SecOC (Secure Onboard Communication):
  - Standard Mode: Payload is Plaintext (readable) + MAC (Signature). Trace is visible; spoofing is impossible without the key.
  - Encrypted Mode: Payload is Ciphertext. Debugging requires the symmetric key to decrypt.
- MACsec: Entire L2 payload is encrypted. Tracing requires hardware with MACsec decryption support or key knowledge

## Mixed Networks

- Central Gateway connects heterogeneous buses (CAN-FD, LIN, Eth).
- **Bottlenecks:** Gateway CPU load, buffer overflows during protocol conversion (Eth <-> CAN), and bandwidth mismatch.
- **Termination:** Required at physical ends of CAN/FlexRay lines; Ethernet uses internal PHY termination.
- **Wake-up:**
  - **Discrete:** Dedicated line (e.g., KL15 ignition).
  - **Bus-based:** Wake on CAN activity or Ethernet Wake-up Pattern (WUP).

## Data Flow

- **Path:** Sensor -> ECU A (Serialize) -> Gateway (Route/Convert) -> ECU B (Deserialize/Algo) -> Actuator.
- **Serialization:** Conversion of objects to binary (e.g., SOME/IP uses Big Endian).
- **Latency:** Accumulates via serialization time + wire time + switch hops + gateway routing + deserialization.