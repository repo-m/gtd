# #EMI & #EMC - Electromagnetic Interference & Compatibility

- The Players
    - Source (Noisy Neighbor): HV Inverter (PWM switching), ECU clocks, DCDC converters.
    - Victim (Sensitive Sleeper): ADAS sensors, Medical ICDs, Airbag Squibs, CAN Bus.
- Mechanisms and Counter Measures
    - Conductive
        - Shared Path (Impedance)
        - Counter measures: Star Grounding: Individual returns to a single point.
    - Capacitive
        - Electric Field (dV/dt) -> High voltage and high frequency.
        - Counter measures: Shielding: Faraday cage/shielded cables to block E-fields.
    - Inductive
        - Magnetic Field (dI/dt) -> High current and current loops.
        - Counter measures: Twisted Pairs & 10cm Separation: Reduce loop area/distance (1/r2).
    - Radiated
        - EM Waves (Antenna)
        - Counter measures: Metal Enclosures & PCB Ground Planes: Shorten return paths.
- Hardware Mitigation Toolbox
- Counter measures: 
    - Ferrite Beads: Absorbs high-frequency noise on power lines (converts to heat).
    - Common-Mode Chokes: Blocks shared noise on differential pairs (CAN/Ethernet).
    - Decoupling Caps: Local energy reservoirs to prevent noise from traveling down wires.
    - PCB Ground Plane: A solid copper layer that minimizes the "Antenna Effect" by providing the shortest return path.
- Integration & #ICD
    - The Antenna Effect: Long wiring harnesses amplify noise at resonant frequencies.
    Safety Critical #FuSa : EMI can cause "Oversensing" in Medical ICDs (leading to inappropriate shocks) or unintended Airbag deployment.
    - The ICD Law: Enforces separation rules, bonding resistance limits ($< 2.5\text{ m}\Omega$), and cable specs (STP vs. UTP).
