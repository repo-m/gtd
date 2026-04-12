# Vowel

- USB-to-CAN Adapter needed -> Peak CAN

## Main Use Cases

Vowel is designed for Automotive Software and Validation Engineers. Based on its architecture,
  here are the primary use cases:

  1. Automated ECU Functional Testing
  The most common use case is verifying that an ECU responds correctly to specific inputs.
   * Example: Use Vowel's CAN driver to send a "Brake Pedal Pressed" message and verify (via CAN or
     SSH/ADB) that the "Brake Lights Active" signal or an internal software state changes
     accordingly.
   * Vowel Advantage: You define these messages once in TOML and use them across different test
     scripts.

  2. Infotainment (IVI) & Telematics Validation
  Testing systems that run Linux or Android (like modern dashboards or head units).
   * Example: Use the ADB interface to trigger an app action on the screen, while simultaneously
     using the CAN interface to verify the correct signal was sent to the vehicle bus.
   * Vowel Advantage: It manages the persistent ADB/SSH connection, so you don't waste time
     reconnecting for every test step.

  3. Diagnostic Testing (UDS over ISO-TP)
  Performing low-level diagnostics, firmware updates, or configuration reads.
   * Example: Sending a "Read Data By Identifier" request to an ECU and parsing the multi-frame
     ISO-TP response.
   * Vowel Advantage: Vowel handles the complexities of ISO-TP (fragmentation, flow control)
     natively through Linux SocketCAN.

  4. Bench Control & Hardware-in-the-Loop (HIL)
  Orchestrating a complex test bench where you need to talk to multiple devices at once.
   * Example: A test where you SSH into a power supply to turn on the ECU, then use CAN to send
     signals, and finally use NATS to stream telemetry data to a cloud dashboard.
   * Vowel Advantage: The "Device" configuration model allows you to define a whole test
     environment as a single setup.

  5. Gateway & Protocol Translation Testing
  Verifying that a gateway ECU correctly translates signals between different buses.
   * Example: Send a LIN message on one interface and verify that the corresponding CAN message
     appears on another.
   * Vowel Advantage: You can run multiple instances (CAN, LIN, etc.) in parallel within the same
     pytest script.

  6. "Hardware-Less" Software Development
  Developing test logic before the physical ECU or hardware is available.
   * Example: Writing your entire test suite using vcan (Virtual CAN) and v-sllin (Virtual LIN).
     When the real hardware arrives, you only change the interface name in your TOML config.
   * Vowel Advantage: Decouples test logic from hardware availability.

  7. Regression Testing in CI/CD
  Running tests automatically every time code is committed.
   * Example: Integrating Vowel into a GitLab or Jenkins pipeline that runs on a "HIL Rack" (a
     server connected to real ECUs).
   * Vowel Advantage: Its strict pytest integration makes it "plug-and-play" for modern DevOps
     workflows.

## Manual CAN @ BeagleBone

This test uses the Vowel CLI and an included example configuration to broadcast cyclic CAN messages on a virtual interface.

Prerequisites: Make sure the can-utils package is installed on your BeagleBone:

```bash
    sudo apt update && sudo apt install can-utils
```

### Terminal 1: Setup Interface & Monitor

In the first terminal, we will create the virtual CAN interface and start listening to it.

1. Load the virtual CAN module:

```bash
    sudo modprobe vcan
```

2. Create and activate the interface: Note: The Vowel powertrain example expects an interface named vcan_01.

```bash
    sudo ip link add dev vcan_01 type vcan
    sudo ip link set up vcan_01
```

3. Start monitoring the bus:

```bash
    candump vcan_01
```

*Leave this terminal running. It will wait silently for traffic.*


### Terminal 2: Run Vowel

In the second terminal, we will use Vowel to inject traffic.

1. Navigate to the vowel workspace:

```bash
cd /home/m/m/gtd/projects/vowel
```

2. Start the Vowel CAN driver: Use the built-in CLI to run the powertrain example configuration and set the bus state to standby.

```bash
    vowel can --interface examples/config/interfaces/can__powertrain.toml --state standby
```

3. Observe the Result: Look back at Terminal 1. You will immediately see a flood of CAN frames (like EngineStatus, FuelLevel, etc.) being broadcast cyclically based on the TOML configuration. Vowel is efficiently handling the cyclic timing via the Linux kernel's BCM (Broadcast Manager).

*Press Ctrl+C in Terminal 2 to stop the Vowel driver when finished.*

## Manual LIN @BeagleBone

This test binds the sllin driver to a native BeagleBone UART to act as a local LIN bus loopback. We will then run the built-in Vowel LIN test sequence.

Prerequisites: Make sure you have cloned the linux-lin repository into your vowel workspace and have the util-linux package installed (which provides ldattach).


### Terminal 1: Setup Interface & Monitor

We must compile and load the sllin kernel module, attach it to a UART, and monitor it.

1. Build and load the module in Master Mode:

```bash
    cd /home/m/m/gtd/projects/vowel/linux-lin/sllin
    make
    sudo insmod sllin.ko master=1
```

2. Attach the module to a native UART: We dynamically find the line discipline number and attach it to an unused UART (e.g., /dev/ttyS1 or /dev/ttyO1 depending on your BeagleBone's device tree).

```bash
   N_SLLIN=$(sed -n 's/^[n_]*sllin[[:space:]]*\([0-9]*\)$/\1/p' /proc/tty/ldiscs)
   sudo ldattach "$N_SLLIN" /dev/ttyS1 &
```

*(Note: This runs ldattach in the background so you can keep using the terminal).*

3. Bring up the sllin0 interface and monitor it:

```bash
    sudo ip link set sllin0 up
    candump sllin0
```

*Leave this terminal running.*


### Terminal 2: Run Vowel

Because there is no dedicated CLI command for LIN yet, Vowel includes a standalone execution block directly in its LIN module for testing.

1. Navigate to the vowel workspace:

```bash
   1    cd /home/m/m/gtd/projects/vowel
```

2. Execute the LIN module test script:

```bash
    python3 -m vowel.lin.lin
```

This script instantiates the LinInstance driver thread, connects to sllin0, pre-programs a slave response cache entry for ID 0x10, and then transmits a sequence of Master frames (IDs 0x20 and 0x21).

3. Observe the Result: Look at Terminal 1. You will see:
    * A control frame (with the 0x80000000 flag bit set) which is Vowel configuring the cache in the kernel.
    * A burst of standard LIN frames with IDs 0x20 and 0x21 along with their payloads as Vowel executes the test sequence.

## Limitations of Vowel

1. Strictly Linux-Only: This is Vowel's most significant limitation. Its core value proposition (high-performance cyclic CAN/LIN) relies entirely on Linux kernel features:
    * SocketCAN & BCM: The CAN driver uses the Linux Broadcast Manager (BCM) to offload timing to the kernel.
    * sllin module: The LIN driver requires compiling and loading a custom Linux kernel module.
    * Unix IPC: The library heavily uses Unix concepts like PTYs (via pexpect for SSH/ADB) and socketpair IPC.
    * Result: It cannot run natively on Windows or macOS (though macOS might handle SSH/ADB, it cannot handle CAN/LIN without a Linux VM).
2. Hardware Dependency Constraints:
    * You are limited to CAN hardware that has a mainline Linux SocketCAN driver.
    * For LIN, sllin requires native UARTs (e.g., BeagleBone, Raspberry Pi GPIOs); standard USB-to-Serial adapters are not supported due to timing constraints.
3. Narrow Focus: Vowel is highly specialized for Automotive ECU testing (CAN, LIN, ISO-TP, ADB, SSH). It does not attempt to be a general-purpose automation tool or handle protocols like FlexRay, Automotive Ethernet (SOME/IP), or DoIP out of the box.
4. Heavy Pytest Coupling: While the core drivers can be used independently, the library is architecturally designed around pytest fixtures (vowel_pytest). Teams using other test runners (like Robot Framework or standard unittest) will have to write their own integration layers.

## Open-Source Alternatives

Depending on what you need to achieve, here are several open-source alternatives that handle aspects of automotive or hardware testing:

1. Python-CAN (Direct Alternative for Bus Communication)
    * What it is: The standard Python library for CAN bus communication. (Note: Vowel actually uses
     cantools which sits on top of this ecosystem).
    * Pros: Cross-platform (Windows, Linux, macOS). Supports almost every CAN hardware adapter on
     the market directly (Vector, PCAN, Kvaser, IXXAT).
    * Cons: It is a lower-level library. You have to write your own thread management, cyclic message handling (if not using Linux BCM), and test framework integration. It does not handle SSH, ADB, or environment configuration like Vowel does.
2. Robot Framework
    * What it is: A generic, keyword-driven test automation framework.
    * Pros: Excellent for high-level system testing. Highly extensible with thousands of community libraries. Excellent reporting.
    * Cons: Not automotive-specific out of the box. You would still need to integrate underlying libraries (like python-can or even Vowel itself) via custom keywords to talk to hardware.
3. CANoe / CANalyzer (Commercial, but standard context)
    * Note: These are not open-source, but they are the industry standard that tools like Vowel aim to replace or supplement.
    * Why Vowel exists: Vector tools are extremely expensive, Windows-only, and use proprietary scripting languages (CAPL). Vowel is designed to be a lightweight, Linux/Python-native, CI/CD-friendly alternative to these heavy toolchains.
4. Scapy (For Automotive Ethernet / Advanced Protocols)
    * What it is: A powerful Python-based interactive packet manipulation program and library.
    * Pros: Excellent for security testing, fuzzing, and working with Automotive Ethernet (SOME/IP, DoIP) or raw CAN frames.
    * Cons: Steeper learning curve. Less suited for structured, stateful "pass/fail" unit testing of an ECU's functional logic compared to Vowel's state-machine approach.
5. OpenHIL / Various Python HIL Frameworks
    * There are various small, open-source HIL (Hardware-in-the-Loop) frameworks on GitHub built around Python and Raspberry Pi/BeagleBone setups, but few have the unified configuration management (TOML -> Device -> Interface -> Message) that Vowel provides for Automotive use cases.