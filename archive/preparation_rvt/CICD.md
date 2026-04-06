# End-to-End Automotive CI/CD

- System Definition: CI/CD is a quality system, not just automation.
- Determinism: Same inputs → same outputs; prevents "works on my machine" issues.
- Development Strategy
    - Trunk-Based Development: Relies on short-lived branches, frequent merges, and early conflict resolution.
    - Branch Management: Avoid long-lived branches; if necessary, isolate and rebase frequently.
- #Cybersecurity
    - Integrity: Artifact signing (PKI/KMS/HSM).
    - Traceability: SBOMs and build provenance.
    - Diamond Dependencies: Strategy for handling version conflicts in shared dependencies (monorepo).
    - Caching Strategy: Optimize build times using remote caching in addition to local caching.
- Metrics
    - Build Success Rate: Successful builds / Total builds.
    - Defect Escape Rate: Post-release defects / Total defects.
    - Test Metrics:
        - Code Coverage: (Covered code / Total code) × 100.
        - Requirement Coverage: Extent of requirements verified by tests.
    - Test Coverage: Scope of testing applied to the codebase.
    - Regression Rate: (Regressed tests / Previously passing tests) × 100

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GL as GitLab (CI/CD / Registry)
    participant B as Docker Image [Bazel (Build System)]
    participant vECU as Virtual Target (SiL)
    participant HiL as Hardware Rig (HiL)
    participant OTA as OTA Manager (Cloud)
    participant Car as Mule Vehicle

    Dev->>GL: git push (commit)
    
    Note over GL, B: Step 0: Environment Prep
    GL->>GL: Pull Build Image (bazel-toolchain:latest)

    Note over GL, B: Step 1: Containerized Build
    GL->>B: Trigger: bazel build //...
    B-->>GL: Fetch/Update Remote Cache
    GL->>B: Trigger: bazel test //sw/...
    
    Note over GL, B: Promotion Gate 1 (Build Green)

    Note over GL, B: Step 2: Artifact/Image Storage
    GL->>B: bazel run //tools:package_ecu_image
    B->>GL: Push vECU Docker Image (commit-sha)
    
    GL->>vECU: Deploy Image from Registry
    GL->>vECU: Run functional sim (bazel test)
    vECU-->>GL: JUnit/XML Results

    alt If Sim Fails
        GL->>Dev: Notify Failure
    else If Sim Passes
        Note over GL, vECU: Promotion Gate 2 (Functional)
        GL->>HiL: Trigger On-Prem Runner
        HiL->>HiL: bazel run //tools:flasher (Real ECU)
        HiL->>HiL: Regression Test (CAN/Bus)
        HiL-->>GL: RC Status
    end

    Note over GL, HiL: Promotion Gate 3 (Hardware Verified)
    GL->>OTA: Upload Signed Release Bundle
    OTA->>Car: Wireless Delta Flash
    Car-->>OTA: Version Ack
```