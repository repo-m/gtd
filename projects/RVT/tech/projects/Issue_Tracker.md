# Issue Tracker

## eHSB

- Output signal was not set after vehicle speed exceeded 30 km/h.  
  - **Root cause:** Incorrect signal routing during system integration.  
  - **Solution:** Corrected the routing configuration and revalidated the integration.

- Interior light and instrument cluster flickering.  
  - **Root cause:** Unintended toggling of eHSB outputs caused by a software defect.  
  - **Solution:** Identified the faulty logic and implemented a software fix.

- Unexpected eFuse toggling events.  
  - **Root cause:** Incorrect internal current measurement values in the software.  
  - **Solution:** Updated the software to correct current measurement handling.

## Siren

- False alarms occurring in some vehicles.  
  - **Root cause:** Missing LIN wake-up frames from the master ECU.  
  - **Solution:** Implemented a software update on the master side to ensure proper wake-up signaling.

- Sporadic false alarms across different vehicle variants.  
  - **Root cause:** Inconsistent timing between heartbeat messages.  
  - **Solution:** Made the siren software more robust against heartbeat timing variations.

- Quality issues detected during hardware laboratory testing.  
  - **Root cause:** Severe soldering process issues in the manufacturing process.  
  - **Solution:** Planned and executed on-site process reviews with the supplier.

- The 1-second reaction requirement was not fulfilled.  
  - **Root cause:** No timer was implemented in the siren software; the alarm was triggered only after two consecutive missing heartbeats.  
  - **Solution:** Implemented a timer that resets on each received heartbeat; if no heartbeat is received within 1 second, the alarm is triggered.

## SwArchBCM

- Integration Build crashes
  - **Root Cause:** "Dangling References" caused by version mismatches, where Supplier SWC-ARXMLs contained `*_TREF` paths pointing to Interface UUIDs that did not exist in the Master Baseline.
  - **Solution:** Python ARXML Validator enforce referential integrity against the Master Dictionary -> before build

## IMMO

- "Anti-Scanning" security counter reset to zero after battery disconnect
  - **Root Cause:** Defective Test Mock. The Unit Tests mocked the NVM (Non-Volatile Memory) as instantaneous RAM variables. This masked a bug where the "Failure Counter" (used to block brute-force attacks) was not being successfully written to the EEPROM before the ECU went to sleep.
  - **Solution:** Updated the TPT test environment to use a "Stateful Mock" that simulates real NVM write latency and persistence, and added a specific "Power Interruption" test case to verify the counter is saved before shutdown.

#list