# #ICD - Interface Control Documents

- GEM PURS NEeD

## Mechanical GEM

- G - Geometry
  - Grande Design: The shape and fit - **Geometry & Integration**
    - 3D Space claims
    - **mounting points**
    - **bolt torque**
    - **connector orientation**
    - **tool clearance**
- E - Environment
  - Elements: Weather and water-proofing - **Environmental & Protection**
    - IP Ratings (IP67/6K9K) - ingress protection (IP Rating: IP XY (e.g. IP65); X = 5 Dust Protected, X=6 Dust Tight; Y=5 Protected against jets of water, Y=7,8 Protected against the effects of immersion in water)
    - **vibration profiles**
    - thermal dissipation paths
    - **pressure venting**
- M - Material 
  - Metal & Muscle: What it's made of and its strength - **Material & Safety**
    - Housing material
    - **flammability (UL94)**
    - mass/weight targets
    - **Center of Gravity (CoG)**
    - **keep-out zones (for e.g. airflow, tool access during assembly, collision deformation)**

## Electrical PURS

- P - Plugs
  - Plugs: The actual hardware interface - **Physical Connection** 
    - **Connector Specs, Keying & Coding: Poka-yoke**
    - pinout maps
    - **terminal plating (Gold/Tin)**
    - **wire gauge specs ($mm^2$)**
- U - Utilities
  - Utilities - Power distribution and grounding - **Under-Voltage & Power**
    - Load Profiles: power consumption
      - Operating Voltage Range
      - Current Consumption
    - Grounding Strategy (Signal vs. Chassis).
    - Fuse/Circuit Protection
- **R - Reliability VW80000**
  - Risk/Failure Modes: How it handles breaks and shorts - **Reliability & Safety**
    - Short-to-Battery/Ground Resistance
    - Open Circuit Detection: Pull-up, Pull-down resistor values
    - ESD limits
- **S - Signal Integrity & EMC**
  - Smog/EMC: Keeping the electronic "air" clean of noise - **Signal Integrity & EMC**
    - Asphalt: Differential impedance ($120\Omega$)
      - LIN: Not strictly controlled
      - CAN: $120\Omega$: The "width of the lane" must be constant.
      - $100\Omega$: High frequency requires very tight control of the twist.
    - Sand-filled "runaway truck ramp": Termination Resistors
      - LIN: Master Pull-up: $1k\Omega$
      - CAN: $120\Omega$ at both ends: Only the two most distant ECUs have resistors.
      - $100\Omega$ (internal): Usually built into the PHY (chip) of both the Switch and the ECU.
    - Sound-barrier wall: Shielding Reqs - shield termination (360°)

## Software NEeD

- N - Network
  - Network : The roads the data travels on - **Network & Protocol Layer*
    - Bus Specs. - Bus Topologies, data protocols (CAN, Ethernet)
    - Baud Rate / Bandwidth
      - CAN - Bus load
      - Ethernet - RX/TX Bit Rate - 100Base-T1 (100Mbps) -> 50Mps => 50% bus load
      - LIN - Check schedule time against spec -> if higher -> Bus load too much
    - Node ID / MAC Adress
    - Reference to DBC/ARXML
- E - Encyclopedia
  - Encyclopedia - The Data Dictionary and signal meanings - **E2E & Definitions**
    - Message Catalog (DBC/ARXML), message IDs, boundary conditions
    - Cycle Times (Periodicity): Cycle Times, bit rates, Timing & Latency Constraints
    - Signal Packing (bits/bytes)
    - Scaling & Offset
- D - Duty & Defense: 
  - Duty & Defense: #Cybersecurity , #FuSa and speed - **Defense & Performance**
    - **Latency budgets**
    - E2E #FuSa
    - Safe State definitions #FuSa
    - #SecOC #Cybersecurity
    - Diagnostic Services

#ICD