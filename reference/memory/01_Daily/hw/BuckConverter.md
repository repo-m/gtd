# #BuckConverter / Step Down 

![Circuit](hw/BuckConverter.png)

- Circuit: Buck Converter (Step-Down), Inductor + MOSFET + Diode + Cap, Efficiency Power Conversion: Converts 12V/24V battery voltage to 5V or 3.3V with minimal heat, essential for powering the TC397.
- Calculation: $V_{out} = V_{in} \times \text{Duty Cycle}$ , where the Duty Cycle represents the percentage of time the MOSFET is closed.
- Control: PWM (Pulse Width Modulation) determines the "On" and "Off" timing of the MOSFET to reach the target voltage.
- Filtering/Buffering: The output capacitor smooths the resulting voltage ripples and provides instant current "gulps" for the MCU cores.
- Efficiency: Uses switching logic to achieve >90% efficiency, preventing the high heat generation of linear regulators.

![Mode, Current, Voltag](hw/BuckConverter_I_U.png)

## Switch ON Mode

![Circuit ON Mode](hw/BuckConverter_On.png)

- Switch ON Mode: MOSFET closes, current flows from  through the inductor to the load.
- Energy Storage (ON): The inductor builds a magnetic field and resists sudden current jumps, gradually "charging" up.

## Switch OFF Mode

![Circuit OFF Mode](hw/BuckConverter_Off.png)

- Switch OFF Mode: MOSFET opens, disconnecting  and causing the inductor's magnetic field to collapse.
- Freewheeling (OFF): The collapsing field induces voltage that forward-biases the diode, completing a loop from Ground to the load.
- Inductor Discharge (OFF): The inductor acts as the primary power source for the MCU during the "Off" phase.