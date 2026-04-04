# #ARP - Adress Resolution Protocol

- Service: Mapping of dynamic L3 logical addresses (IPv4) to static L2 physical addresses (MAC).
- Transport: #OSI L2 ; EtherType 0x0806; Boundary: Limited to the LAN; routers do not forward ARP requests
- Routine: Request/Response via broadcast
    - Request: "Who has IP X? Tell IP Y" (Sent to Broadcast MAC FF:FF:FF:FF:FF:FF).
    - Response: "I have IP X, my MAC is Z" (Unicast back to the requester).
    - Gratuitous ARP: A node broadcasts its own IP/MAC mapping without being asked. Used for Conflict Detection (IP address collisions) and updating neighbor caches after a failover.
- Encapsulation: Ethernet Header + ARP Request
    - HW Type: 1 for Ethernet
    - Protocol Type: 0x0800 for IPv4
    - Operation (Opcode): Request  = 1; Reply = 2
    - Sender MAC & IP
    - Target IP
    - Target MAC: @request = 00:00:00:00:00:00
- Artifact: ARP Table (Cache): Short-term memory with TTL (Time-To-Live)
    - viewable via `arp -a` or `ip neigh`
    - Vulnerability: ARP Poisoning / Spoofing. Since ARP is a "trusting" protocol with no verification, an attacker can send fake responses to perform a Man-in-the-Middle (MITM) attack, intercepting traffic between a host and the Router.
- Mission: Enabling local delivery of IP packets; the "glue" between networking and hardware.


```mermaid
sequenceDiagram
    participant Laptop as Laptop (192.168.1.10)
    participant Switch as Network Switch
    participant Printer as Printer (192.168.1.50)
    participant Router as Router (Gateway 192.168.1.1)
    participant Other as Other Devices

    Note over Laptop, Other: --- PHASE 1: GRATUITOUS ARP (Announcement & Conflict Check) ---
    
    Laptop->>Switch: ARP Request (Broadcast)
    Note right of Laptop: Sender IP: .10 | Target IP: .10
    Switch->>Printer: Forward Broadcast
    Switch->>Router: Forward Broadcast
    Switch->>Other: Forward Broadcast
    
    Note over Printer, Router: (Implicitly update cache with Laptop's MAC)
    Note over Other: I'm not .10. (Silence = Success)

    Note over Laptop, Other: --- PHASE 2: LOCAL DISCOVERY (Finding the Printer) ---

    Laptop->>Switch: ARP Request (Broadcast)
    Note right of Laptop: "Who has .50? Tell .10"
    Switch->>Printer: Forward Broadcast
    
    Printer->>Switch: ARP Reply (Unicast)
    Note left of Printer: "I am .50. My MAC is 00:11..."
    Switch->>Laptop: Forward Reply
    Note over Laptop: Cache Updated (Printer Found)

    Note over Laptop, Other: --- PHASE 3: GATEWAY DISCOVERY (Target is External e.g. 8.8.8.8) ---

    Note right of Laptop: Logic: 8.8.8.8 is NOT in 192.168.1.0/24
    Laptop->>Switch: ARP Request (Broadcast)
    Note right of Laptop: "Who has .1 (Gateway)? Tell .10"
    Note over Laptop: Does NOT ARP for 8.8.8.8
    Switch->>Router: Forward Broadcast
    
    Router->>Switch: ARP Reply (Unicast)
    Note left of Router: "I am .1. My MAC is 00:BB..."
    Switch->>Laptop: Forward Reply
    Note over Laptop: Cache Updated (Exit Point Found)

    Note over Laptop, Router: --- PHASE 4: DATA FLOW ---
    Laptop->>Router: L2 Frame (Dest: Router MAC) | L3 Packet (Dest: 8.8.8.8)
    Note over Router: Routing Boundary: ARP stops here.
```

