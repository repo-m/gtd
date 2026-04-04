# GDB + OpenOCD Debugging Manual

## 1. Hardware Setup
```
PC (USB)
   ↓
[Probe: J-Link, ST-Link, MiniWiggler]
   ↓
ECU (JTAG/DAP header)
```

## 2. Start OpenOCD
Example for J-Link:
```bash
openocd -f interface/jlink.cfg -f target/aurix.cfg
```
This launches:
- Port **3333** → GDB interface  
- Port **4444** → OpenOCD telnet console  

## 3. Connect with GDB
```bash
arm-none-eabi-gdb main.elf
(gdb) target remote localhost:3333
(gdb) monitor reset halt
```

## 4. Configure JTAG Interface
```bash
(gdb) monitor adapter_khz 1000   # set JTAG frequency
(gdb) monitor jtag_ntrst_delay 200
```

## 5. Load and Run

```bash
(gdb) load          # flash the program
(gdb) break main    # set breakpoint
(gdb) run           # start execution
(gdb) next          # step to next line
(gdb) print var     # inspect variable
(gdb) continue      # resume program
```

## 6. Exit
```bash
(gdb) detach
(gdb) quit
```

## Action & commands

Updated cheat sheet—focused on **commonly used embedded** GDB commands (omitting rarer ones like `record/replay`, `set args`).
I also folded in conditions, enabling/disabling, registers, types, and TUI.

| Action             | Command                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Breakpoint         | `break main` · `break file.c:42` · `delete N` · `enable N` · `disable N` · `cond N EXPR` |
| Run / continue     | `start` · `run` · `continue`                                                             |
| Step               | `next` (over) · `step` (into) · `finish` (out) · `nexti` / `stepi` (instructions)        |
| Run to location    | `until` · `until 46` · `until file.c:46` · `until +5`                                    |
| Inspect vars       | `print x` · `set var x=123` · `info locals` · `info args` · `display x` · `undisplay`    |
| Types              | `ptype x`                                                                                |
| Watchpoints        | `watch expr` · `rwatch expr` · `awatch expr`                                             |
| Backtrace / frames | `bt` · `bt full` · `frame 0` · `up` · `down`                                             |
| Memory             | `x/16xb &buf` · `x/8xw addr`                                                             |
| Registers          | `info registers`                                                                         |
| Disassembly        | `disassemble /m <func>`                                                                |
| TUI (visual)       | `layout src` · `layout asm` · `layout regs` · `tui enable/disable`                    |
| Misc               | `info break` · `quit`                                                                    |

- Use watchpoints to catch “who wrote this?” bugs and sporadic corruptions; use breakpoints for control-flow debugging at specific lines.
- x/<count><format><size> [address]

---

📘 **Notes**

- Replace `jlink.cfg` and `aurix.cfg` with your probe/target configuration.  
- Always connect GND and VREF lines between probe and ECU.  
- For Infineon TC397, prefer **PLS UAD3+** or **Lauterbach TRACE32** instead of OpenOCD.
