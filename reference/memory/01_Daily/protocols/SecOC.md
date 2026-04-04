# #SecOC - Secure Onboard Communication

- #Cybersecurity #ISO21434
- COM-Path = Trusted/Authenticated Path -> Cryptographic (❌ #FuSa)
- SecOC Header = MAC - Message Authentication Code (Data + Freshness Value (FV) + Session Key)
- Key Management
    - Master Key (Long-term, injected in MFG, stored in HSM NVM)
    - Session Key (Temporary, derived in HSM via Master Key + Nonce, never transmitted)
- Execution Flow (❌ #FuSa)
    - SENDER: Service Layer (#SecOC) requests MAC from CSM -> HSM: Data + FV + SessionKey = MAC
    - RECEIVER: Calculates local MAC using local Session Key + FV; accepted only if match
    - FRESHNESS: Sync via Trip/Reset Counter to prevent Replay Attacks

```mermaid

sequenceDiagram
    participant S_App as Sender App
    participant S_Sec as Sender Service Layer<br/>(SecOC / CSM)
    participant S_HSM as Sender HSM<br/>(Secured Space)
    participant Bus as Vehicle Network
    participant R_HSM as Receiver HSM<br/>(Secured Space)
    participant R_Sec as Receiver Service Layer<br/>(SecOC / CSM)
    participant R_App as Receiver App

    Note over S_HSM, R_HSM: Key Management (Internal)
    Note right of S_HSM: 1. Store Master Key (NVM)
    Note right of S_HSM: 2. Derive Session Key<br/>(Master Key + Nonce)
    Note left of R_HSM: 1. Store Master Key (NVM)
    Note left of R_HSM: 2. Derive Session Key<br/>(Master Key + Nonce)

    Note over S_App, Bus: Sending Phase
    S_App->>S_Sec: PDU Data
    S_Sec->>S_Sec: Generate Freshness Value (FV)
    S_Sec->>S_HSM: Compute MAC (Data + FV)
    Note right of S_HSM: AES-128 w/ Session Key
    S_HSM-->>S_Sec: MAC
    S_Sec->>Bus: Secured PDU (Data + FV + MAC)

    Note over Bus, R_App: Receiving & Verification Phase
    Bus->>R_Sec: Secured PDU
    R_Sec->>R_Sec: Extract Data, FV, MAC_received
    R_Sec->>R_HSM: Compute MAC (Data + FV)
    Note left of R_HSM: AES-128 w/ Session Key
    R_HSM-->>R_Sec: MAC_calculated
    
    alt MACs Match
        R_Sec->>R_App: PDU Processed (Authentic)
    else MACs Mismatch
        R_Sec--xR_App: PDU Discarded (Spoofing/Corruption)
    end

```