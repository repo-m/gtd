# ICMP - Internet Control Message Protocol

*ICMP is the network layer's diagnostic mechanism, providing error reporting and connectivity checks (Ping) directly over IP without transport ports.*

- Service:
    1. Error Reporting
    2. Informational Queries
- Transport: 
    - #OSI L3
    - Used by network devices like routers
    - Protocol Number of IP: 1
    - No Ports: Does not use TCP/UDP ports; interacts directly with the OS network stack.
- Routine:
    1. Query/Reply Routine: Ping: Request (Type 8), Reply (Type 0)
    2. Error Reporting Routine back to Source
        - Time Exceeded Routine: if TTL hits 0, router kills the packet and sent ICMP Time Exceeded message back to the sender -> Example Tracerouting
- Encapsulation: directly inside an IP packet
    - IP Header: Source IP, Destination IP, Protocol Field (set to 1 for #ICMP )
    - Ethernet Payload
        - ICMP Header: Type, Code, Checksum
        - ICMP Payload: copy of the original IP header and the first 8 bytes of the data that caused the error
- Artifacts: fixed standard
    - Type 8 & 0: Echo Request & Reply (Ping).
    - **Type 3: Destination Unreachable (Code 0=Net, 1=Host, 3=Port).**
    - Type 11: Time Exceeded (TTL Expired).
- Mission
    - Primary: Diagnose network health and path reachability.
    - Secondary: Security risk; often blocked by firewalls to prevent network mapping.


## Analogy

- The Dashboard Light (Service): ICMP is the "Check Engine" light. It doesn't fix the car (the network); it just tells the driver (the Source) that something is wrong.
- The Building Manager (Transport):
    - TCP/UDP = Letters to specific employees at specific desks (Ports).
    - ICMP = Memos to the Building Manager (OS Kernel). It handles general building issues (door locked, elevator broken) rather than specific business tasks.
- The Traffic Cop (Redirect): A router waving you to a different lane (Redirect Type 5) because it knows a shortcut.
