# #InterChip Communication Protocols

## #SPI (Serial Peripheral Interface)

- **Connection**
    - Single-master / multi-slave
    - 4 wires: SCK (Clock), MOSI (Data Out), MISO (Data In), CS/SS (Chip Select)
    - Push-pull signaling (faster than I2C)
- **Output**
    - Very high speed: 10 Mbit/s to 50+ Mbit/s
    - Payload: Continuous stream, no fixed length
- **Role**
    - High-speed board-level tasks: External Flash, Displays, ADCs, MCU-to-MCU
    - Full-duplex but requires more pins (dedicated CS for every slave)
- **Encapsulation**: No fixed header; data is shifted in/out as long as CS is LOW.

## #I2C (Inter-Integrated Circuit)

- **Connection**
    - Multi-master / multi-slave
    - 2 wires: SDA (Data) and SCL (Clock)
    - Open-drain bus with pull-up resistors
- **Output**
    - Standard: 100 kbit/s, Fast: 400 kbit/s, High Speed: 3.4 Mbit/s
    - Payload: Address-based (7-bit or 10-bit), data is byte-oriented
- **Role**
    - Low-speed board-level sensors (Temp, Gyro), EEPROMs, I/O expanders
    - Simple wiring but higher latency due to addressing and half-duplex
- **Encapsulation**: Start — Address + R/W — ACK — Data — ACK — Stop

## #UART (Universal Asynchronous Receiver-Transmitter)

- **Connection**
    - Point-to-point (one-to-one)
    - 2 wires: TX (Transmit) and RX (Receive)
    - Asynchronous (no shared clock wire; both sides must agree on baud rate)
- **Output**
    - Range: 9.6 kbit/s to 115.2 kbit/s (Standard), can reach several Mbit/s
    - Payload: Character-based (typically 8-bit data frames)
- **Role**
    - Debug console logging (connecting ECU to PC), GPS modules, Bluetooth
    - Low-cost, but lacks hardware addressing and sensitive to clock drift
- **Encapsulation**: Start Bit — Data (5-9 bits) — Parity Bit (Optional) — Stop Bit

## #SENT (Single Edge Nibble Transmission - SAE J2716)

- **Connection**
    - Point-to-point, unidirectional (Sensor to ECU)
    - 3 wires: Signal (Digital), 5V Power, GND
    - Measures time between falling edges (Nibbles)
- **Output**
    - Determined by tick time (e.g., 3 µs); low speed but high resolution
    - Payload: 24-bit (six 4-bit nibbles) for sensor data + status/CRC
- **Role**
    - Safety-critical sensors (Throttle position, Mass Air Flow, Pressure)
    - Robust replacement for analog 0-5V signals; high EMC resistance
- **Encapsulation**: Sync Pulse — Status Nibble — 3-6 Data Nibbles — CRC Nibble — Pause