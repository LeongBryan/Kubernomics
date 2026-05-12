# Kubernomics

Kubernomics is a simulation-first Kubernetes cluster repacking and defragmentation tool.

It helps platform teams understand whether their clusters can be safely compacted, which workloads prevent scale-down, and how much money could be saved — without mutating anything.

Kubernomics is cloud-neutral internally, but provider-aware at the UX/import layer. Provider SKUs are normalized into generic node shapes before simulation.

---

## The Problem

Kubernetes scheduling is admission-time. The scheduler places pods when they first land, and does not continuously re-optimize existing placements.

Over time, workloads accumulate across nodes in a fragmented pattern. Cluster Autoscaler scale-down often fails because nodes are never fully empty. Fragmentation is the silent reason autoscaling does not fully deliver on its cost promise.

Safe repacking is the missing operational workflow.

## What Kubernomics Answers

- Can this cluster be compacted?
- Which nodes are reclaimable?
- Which workloads prevent scale-down?
- What blockers prevent repacking?
- How much money could be saved?
- What would be disrupted if we repacked?
- What constraints are actually causing fragmentation?

## What Kubernomics Is

- **Simulation-first.** Experiments run against a snapshot. Nothing is mutated.
- **Deterministic.** Same input always produces the same output.
- **Explainable.** Every scheduling decision is traceable. Every blocker is named.
- **Disruption-aware.** PDBs, anti-affinity, topology constraints, and storage mobility are surfaced as blockers, not ignored.
- **Operator-native.** Designed for platform engineers, not black-box ML.
- **Safe by default.** Read-only. No kubectl mutations. No live cluster access from the browser.

## What Kubernomics Is Not

- Not a Kubernetes scheduler replacement
- Not an AI autoscaler
- Not a live mutating controller (at least not initially)
- Not a black-box optimizer

---

## Current Status

The MVP is working. It proves the core simulation and visualization loop:

- Scenario schema defined
- Pure deterministic simulator (`FILTER → SCORE → BIND`)
- Spread and Bin-pack strategies
- DaemonSet tax visualization
- System reserved capacity visualization
- Workload health and pending pod analysis
- Cost breakdown by node pool
- Scenario variants and comparison
- YAML import / export
- Cluster snapshot JSON import
- Read-only kubectl snapshot CLI

The baseline scenario is loaded from an anonymized sample cluster. Variants can be created, edited, and compared against the baseline.

---

## Intended Workflow

### Step 1 — Capture cluster state

Read-only CLI:

```bash
kubernomics snapshot > cluster-snapshot.json
```

### Step 2 — Import into the UI

The UI imports `cluster-snapshot.json` and creates a locked baseline scenario:

```text
cluster-snapshot.json
  → import
  → baseline scenario
  → simulation
  → visual allocation view
```

The UI does not call kubectl directly. Cluster credentials stay outside the browser.

### Step 3 — Run experiments

- Switch between Spread and Bin-pack
- Change node pool shape or count
- Simulate autoscale-to-fit
- Alter workload requests
- Inspect system and DaemonSet tax

### Step 4 — Generate recommendations _(planned)_

The Repack Advisor identifies:

- Reclaimable nodes
- Fragmented node pools
- Workloads blocking compaction
- PDB blockers
- Anti-affinity blockers
- Topology spread blockers
- PVC and local storage blockers
- Over-requested workloads
- Estimated savings
- Disruption preview

### Step 5 — Receive explainable output _(planned)_

```text
Node pool backend could potentially reclaim 3 nodes.

Blockers:
- payments-api has required pod anti-affinity on kubernetes.io/hostname
- checkout-api PDB allows 0 disruptions
- redis-cache uses local persistent storage

Estimated savings: $420/month

Suggested investigations:
- Review payments-api anti-affinity
- Review checkout-api PDB
- Verify redis-cache mobility
```

### Storage Mobility Signals

The advisor uses **storage mobility** as a drain-safety signal: can a workload be evicted from its current node and restart elsewhere while still reaching the storage it depends on?

Storage findings are not all equal:

- **PVC present** means the workload uses a PersistentVolumeClaim. This is an investigation item, not automatically a blocker. Many cloud-backed PVCs can move, but movement can still be constrained by volume access mode, zone, attachment state, and StorageClass behavior.
- **Azure File / RWX PVC** is usually movable across nodes.
- **Azure Disk / RWO PVC** is usually movable, but only one node can attach it at a time and it may be zone-constrained.
- **hostPath** means the pod mounts a path from the node filesystem. This is a stronger node-bound risk because the data or path may not exist on another node.
- **local storage / local PV** is also node-bound unless the platform has explicit migration or recreation logic.
- **Platform DaemonSet hostPath mounts** such as CSI drivers, log agents, kube-proxy, and networking agents are expected infrastructure behavior. They should be visible in analysis, but they should not be treated like application drain blockers for pool reclaim decisions.

In other words, storage mobility does not mean "this pool cannot be optimized." It means "before deleting or draining nodes, verify that affected workloads can restart on target nodes with their required storage attached."

---

## Architecture

Kubernomics is layered. Each layer has a single purpose and a clean boundary.

```text
                  ┌─────────────────────┐
                  │   kubernomics CLI   │
                  │   kubectl wrappers  │
                  └──────────┬──────────┘
                             │
                   cluster-snapshot.json
                             │
                  ┌──────────▼──────────┐
                  │  Snapshot Importer  │  normalizes → Scenario
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │   Scenario Schema   │  stable contract
                  └──────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
   ┌──────────▼──────┐  ┌───▼────┐  ┌─────▼────────┐
   │ Simulation      │  │  UI    │  │ Repack Advisor│
   │ Engine          │  │        │  │ rule-based    │
   │ FILTER→SCORE    │  │ React  │  │ rule-based    │
   │ →BIND           │  │ Zustand│  │ explainable   │
   └─────────────────┘  └────────┘  └──────────────┘
```

### Layer 1 — Cluster Snapshot Importer

Collects real cluster data and normalizes it into the Kubernomics schema.
Never mutates the cluster.

Initial approach: CLI wrapper around kubectl. Future sources include Prometheus metrics, cloud pricing APIs, and Terraform node pool definitions.

### Layer 2 — Scenario Schema

`ClusterSnapshot → Scenario` is the stable contract between all layers.

The simulation engine, UI, CLI, and recommendation engine all speak this schema.
Scenarios are editable what-if documents, not raw cluster dumps.

### Layer 3 — Simulation Engine

```typescript
simulateScenario(scenario: Scenario): SimulationResult
```

Pure, deterministic, stateless, testable. No React state inside scheduling logic. No UI coupling. No hidden mutable global state. The same scenario always produces the same result.

Scheduler strategy:

- **Spread** (default): prefer lower-utilized nodes, closer to default AKS behavior
- **Bin-pack**: prefer denser packing, exposes reclaimable empty nodes

Both strategies use the same `FILTER → SCORE → BIND` pipeline. Autoscaling only activates when no existing node can fit a pod.

### Layer 4 — Repack Advisor

Consumes `Scenario + SimulationResult → RecommendationResult`.

Deterministic, rule-based, blocker-oriented. Not AI. Every recommendation is explained, every blocker is named, every unsupported constraint is declared as not-yet-analyzed rather than silently ignored.

---

## Repository Structure

```text
kubernomics/
├── src/
│   ├── core/
│   │   └── simulator/        pure simulation engine
│   ├── ui/                   React UI
│   │   ├── canvas/           node visualization
│   │   ├── editor/           scenario editing panel
│   │   └── shell/            nav, tabs
│   ├── store/                Zustand state
â”‚   â”œâ”€â”€ catalogs/             provider node shape catalogs
â”‚   â”œâ”€â”€ data/                 baseline scenarios
│   ├── schema/               shared import schemas
│   └── utils/                ids, currency, YAML import/export
├── cli/                      read-only kubectl snapshot CLI
│   └── src/
│       ├── commands/         snapshot, etc.
│       ├── collectors/       kubectl wrappers
│       └── schema/           CLI re-exports shared schema
├── docs/
│   ├── decisions/            Architecture Decision Records
│   ├── architecture.md
│   ├── data-model.md
│   ├── scheduling.md
│   └── vision.md
└── scripts/                  one-time import helpers
```

---

## Run Locally

```bash
npm install
npm run dev
```

Dev server: `http://127.0.0.1:5173/`

```bash
npm test       # simulator unit tests
npm run build  # production build
```

---

## Roadmap

### Current MVP
- [x] Visual node allocation view
- [x] Spread / Bin-pack scheduler toggle
- [x] DaemonSet tax visualization
- [x] System reserved capacity visualization
- [x] Workload health and pending pod analysis
- [x] Cost breakdown by node pool
- [x] Scenario variants and comparison
- [x] YAML import / export
- [x] Baseline loaded from anonymized sample cluster
- [x] Currency dropdown and cost formatting

### Provider UX / Catalogs
- [x] Provider catalog support
- [x] Region-aware node shape selection
- [x] Currency dropdown and cost formatting
- [x] Azure catalog MVP
- [x] AWS/GCP catalog stubs
- [x] Manual/custom node shape support
- [ ] Future: live pricing adapters
- [ ] Future: cloud provider import adapters

### Core Architecture
- [x] Define stable `ClusterSnapshot` schema
- [x] Define stable `Scenario` schema with versioning
- [x] Define stable `SimulationResult` schema
- [x] Add unit tests for scheduler filter / score / bind phases
- [x] Add deterministic replay tests (same scenario -> same result)
- [x] Document schema migration policy

### CLI / Import
- [x] Add CLI package skeleton (`cli/`)
- [x] Add `kubernomics snapshot` command
- [x] Collect nodes from kubectl
- [x] Collect pods from kubectl
- [x] Collect Deployments, StatefulSets, DaemonSets from kubectl
- [x] Collect PDBs from kubectl
- [x] Collect PVC and StorageClass information
- [x] Collect resource metrics if metrics-server is available
- [x] Normalize raw Kubernetes JSON into `ClusterSnapshot`
- [x] Allow UI to import `ClusterSnapshot` JSON directly
- [ ] Future: cloud provider import adapters

### Repack Advisor
- [x] Identify reclaimable empty nodes after bin-pack simulation
- [x] Estimate cost savings from reclaimable nodes
- [x] Detect pending / unschedulable workloads
- [x] Detect PDB blockers (disruptionsAllowed = 0)
- [x] Detect required pod anti-affinity blockers
- [x] Detect topology spread constraint blockers
- [x] Detect PVC and local storage mobility blockers
- [x] Detect high DaemonSet / system tax on small nodes
- [x] Generate human-readable recommendations per node pool
- [x] Surface unsupported constraints as "not yet analyzed"

### Safety / Explainability
- [x] Disruption preview per recommendation
- [x] Show affected namespaces and workloads per recommendation
- [x] Explain why each recommendation is safe or blocked
- [x] Show analysis coverage (what was checked, what was not)
- [x] Mark unsupported constraints clearly rather than silently ignoring
- [ ] Add inline UI explanation for storage mobility findings, including PVC vs hostPath/local storage severity and platform DaemonSet treatment

### Future
- [ ] Prometheus metrics import for actual utilization
- [ ] Future: live pricing adapters
- [ ] Cloud pricing API import
- [ ] Terraform / AKS node pool import
- [ ] Karpenter / Cluster Autoscaler policy awareness
- [ ] Descheduler policy export
- [ ] Optional kubectl drain plan generation
- [ ] Optional GitOps PR generation
- [ ] Optional controller mode (much later, explicit user action only)

---

## Design Principles

- Scheduling logic stays independent from React and browser state.
- Schema compatibility is a product feature.
- Every simulator decision must be inspectable.
- Prefer bounded realism over imperfect kube-scheduler reimplementation.
- Only report blockers the tool can actually infer. Declare unknowns explicitly.
- Do not invent false certainty.

---

## Documentation

- [Vision](docs/vision.md)
- [Architecture](docs/architecture.md)
- [Scheduling](docs/scheduling.md)
- [Data model](docs/data-model.md)
- [Schema migration policy](docs/schema-migration.md)
- [ADR 0001: Core Architecture](docs/decisions/0001-core-architecture.md)
- [ADR 0002: Scheduler Strategy](docs/decisions/0002-scheduler-strategy.md)
- [ADR 0003: Cluster Import Boundary](docs/decisions/0003-cluster-import-boundary.md)
