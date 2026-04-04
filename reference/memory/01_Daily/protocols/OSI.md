# #OSI Model

- All: Application (Layer 7) 🌐
- People: Presentation (Layer 6) 🎭
- Seem: Session (Layer 5) 🤝
- To: Transport (Layer 4) 🚛
- Need: Network (Layer 3) 🗺️
- Data: Data Link (Layer 2) 🔗
- Processing: Physical (Layer 1) 🔌

## TCP/IP model

- Application: User-facing protocols and data formatting
- Transport: Host-to-host communication and error control
- Internet: Routing packets across different networks
- Network Access: How data is physically sent over the hardware

## 📮 Sending a Secure Package via Postal Service

- L7 Application: **The Letter Content**: You write "Hello"
- L6 Presentation: **The Translator**: Translates & Seals Envelope 
- L5 Session: **The Secretary**: Files conversation separately
- L4 Transport: **Certified Mail Clerk**: Stamps "Certified" or "Regular" 
- L3 Network: **Sorting Center**: Writes Destination Zip Code
- L2 Data Link: **Local Mail Carrier**: Drives to specific House Number
- L1 Physical: **The Road**: Carries the vehicle

## Internet

### OSI mapping

- L7 Application: HTTP, HTTPS, DNS, SSH, FTP
- L6 Presentation: SSL/ #TLS (Encryption), JPEG, GIF
- L5 Session: NetBIOS, RPC, Sockets (Opening/Closing)
- L4 Transport: #TCP #UDP
- L3 Network: IPv4, IPv6, ICMP (Ping), Routers
- L2 Data Link: #Ethernet , Wi-Fi, MAC Addresses, Switches
- L1 Physical: Cables, Fiber Optics, Radio Waves, Hubs

### TCP/IP model mapping

- Application: HTTP, HTTPS, DNS, SSH, FTP, #TLS , SSH
- Transport: #TCP #UDP
- Internet: IPv4, IPv6, ICMP (Ping)
- Network Access: #Ethernet , Wi-Fi, MAC Addresses

## Automotive Protocols

- L7 Application: #UDS DHCP #SOME/IP #DoIP #XCP HTTPS #MQTT #SFD
- L6 Presentation: #SOME/IP #TLS #SecOC #E2E
- L5 Session: #SOME/IP #TLS
- L4 Transport: #UDP #TCP
- L3 Network: IPv4 IPv6 ICMP
- L2 Data Link: #IVN MACsec VLAN gPTP #ARP (Bridge L3-L2)
- L1 Physical: #IVN #InterChip

## WiFi

- L2 Data Link: 802.11 MAC LLC WPA2 WPA3
- L1 Physical: 802.11 PHY (Radio)

## Bluetooth

- L7 Application: A2DP HFP AVRCP PBAP (Profiles)
- L6 Presentation: GATT GAP
- L5 Session: RFCOMM SDP ATT
- L4 Transport: L2CAP
- L3 Network: BNEP
- L2 Data Link: LMP Baseband
- L1 Physical: Bluetooth Radio (PHY)

## USB-C

- L7 Application: MSC HID CDC UAC UVC
- L6 Presentation: Class Protocols (e.g., SCSI for storage, HID Reports)
- L5 Session: Pipes (Logical Channels)
- L4 Transport: Bulk Isochronous Interrupt Control
- L3 Network: Device Addressing Endpoints Hub Topology
- L2 Data Link: Link Layer Packets CRC Flow Control
- L1 Physical: Type-C Connector CC-Logic USB-PD PHY (Tx/Rx)

#OSI