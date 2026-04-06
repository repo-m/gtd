# 2025-04-20 Resistor Types

| Resistor Type           | Material                  | Usage                        | I         | U            | f            | Pack./Form| Cost (€)   | t in °C    |
|:------------------------|:--------------------------|:-----------------------------|:----------|:-------------|:-------------|:----------|:-----------|:-----------|
| **Carbon Film**         | Carbon                    | General electronics          | mA to ~1A | 0.1V – 500V  | DC – ~1 MHz  | Axial     | 0.01 – 0.05| -55 to +155|
| **Metal Film**          | Nickel Chromium           | Precision, low noise         | mA to ~2A | 0.1V – 500V  | DC – ~2 MHz  | Axial     | 0.02 – 0.10| -55 to +155|
| **Wirewound**           | Nichrome wire             | Power, industrial            | 10mA – 10A| 0.1V – 1kV   | DC – ~100 kHz| Axial     | 0.20 – 1.00| -55 to +275|
| **Thermistor (NTC/PTC)**| Metal oxides              | Temp. sensing, protection    | μA – 1A   | 0.1V – 100V  | DC – ~10 kHz | Disc, SMD | 0.05 – 0.50| -40 to +125|
| **Metal Oxide**         | Metal oxide film          | High temp., surge protection | mA – 5A   | 0.1V – 700V  | DC – ~500 kHz| Axial     | 0.05 – 0.20| -55 to +200|
| Thin Film               | Metal on ceramic          | High precision               | μA – 1A   | 0.1V – 500V  | DC – ~2 MHz  | SMD, axial| 0.10 – 0.50| -55 to +155|
| Foil Resistor           | Metal foil                | Ultra precision              | μA – 1A   | 0.1V – 300V  | DC – ~2 MHz  | Axial, SMD| 2.00 – 10.0| -65 to +150|
| Fusible Resistor        | Wirewound + fuse          | Protection + resistance      | 10mA – 3A | 0.1V – 250V  | DC – ~100 kHz| Axial     | 0.20 – 1.00| -55 to +155|
| Non-Inductive           | Wirewound low-inductance  | HF, pulse applications       | mA – 10A  | 0.1V – 1kV   | DC – ~10 MHz | Axial, pwr| 1.00 – 5.00| -55 to +200|
| Shunt Resistor          | Manganin, alloy           | Current measurement          | mA – 100A | 0.001V – 100V| DC – ~1 MHz  | SMD, bar  | 0.50 – 3.00| -55 to +170|
| Chip Resistor Array     | Thick/Thin film           | Space-saving electronics     | μA – 0.5A | 0.1V – 100V  | DC – ~1 MHz  | SMD       | 0.02 – 0.10| -55 to +155|
| **SMD Thick Film**      | Ceramic + resistive paste | Compact electronics          | μA – 0.5A | 0.1V – 200V  | DC – ~1 MHz  | SMD       | 0.01 – 0.05| -55 to +155|
| **Varistor**            | ZnO / metal oxide         | Surge protection             | mA – 5A   | 50V – 1000V  | DC – ~1 MHz  | Disc, SMD | 0.10 – 0.50| -40 to +85 |
| Photoresistor (LDR)     | Cadmium sulfide (CdS)     | Light sensing                | μA – mA   | 0.1V – 100V  | DC only      | Disc, SMD | 0.10 – 0.50| -30 to +75 |
| Cermet                  | Ceramic + metal           | Precision, trimming          | mA – 1A   | 0.1V – 500V  | DC – ~1 MHz  | Axial, SMD| 0.20 – 1.00| -55 to +155|

## Carbon Film (Kohleschichtwiderstand)

- **Production**: Carbon is deposited on a ceramic rod via pyrolysis, then a spiral groove is cut to set resistance.
- **Outside specs**:
  - *Too much current*: Overheats, may burn or drift in value.
  - *Too much voltage*: Can arc or break insulation.
  - *Too high frequency*: Parasitic inductance affects performance.
  - *Too high/low temperature*: Above +155 °C or below –55 °C can cause value drift or cracking.
- **SMD Available?** Rare. Less stable and precise than thick-film SMD types.

## Metal Film (Metallschichtwiderstand)

- **Production**: Thin nickel-chromium film is vacuum-deposited on a ceramic core, spiral-cut for value.
- **Outside specs**:
  - *Too much current/voltage*: May heat, shift value, or fail.
  - *Too high frequency*: More stable than carbon, but still affected by inductance.
  - *Too high/low temperature*: Outside –55 °C to +155 °C can affect precision and tolerance.
- **SMD Available?** Yes. Common in both axial and SMD packages.

## Metal Oxide (Metalloxidwiderstand)

- **Production**: Metal oxide film coated on ceramic, similar to metal film.
- **Outside specs**:
  - *Too much current/voltage*: Can handle surges better, but still fail if exceeded.
  - *Too high frequency*: Moderate stability, not for RF.
  - *Too high/low temperature*: –55 °C to +200 °C range, exceeding it affects resistance stability.
- **SMD Available?** Less common than axial, but possible.

## Wirewound (Drahtwiderstand)

- **Production**: Resistive wire (e.g., Nichrome) wound around a ceramic core.
- **Outside specs**:
  - *Too much current*: Overheats or burns.
  - *Too high frequency*: Inductance becomes dominant — not suitable for RF.
  - *Too high/low temperature*: Beyond –55 °C to +275 °C may affect insulation or wire tension.
- **SMD Available?** Rare. Wire construction is bulky and inductive — not ideal for SMD.

## Thermistor (NTC/PTC) (Thermistor)

- **Production**: Made from metal oxides pressed into discs/beads, sintered at high temp.
- **Outside specs**:
  - *Too much current/voltage*: Self-heating, permanent change, or failure.
  - *Too high frequency*: Reacts slowly — not meant for fast signals.
  - *Too high/low temperature*: Outside –40 °C to +125 °C leads to inaccurate or failed readings.
- **SMD Available?** Yes. Common in compact devices.

## Varistor (Varistor)

- **Production**: Sintered zinc oxide disc with metal electrodes.
- **Outside specs**:
  - *Below voltage*: Acts like an insulator.
  - *Above voltage*: Conducts heavily to clamp surge — may degrade over time.
  - *Too high frequency*: Used mainly for transients, not signal paths.
  - *Too high/low temperature*: Typically operates between –40 °C to +85 °C; extremes shorten life.
- **SMD Available?** Yes. Common in protection circuits.

## SMD Thick Film (Dickschichtwiderstand)

- **Production**: Resistive paste printed on ceramic substrate, then fired.
- **Outside specs**:
  - *Too much current/voltage*: May crack or burn, especially in small sizes.
  - *Too high frequency*: Suitable for MHz, but parasitic effects exist.
  - *Too high/low temperature*: Outside –55 °C to +155 °C affects resistance and durability.
- **SMD Available?** Yes. Most common SMD resistor type.

