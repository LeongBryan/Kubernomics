# Vision

Kubernomics helps teams reason about Kubernetes node capacity, workload placement, and cost before they make infrastructure changes.

The product exists because many Kubernetes capacity conversations are hard to inspect directly. Platform overhead is spread across every node, DaemonSets scale with node count, application teams compete for shared pools, and cost impact is often buried behind aggregate cloud spend. Kubernomics makes those tradeoffs visible through local, repeatable what-if scenarios.

## Product Purpose

Kubernomics is primarily for running what-if experiments around:

- Kubernetes node usage.
- Node consolidation.
- Node pool sizing.
- Platform system tax.
- Workload placement.
- Cost by node pool, team, workload class, and scenario.

"System tax" means per-node overhead from platform components such as:

- Istio or another service mesh.
- CNI.
- Monitoring agents.
- Logging agents.
- Security agents.
- CSI drivers.
- Node exporters.
- Platform operators.

The first major use case is visualizing how DaemonSet-heavy platform overhead scales with node count and node size.

## Users

Primary users:

- Platform engineers who operate shared Kubernetes clusters.
- SREs who need to explain capacity pressure and cost drivers.
- Engineering leads who need to compare node pool and consolidation options.

Future users:

- Application teams who want to understand their own usage and cost efficiency.
- FinOps teams who need better attribution of platform overhead.
- Cluster owners comparing shared and dedicated node pool strategies.

## Core Questions

Kubernomics should help answer questions like:

- How much CPU and memory is consumed by platform overhead before application pods are placed?
- How does DaemonSet tax change when node count increases or decreases?
- Which node pools have stranded capacity?
- Which workloads become pending when node count is reduced?
- What is the cost impact of switching node sizes?
- How many nodes are added under autoscale-to-fit mode?
- What is the difference between Spread and Bin-pack placement for this workload mix?
- Which teams benefit or suffer from a proposed consolidation?
- How much of total cost is system tax versus application usage?

## Product Shape

Kubernomics should be a local-first browser application. Users should be able to import or author scenarios, duplicate them, change assumptions, run simulations, and compare results without connecting to a live cluster.

The application should feel like an experimentation workbench, not a monitoring dashboard. It should support deliberate scenario construction, transparent simulation output, and side-by-side comparison.

## Initial Use Cases

1. Platform overhead analysis

   Show reserved resources, DaemonSet tax, application usage, and unused capacity for a representative cluster.

2. Node consolidation experiments

   Reduce node count or change node size, then inspect workload health, pending pods, and cost changes.

3. Scheduler strategy comparison

   Compare Spread and Bin-pack behavior using the same scenario and filter rules.

4. Autoscale-to-fit experiments

   Start from a minimum node count, let the simulator add nodes only when required, and report final node count and cost impact.

5. Baseline import

   Convert a cluster snapshot into a baseline scenario that can be duplicated and modified.

## Non-goals

Kubernomics should not:

- Reimplement kube-scheduler perfectly.
- Act as an admission controller, autoscaler, or cluster operator.
- Make live changes to Kubernetes.
- Require direct cluster access from the browser.
- Hide placement decisions behind non-deterministic or opaque logic.
- Optimize for every Kubernetes scheduling feature before the core model is useful.

## Product Principles

Clarity:

- The user should see why a pod was placed, why a node was rejected, and why a workload is degraded.

Determinism:

- The same scenario and engine version should produce the same result.

Bounded realism:

- The simulator should be close enough to support useful platform decisions without pretending to be Kubernetes itself.

Separation of concerns:

- The schema is the stable contract. The engine is pure. The UI visualizes. Importers adapt external data.

Local-first:

- Initial workflows should work with files in the browser and should not require a service.

## Success Criteria

The first useful version succeeds when a platform engineer can:

- Load or create a scenario.
- See node capacity divided into reserved, DaemonSet tax, application usage, and unused capacity.
- Run Spread and Bin-pack simulations.
- Change node pool counts and sizes.
- See workload health and pending pods.
- Compare cost and capacity between scenarios.
- Explain the simulator output to another engineer without reading source code.
