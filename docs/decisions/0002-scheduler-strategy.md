# ADR 0002: Scheduler Strategy

Date: 2026-05-11

Status: Accepted

## Context

Kubernomics needs to model Kubernetes-like placement well enough to support capacity, consolidation, and platform overhead decisions. It does not need full kube-scheduler parity.

The simulator must be deterministic, explainable, and testable. Users need to compare default-like placement behavior with consolidation-oriented placement behavior.

## Decision

Kubernomics will use a Kubernetes-inspired `FILTER -> SCORE -> BIND` scheduler model.

The filter phase is shared by all strategies. It determines which existing nodes can run a pod based on resource capacity, max pod count, node selectors, taints, and other supported constraints.

The scheduler will support two scoring strategies:

- `Spread`
- `Bin-pack`

`Spread` is the default strategy.

`Spread` will prefer feasible existing nodes with more remaining CPU, more remaining memory, and lower pod count. This is closer to default AKS/Kubernetes behavior, especially `NodeResourcesFit:LeastAllocated` style placement.

`Bin-pack` will prefer nodes that become more full after placement, prefer already-used nodes, avoid opening new nodes unless required, and make removable empty nodes more likely.

Autoscaling will happen only when no existing feasible node can fit the current pod. Spread must not autoscale merely to produce a prettier distribution.

## Consequences

Positive:

- Users can compare default-like spread behavior against consolidation behavior.
- The simulator remains easier to explain than a full kube-scheduler clone.
- Both strategies share filter behavior, reducing inconsistent placement bugs.
- Scheduling can be tested with small fixtures and deterministic traces.

Negative:

- Results will not perfectly match real kube-scheduler behavior.
- Some Kubernetes features will be deferred.
- Users may need documentation to understand why Kubernomics output differs from a live cluster.

## Invariants

- Strategies only change scoring.
- Filter behavior is shared.
- Scoring receives feasible existing nodes only.
- Scoring does not mutate scheduler state.
- Bind is the only step that changes working placement state.
- Tie-breaking is deterministic and shared.
- Autoscale-to-fit adds nodes only after all existing nodes fail filter checks for the current pod.

## Bounded Realism

Model early:

- CPU and memory requests.
- Node selectors.
- Taints and tolerations.
- Max pods.
- System and kube reserved capacity.
- DaemonSet overhead.
- Manual node pools.
- Autoscale-to-fit node pools.

Defer:

- Full kube-scheduler plugin parity.
- Preemption.
- Pod priority.
- Preferred affinity.
- Required affinity beyond simple selectors.
- Topology spread constraints.
- Volume binding.
- Runtime classes.

Deferred features can be added when they can be expressed in the scenario schema and explained in trace output.

## Alternatives Considered

### Exact kube-scheduler reimplementation

Rejected because it would be expensive, brittle, and unnecessary for the product goal. Kubernomics needs decision support, not scheduler parity.

### Single bin-packing scheduler

Rejected because it would over-emphasize consolidation and differ from the common default behavior teams see in AKS/Kubernetes.

### Single spread scheduler

Rejected because consolidation experiments need to show what happens when placement intentionally fills nodes and leaves other nodes empty.

### Randomized placement

Rejected because repeatability and explainability are core product requirements.

## Follow-up Work

- Define exact scoring formulas and weights.
- Add trace format for filter and score decisions.
- Create fixtures that demonstrate Spread and Bin-pack differences.
- Add tests for autoscale-to-fit semantics.
- Document known differences from kube-scheduler.
