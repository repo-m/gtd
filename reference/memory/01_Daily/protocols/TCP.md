# #TCP - Transmission Control Protocol

- Connection-oriented, reliable data delivery.
- Layer: 4 (Transport).
- TCP-Header (20–60 bytes): incl. Seq-Nr, Flags: SYN, ACK, FIN
- 3-Way Handshake:
    - Step 1: Client -> Server: SYN (Seq=x)
    - Step 2: Server -> Client: SYN-ACK (Seq=y, Ack=x+1)
    - Step 3: Client -> Server: ACK (Ack=y+1)
- Data Transfer: Reliable, full-duplex exchange using 
    - Sequence Numbers for ordering
    - Cumulative ACKs for delivery confirmation
    - Sliding Window to dynamically balance flow and congestion.
- 4-Way Handshake (Termination):
    - Host A -> Host B: FIN
    - Host B -> Host A: ACK
    - Host B -> Host A: FIN
    - Host A -> Host B: ACK