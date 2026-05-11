# Scheduling

Kubernomics uses a Kubernetes-inspired `FILTER -> SCORE -> BIND` scheduler model. The goal is bounded realism: deterministic, explainable placement that is close enough to support platform capacity and cost decisions.

Kubernomics does not attempt to perfectly reimplement kube-scheduler.

## Core Principles

- Scheduling is pure and deterministic.
- The same scenario produces the same result.
- The scheduler has no React state, UI coupling, browser storage, network access, or hidden mutable globals.
- The filter phase is shared by all strategies.
- Strategies change scoring only.
- Every pending pod includes unschedulable reasons.
- Every placement can be explained through trace output.

## Inputs

The scheduler receives a normalized scenario:

- Node pools.
- Materialized nodes.
- Workloads expanded into desired pods.
- Resource requests in normalized units.
- Node labels and taints.
- Workload node selectors and tolerations.
- Scheduler strategy.
- Autoscaling mode.

## Outputs

The scheduler produces:

- Pod placements.
- Pending pods and reasons.
- Node utilization.
- Workload health.
- Autoscaling events.
- Explanation traces.

## Scheduling Pipeline

### 1. Normalize

Before scheduling:

- CPU is normalized to millicores.
- Memory is normalized to MiB.
- Costs are normalized to an hourly value with a currency code.
- Node pools are expanded into initial nodes.
- Workloads are expanded into desired pod instances.
- Defaults are applied explicitly.

### 2. Account For Node Reserved Resources

Each node starts with capacity from its node shape:

- vCPU.
- Memory.
- Max pods.

Then reserved resources are removed from allocatable capacity:

- System reserved CPU and memory.
- Kube reserved CPU and memory.

Reserved capacity should be visible in results. It is not treated as workload usage.

### 3. Schedule DaemonSet Pods

DaemonSets represent a large part of platform system tax, so they must be modeled explicitly.

A DaemonSet is expected to run on every node that matches its placement constraints. A DaemonSet pod consumes resources on each eligible node. If a required DaemonSet cannot run where expected, the workload is Unhealthy and the result must show the failed nodes and reasons.

Initial ordering should schedule DaemonSet pods before Deployment pods so application placement sees platform overhead.

For autoscaled nodes, applicable DaemonSet overhead must be considered before deciding whether the original pending pod fits on the new node.

### 4. Schedule Deployment Pods

Deployments expand to `replicas` pod instances. Each instance is scheduled independently using `FILTER -> SCORE -> BIND`.

Pod ordering must be deterministic. The initial recommendation is:

1. Workload classification priority: platform and system before application.
2. Workload name.
3. Pod ordinal.

If future features add explicit priority, it should be part of the scenario schema and the trace output.

## FILTER

The filter phase removes nodes that cannot run the pod.

Initial filter checks:

- Node has enough remaining CPU.
- Node has enough remaining memory.
- Node has remaining pod slots under `maxPods`.
- Node labels satisfy the workload's node selector.
- Node taints are tolerated by the workload.
- Node pool is eligible for the workload.
- Node is active and schedulable.

Future filter checks:

- Required node affinity.
- Required pod affinity or anti-affinity.
- Topology spread constraints.
- Runtime class constraints.
- Storage or zone constraints.

The filter phase returns both feasible nodes and rejection reasons for infeasible nodes.

## SCORE

Scoring receives only feasible existing nodes. It must not create nodes and must not mutate state.

The scheduler supports two scoring strategies:

- Spread.
- Bin-pack.

Both use the same filter phase.

Scores should be normalized and traceable. The trace should show the major score components and final selected node.

## BIND

Binding assigns the pod to the selected node and updates the simulation's working capacity state.

Binding output should record:

- Pod id.
- Workload id.
- Node id.
- Node pool id.
- Requested CPU and memory.
- Scheduler strategy.
- Score summary.

The public result should expose placements without leaking unnecessary internal mutable structures.

## Autoscaling Semantics

Each node pool supports one of two modes.

### Manual Mode

- Node count is fixed.
- The simulator cannot add nodes.
- Pods that cannot fit remain pending.
- Affected workloads become Degraded or Unhealthy.

### Autoscale-To-Fit Mode

- The pool has `minNodes`, `maxNodes`, and an initial node count.
- The simulator may add a node only when no existing feasible node can fit the current pod.
- Added nodes must include reserved resources and applicable DaemonSet overhead.
- If the pod still cannot fit on a newly added node, the pod remains pending.
- The result reports initial node count, final node count, added nodes, and cost impact.

Autoscale-to-fit is not a full Cluster Autoscaler model. It is a deterministic capacity experiment.

## Spread Strategy

`Spread` is the default strategy.

Rationale:

- It is closer to default AKS/Kubernetes behavior, especially `NodeResourcesFit:LeastAllocated` style placement.
- It makes resource pressure and broad capacity distribution easy to inspect.

Spread should:

- Prefer nodes with more remaining CPU after placement.
- Prefer nodes with more remaining memory after placement.
- Prefer lower pod count.
- Distribute workload across feasible existing nodes.

Important invariant:

- Spread must not autoscale just to achieve prettier distribution.

Spread only scores feasible existing nodes. Autoscaling happens only when no existing node can fit the pod.

Suggested scoring components:

```text
cpuHeadroomScore    = remainingCpuAfterPlacement / allocatableCpu
memoryHeadroomScore = remainingMemoryAfterPlacement / allocatableMemory
podSpreadScore      = 1 - (podCountAfterPlacement / maxPods)

finalScore = weighted average of the components
```

Initial weights can be equal. If weights become configurable, they must be part of the scenario schema and trace output.

## Bin-pack Strategy

`Bin-pack` is an alternative strategy for consolidation experiments.

Bin-pack should:

- Prefer nodes that become more full after placement.
- Prefer already-used nodes.
- Avoid opening new nodes unless required.
- Make removable empty nodes more likely.

Suggested scoring components:

```text
cpuFillScore       = usedCpuAfterPlacement / allocatableCpu
memoryFillScore    = usedMemoryAfterPlacement / allocatableMemory
alreadyUsedBonus   = nodeHasNonDaemonWorkload ? 1 : 0
emptyNodePenalty   = nodeIsEmptyBeforePlacement ? 1 : 0

finalScore = weighted combination of fill scores and usage preference
```

Bin-pack still cannot bypass filters. It cannot place a pod on a node without capacity or on a node rejected by labels or taints.

## Tie-Breaking

Tie-breaking must be deterministic and documented.

Recommended order:

1. Higher final score.
2. Lower projected dominant resource imbalance.
3. Lower node pool name.
4. Lower node ordinal.
5. Lower node id.

The exact tie-breaks should be implemented once and shared by all strategies.

## Workload Health

Each workload receives computed health:

- Healthy: all desired pods scheduled.
- Degraded: some scheduled and some pending.
- Unhealthy: zero scheduled, or a required DaemonSet cannot run where expected.

The result should include:

- Desired replicas.
- Scheduled replicas.
- Pending replicas.
- Health state.
- Unschedulable reasons.

DaemonSet health should account for expected nodes rather than a user-entered replica count.

## Explanation Traces

The engine should be able to explain:

- Why each rejected node failed filter checks.
- Which feasible nodes were scored.
- Which score components selected the winner.
- When autoscale-to-fit added a node.
- Why pending pods remained pending.
- How workload health was computed.

Trace output is part of the product. It is how users decide whether to trust a simulation.

## Bounded Realism

The scheduler should model important Kubernetes behavior in a controlled subset.

Model early:

- Resource requests.
- Node selectors.
- Taints and tolerations.
- Max pods.
- DaemonSet overhead.
- Manual and autoscale-to-fit node pools.
- Spread and Bin-pack scoring.

Defer:

- Full kube-scheduler plugin parity.
- Preemption.
- Pod priority.
- Inter-pod affinity and anti-affinity.
- Topology spread constraints.
- Volume binding.
- Runtime classes.
- Historical utilization metrics.

Deferred features should be added only when the scenario schema can express them clearly and the engine can explain them.
