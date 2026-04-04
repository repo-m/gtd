# #SOME/IP - Scalable Service-Oriented MiddlewarE over IP

- Service: Scalable service-oriented middleware
- Transport: L7 over #UDP or #TCP
- Routine: 
    - Pub/Sub via Service Discovery (SD)
        - Offer: Server broadcasts availability (Multicast).
        - Find: Client asks for service.
        - Subscribe/Ack: Handshake for EventGroups.
    - Remote Procedure Calls (RPC)
- Encapsulation: Message ID (Service + Method) — Request ID — TTL (Heartbeat) — Payload.
- Artifact: ARXML (Service interface definitions).
- Mission: Inter-ECU communication for ADAS and Infotainment.