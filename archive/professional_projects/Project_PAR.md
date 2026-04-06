# PAR

## IMMO

- **Problem**
  - No structured integration or test organization
  - Unstable regressions and inconsistent validation
  - Failed ASPICE assessment with immediate audit pressure
- **Action**
  - Built and led a 10+ engineer test organization
  - Defined standardized SWE.4–6 processes
  - Introduced automated regression testing
  - Ensured requirements-to-test traceability
  - Mentored the team through targeted technical trainings
- **Result**
  - ASPICE Level 2 achieved
  - Integration quality stabilized
  - Test framework reused in other projects

## SwArchBCM

- **Problem**
  - Frequent, ungoverned ARXML interface changes
  - 30+ involved stakeholders
  - Inconsistent interface definitions
  - Integration failures and late defect discovery
- **Action**
  - Designed a structured change-management framework with clear approval flows
  - Implemented a Python-based ARXML checker for automated interface validation
  - Standardized version-controlled delivery workflows across suppliers and internal teams
- **Result**
  - Stable and traceable ARXML baselines established
  - Integration defects significantly reduced
  - Platform-level collaboration and accountability improved

<div class="page"/>

## eHSB

- **Problem:**
  - Six involved companies across hardware, software, and testing
  - New project with no existing test infrastructure
  - No structured integration process
  - High-current (up to 800 A) ASIL C power distribution system with sporadic resets
  - eFuse malfunctions affecting system stability
- **Action:**
  - Designed a Jira-based Kanban test framework to align all 6 partner organizations.
  - Covered Tier-1, HiL, lab, and vehicle validation levels
  - Commissioned a high-power Component-HIL with sink/source devices for SYS.4/SYS.5 black-box testing.
  - Commissioned a physical Proof of Concept (PoC) vehicle to validate system-level integration.
  - Implemented VDA 450 load-shedding strategies to ensure fail-operational power.
  - Led cross-domain debugging across hardware, software, and vehicle teams
- **Result:**
  - Achieved 100% requirements coverage for all safety-critical ECU clusters.
  - Successfully demonstrated continuous steering power during simulated 800 A faults.
  - ECU behavior stabilized across all integration stages
  - Integration maturity achieved
  - Workflow adopted as a best practice by other parts of the project

## BCM-Atlas

- **Problem**
  - New function on a legacy BCM already at performance limits
  - 30+ dependent components
  - International project with high escalation and unclear ownership
  - Strong market demand from VW of America while the responsible ECU department cancelled the topic due to resource constraints
  - Missing Global-HiLs threatening functional safety #FuSa release
- **Action**
  - Took end-to-end ownership
  - Clarified responsibilities via refined RASIC
  - Aligned OEM and supplier stakeholders
  - Established a clear schedule with identified critical paths and release blockers
  - Synchronized re-testing across teams
  - Defined equivalence criteria to replace Global-HiLs with modified vehicles
- **Result**
  - ECU approval achieved on time
  - Functional safety #FuSa compliance ensured without Global-HiLs
  - Function successfully introduced to the US market

<div class="page"/>

## CPD

- **Problem**
  - Safety related function with ASPICE Level 2 requirements
  - Minimal resources
  - Tight delivery deadlines
- **Action**
  - Executed full ASPICE planning and process setup
  - Coordinated development and integration activities
  - Implemented test automation and coverage tracking
- **Result**
  - Successful vehicle validation
  - Series approval achieved on schedule

---

## 48V Bordnetzspannung

- **Problem**
  - 48V architecture previously cancelled
  - No clear ownership
  - Internal resistance despite increasing system demands
- **Action**
  - Re-evaluated legacy validation and decision data
  - Closed knowledge and validation gaps with suppliers
  - Aligned stakeholders through cross-functional workshops
- **Result**
  - 48V officially reinstated as a strategic topic for future vehicle architectures

<div class="page"/>

## Siren 

- **Problem**
  - Legacy ECUs lacked requirements and test traceability
  - New ECU had to be developed via global sourcing in parallel
  - Risk to series continuity and future scalability
- **Action**
  - Built end-to-end requirements-to-test traceability
  - Coordinated re-approval testing for legacy ECUs
  - Aligned global sourcing, suppliers, and validation activities
- **Result**
  - Series continuity secured
  - New global Tier-1 successfully nominated and project started

---

## Zec-eFuse 

- **Problem**
  - Existing HiL systems unable to validate 50+ eFuses
  - Time constraints
  - Budget limitations
- **Action**
  - Designed a scalable HiL extension concept
  - Defined a suitable test strategy for high eFuse count
  - Aligned resources, responsibilities, and costs cross-functionally
- **Result**
  - Reusable test concepts delivered
  - Foundation for future large-scale automated eFuse testing established

<div class="page"/>

## PaCo

- **Problem**
  - Required a convincing multi-ECU system demo
  - Unfamiliar modeling tool
  - Extreme time pressure
- **Action**
  - Quickly implemented core system logic
  - Aligned system behavior with system and test engineers
  - Focused on stability and demo-critical functionality
- **Result**
  - Successful system demo delivered
  - Directly supported winning the sourcing decision