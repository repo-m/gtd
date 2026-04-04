# #MQTT - Message Queuing Telemetry Transport

- Service: Lightweight telemetry and event-based messaging for external connectivity.
- Transport: L7 over #TCP (standard Ports 1883 or 8883 for #TLS ).
- Routine: Broker-based **Publish/Subscribe** mechanism.
    - Clients connect to a central **Broker**.
    - **Publishers** send data to specific "Topics" (e.g., `vehicle/vin/engine/temp`).
    - **Subscribers** receive data only from Topics they have registered for.
- Encapsulation:
    - Fixed Header (2 bytes) — Variable Header — Payload (typically **JSON** or **Protobuf**).
    - Includes **QoS** (Quality of Service) levels: 0 (Fire and forget), 1 (Acknowledged), and 2 (Exactly once).
- Artifact: Topic Tree structure and Broker URL/Credentials.
- Mission: Telematics, Vehicle-to-Cloud (V2G) communication, and remote status monitoring.



```mermaid
sequenceDiagram
    participant P as Publisher (ECU/TCU)
    participant B as MQTT Broker (Cloud)
    participant S as Subscriber (App/Backend)

    Note over P, B: 1. Connection Phase
    P->>B: CONNECT
    B-->>P: CONNACK (Success)
    
    Note over S, B: 2. Subscription Phase
    S->>B: SUBSCRIBE (Topic: v1/car/engine/temp)
    B-->>S: SUBACK

    Note over P, S: 3. Data Flow (QoS 1)
    P->>B: PUBLISH (Topic: v1/car/engine/temp, Payload: 90°C)
    B-->>P: PUBACK (Acknowledged)
    B->>S: PUBLISH (Topic: v1/car/engine/temp, Payload: 90°C)
    S-->>B: PUBACK

    Note over P, B: 4. Disconnect/Keep-Alive
    P->>B: PINGREQ
    B-->>P: PINGRESP
    P->>B: DISCONNECT
```