# Config CANoe

1. Create new empty config
2. Add "Netzwerke" in Simulationsaufbau for LIN, CAN, Ethernet
3. Rename first dektop to cfg
4. Create additional Desktops for CAN, LIN, Ethernet
5. "Netzwerke" CAN, LIN, Eth aus cfg herauslösen und in entsprechende desktops LIN, CAN oder Ethernet anzeigen auswählen
6. cfg/Simulationsaufbau: Datenbasen auswählen und Kanäle einfügen (DBC for CAN, LDF for LIN, FIBEX/XML for Ethernet)
7. Configure Hardware Ports: For Ethernet activate Port 1 and Port 2
8. Hardware/Kanäle zuordnen: Map Vector HW with channels (Applikationskanäle)
9. Only for CAN: Netzwerk-Hardware-Konfiguration (Info from Vernetzungsbild)
    - CAN - Baudrate 500 + Abtastzeitpunkt 75
    - CANFD1: Baudrate 500 + Abtastzeitpunkt: 80
    - CANFD2: Baudrate 500 & 2000 + Abtastzeitpunkt 80 & 70
10. Desktop:Ethernet - Add Columns ID/Name
11. Desktop:CAN - Add Column Sender Node
12. Graphic Config
    - Diagramm: Black 6 + Stützstellen anzeigen
    - Symbol/Achsen: Y-Achse einstellen
    - Zoom nur X-Achse

## Shortcuts

- F9: Start - ESC: Stop

## Signals

- Filter: Name include NM (Netzwekmanagement)
- Filter: Name include KN (Knotenbotschaft)
- ESP V Signal: Does the vehc move? -> Precondition for Flashing
- Airbag 11
- BEM_02: very fast message (NVEM); Check delays
- DEV-Messages: Check bus overload
- Klemmenstatus01
- Systeminfo: Not plausible yet

## WFS

1. Power off
2. Plug new ECU (BCM, ELV, Kessy, ...)
3. KL30 on -> Target Behavior: KL15 on
    - If KL15 stays off: Add CAN IG in CANoe and send 40/50ms CANFD Message from the data base and start at 1.
4. Diagnostics WFS Routine

## General Info

- Busload Max: 75-80%
- KL15 off -> Busruhe (CAN Tranceiver off) -> After ~5min: Deep Sleep
- Wake Up: After 200ms (max 400ms) all ECUs need to be ready to send;
- Wake Up reason: Diag, KL15, Radio, Seat, ...