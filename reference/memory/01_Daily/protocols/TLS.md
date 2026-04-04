# #TLS

- OSI Level 4

## The "Two Faces" of TLS Encryption

- Asymmetric (Public/Private Key):
    - Used for: The Handshake (Identity check).
    - Pros: Highly secure, no pre-shared secrets needed.
    - Cons: Slow (Heavy math).
- Symmetric (Shared Secret Key):
    - Used for: Data Transfer (The actual conversation).
    - Pros: Lightning Fast (Hardware-accelerated).
    - Cons: Both sides must already know the secret key.

## #TLS vs. TCP: The Handshake Order

1. TCP Handshake (The Pipe): `SYN` → `SYN-ACK` → `ACK`. (Connection established).
2. TLS Handshake (The Vault): `ClientHello` → `Certificate Check` → `Key Exchange`. (Encryption established).
3. Data Phase: Data is encrypted into TLS Records and then wrapped in TCP Segments.

## Usage

- #ISO15118: The standard for EV Charging that relies heavily on TLS.
- #DoIP (ISO 13400): Using TLS to secure diagnostic sessions at the dealership.