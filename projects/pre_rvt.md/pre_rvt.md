# Planning PRE_RVT (Prepartion for Assignee Programm at RVT)

- Goal: **Prepare for the 6 months (May-October 2026) assignee program in Irvine at RVT**

## Assignee Program

Role-DEPENDENT learning targets: System Integration & Diagnostics

- 1 Architecture & Process
   - Targeted Competency: Defining and orchestrating CI/CD and vehicle release flows in the E2E process
   - Exemplary Results:
     - Mapped vehicle-integration and CI/CD release steps to RVT delivery milestones and owners
     - Defined readiness criteria and handoffs across vehicle and software integration flows
     - Represented SW/HW interface touchpoints in RVT architecture and workflow tooling
- 2 Development/ Execution
   - Targeted Competency: Executing vehicle integration workflows and operating core build/pipeline steps
   - Exemplary Results:
     - Executed flash, initialization, and diagnostics on vehicles with documented outcomes
     - Operated CI jobs, build runs, and artifact creation to produce flash-ready packages
     - Applied variant and configuration updates across software and vehicle contexts
- 3 Testing
   - Targeted Competency: Assessing integration readiness across CI and vehicle tests
   - Exemplary Results:
     - Checked CI quality gates and verified integration behavior against criteria
     - Confirmed stability in SIL/HIL/vehicle tests with concise readiness summaries
     - Performed signal/contract checks to validate system integration expectations
- 4 Debugging
   - Targeted Competency: Separating and resolving vehicle vs. SW Build pipeline root causes
   - Exemplary Results:
     - Diagnosed vehicle integration issues and SW/HW mismatches with clear RCA notes
     - Analyzed build/pipeline breakages, coordinated fixes, and restored delivery flow
     - Resolved config, merge, and cross-platform conflicts with tracked corrective actions
- 5 Process Compliance
   - Targeted Competency: Ensuring traceable, compliant releases across SW and vehicle flows
   - Exemplary Results:
     - Applied release governance with version alignment and change control recorded
     - Maintained traceability from build to vehicle flash with audit-ready logs
     - Completed release checklists and attached compliance confirmations to gates 
- A Skills requested by Team lead as preparation for the training
  - Reading documentation: current vehicle networks
  - Master Tooling: Vector CANlyzer, CANape, Wireshark
  - Master Topics: UDS, Automotive Ethernet

## Shallow-to-Deep Metric

| Category | Task Type | Value | Reasoning | What to Master | What to Produce |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **1 Architecture & Process** | Deep | 5 | Requires high-level mental modeling of E2E systems; difficult for a novice to orchestrate complex SW/HW dependencies. | System thinking and E2E dependency mapping. | Optimized CI/CD architecture diagrams and integration blueprints. |
| **2 Development / Execution** | Shallow | 2 | Primarily procedural/operational; following documented pipeline steps can be taught to a generalist relatively quickly. | Automation of repetitive pipeline triggers. | Standardized flash-ready packages and build logs. |
| **3 Testing** | Shallow | 2 | Focused on verification against existing criteria; checking quality gates is often a binary, repeatable process. | Statistical analysis of test regressions. | Integration readiness summaries and pass/fail reports. |
| **4 Debugging** | Deep | 4 | Demands specialized RCA skills to distinguish between SW and HW failure modes; requires deep domain experience. | Advanced diagnostic tooling and log forensics. | Root Cause Analysis (RCA) reports and corrective action plans. |
| **5 Process Compliance** | Shallow | 1 | Logistical and administrative; involves filling checklists and ensuring audit trails, which is easily replicable. | Efficient record-keeping workflows. | Audit-ready logs and completed release checklists. |
| **A Team Lead Prep Skills** | Deep | 4 | Mastering UDS/Eth and complex tooling requires deep cognitive focus and specialized domain knowledge to apply in varied contexts. | UDS protocols, Automotive Ethernet stacks, and Vector/Wireshark expert features. | Technical protocol analysis and configured workspace environments for diagnostics. |

## Plan

- **Focus:** 100% on **Category A** (Prerequisites) and **Category 4** (Debugging).
- **Strategy:** Categorize the one-month sprint as "Deep Learning." Use Category 1 only for context to understand *why* the tools matter.

| Week | Focus Area | Deep Work Activity |
| :--- | :--- | :--- |
| **1** | **Network Fundamentals** | Master **UDS (ISO 14229)** and **Automotive Ethernet** (Someip, DoIP). Focus on frame structures and session control. |
| **2** | **Tooling Proficiency** | Hands-on with **CANlyzer/CANape**. Build custom panels or configurations. Use **Wireshark** to decode Automotive Eth traffic. |
| **3** | **Practical Debugging** | Apply tools to **Category 4**. Practice log forensics. Learn to identify "normal" vs. "faulty" signal patterns in traces. |
| **4** | **Architecture Synthesis** | Review **Category 1**. Map how the tools and protocols you learned facilitate the E2E release and integration flow. |

---

### Efficiency Tactics
- **The "Feynman" Check:** For UDS and Ethernet, explain the handshake/protocol flow to yourself without notes. If you can't, you haven't mastered it.
- **Environment Prep:** Ensure your Vector and Wireshark environments (databases, DBC files, ARXML) are configured *before* the deep work session to avoid shallow "setup" distractions.
- **Triage:** If time runs short, prioritize **UDS** over Ethernet, as it is the foundation for almost all vehicle diagnostics and flash routines.

## Weekly Detailed Plan (Refined for HW/Tooling Access)

*4 hours deep work + 4 hours shallow work*

- **CW14** (Out of Office - No HW/Vector Tools)
  - Deep Work:
    - Learning: Theoretical Mastery of **ISO 14229 (UDS)**. Focus on SIDs ($10, $27, $22, $2E, $19) and the NRC (Negative Response Code) logic. 
    - Output: A decision-tree diagram of the UDS Security Access ($27) and Diagnostic Session ($10) state machines.
  - Shallow Work: Study "current vehicle networks" documentation. Request Vector licenses/installations from IT now to ensure readiness for CW15.
- **CW15** (HW Access from 15.2 / IT Installation Phase)
  - Deep Work:
    - Learning: **Automotive Ethernet** protocols (DoIP and SOME/IP). Focus on the DoIP header structure and the "Vehicle Announcement" flow.
    - Output: A Wireshark filter library file (`.txt`) with pre-saved expressions for UDS-over-IP and SOME/IP service discovery.
  - Shallow Work: Monitor IT installation of CANalyzer/CANape. First "Mule" walkaround: locate OBD-II/Ethernet ports and verify physical connection integrity.
- **CW16** (Full HW & Tooling Access)
  - Deep Work:
    - Learning: Hands-on Tooling. Connect to the test bench/mule. Run active diagnostic scans. Practice flashing a dummy module if possible.
    - Output: A "First-Connect" Guide documenting the specific workspace settings, database (DBC/ARXML) loads, and hardware channel mapping for the mule.
  - Shallow Work: Capturing raw logs from the vehicle during various states (Ignition ON, Sleep, Crank) to build a baseline for future debugging.
- **CW17** (Synthesis & Debugging Focus)
  - Deep Work:
    - Learning: **Category 4 (Debugging)**. Induce simple faults (unplug a sensor/fuse) and trace the resulting UDS DTCs and Ethernet dropouts.
    - Output: Three "RCA Case Studies" documenting a fault, the trace evidence in Vector tools, and the resolved state.
  - Shallow Work: Final wrap-up of the prep-file; ensure all logs and workspaces are backed up to a portable drive for Irvine.

## Weekly Log

- 2026-04-01: Create initial plan and start preparation;
