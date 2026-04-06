# Software Factory

- Development & Build -> Create Signed Binaries
    - GitLab (Source Code & Build Logic)
    - GitLab -> #Docker -> Bazel -> Toolchain -> Cloud HSM (Signing)
- Artifact Management -> Store Immutable Deliverables
    - Artifactory (Signed ECU Binaries & Orchestrator Docker Images)
- SIL (Software-in-the-Loop) -> Validate Application Logic at Scale
    - Artifactory (Debug/x86 Binaries)
    - GitLab Runner -> Artifactory -> Virtual ECU (x86) -> Simulation Environment
- HIL (Hardware-in-the-Loop) -> Validate Hardware-Software Interaction
    - Artifactory (Production ARM/TriCore Binaries)
    - GitLab Runner -> Artifactory -> HIL Controller -> Flash Tool (UDS) -> Lab-based ECU/Rig -> Simulated I/O
- Infra Provisioning -> Setup Cloud Resources
    - Terraform (Infrastructure as Code)
    - Terraform -> Cloud Provider (AWS/Azure/GCP) -> K8s Cluster, MQTT Broker, Databases
- Cloud Deployment -> Run the OTA Service
    - ArgoCD (Current Cloud State)
    - GitLab -> ArgoCD -> Helm -> Kubernetes (OTA Orchestrator Pods)
- OTA Orchestration -> Campaign Management
    - OTA Database (Vehicle Inventory & VIN-to-Version mapping)
    - Orchestrator -> Pulls Binary Metadata from Artifactory -> Triggers MQTT Command
- Vehicle Execution -> Securely Update Hardware
    - Vehicle HSM (Trust Root for Public Keys)
    - Gateway (MQTT) -> Flash Manager -> Vehicle HSM (Verification) -> UDS -> Target ECU
- Observability -> Monitor Fleet Health
    - ELK Stack / Grafana (Log & Metric Aggregation)
    - ECU Feedback -> Gateway -> MQTT -> Cloud Monitoring

---

## System Sequence

```mermaid
sequenceDiagram
    box "Corporate Cloud (Private VPC / Data Center)" #f9f9f9
        participant GL as GitLab (Code SSoT)
        participant TF as Terraform (Infra SSoT)
        participant HSM_C as Cloud HSM (Signer)
        participant ART as Artifactory (Artifact SSoT)
        participant SIL as SIL (Cloud Runner x86)
    end

    box "Local Lab (On-Premises)" #e1f5fe
        participant HIL as HIL (Lab Runner & Physical Rack)
    end

    box "OTA Production Cloud (Global VPC)" #fff9c4
        participant ARGO as ArgoCD (State SSoT)
        participant OTA as OTA Orchestrator (K8s)
        participant DB as OTA Database (Inventory SSoT)
        participant MON as ELK/Grafana (Observability)
    end

    box "The Vehicle" #f1f8e9
        participant VEH as Gateway / HSM / ECU
    end

    Note over GL, ART: Phase 1: Infra & Build
    GL->>TF: Run Terraform Scripts
    TF->>ARGO: Provision K8s/MQTT/DB Clusters
    GL->>GL: Bazel Build (Docker)
    GL->>HSM_C: Sign Binary Hash
    HSM_C-->>GL: Digital Signature
    GL->>ART: Push Signed Binaries & Docker Images

    Note over GL, SIL: Phase 2: Virtual Validation
    GL->>SIL: Trigger SIL Pipeline
    SIL->>ART: Pull Debug/x86 Binary
    SIL->>SIL: Run Simulation (Virtual ECU)

    Note over GL, HIL: Phase 3: Physical Validation
    GL->>HIL: Trigger HIL Pipeline
    HIL->>ART: Pull Signed Target Binary
    HIL->>HIL: Flash via UDS & Run Test Case
    HIL-->>HIL: Physical I/O Feedback

    Note over ARGO, OTA: Phase 4: Cloud Deployment
    ARGO->>OTA: Sync Helm Charts to K8s Pods

    Note over OTA, VEH: Phase 5: OTA Campaign
    OTA->>DB: Check VIN Version Requirements
    OTA->>ART: Pull Binary Metadata
    OTA->>VEH: Trigger Update (MQTT)
    VEH->>ART: Download Signed Binary
    VEH->>VEH: Verify Signature (Vehicle HSM)
    VEH->>VEH: Flash Target ECU (UDS)

    Note over VEH, MON: Phase 6: Observability
    VEH->>MON: Send Logs/Status (Feedback Loop)
    MON->>OTA: Update Campaign Progress
```