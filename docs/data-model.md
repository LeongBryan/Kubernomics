# Data Model

The data model is the contract between scenario files, importers, the simulation engine, and the UI. It should be versioned, validated, and kept independent from React.

This document describes the conceptual model. Exact TypeScript names may differ, but the boundaries and invariants should remain stable.

## Units

Use normalized internal units:

- CPU: millicores.
- Memory: MiB.
- Cost: hourly cost with currency code.
- Time: explicit duration only where needed for cost projections.

Input files may accept human-friendly units, but normalization must happen before simulation.

## Scenario

A scenario is a complete what-if experiment.

Fields:

- `schemaVersion`
- `id`
- `name`
- `description`
- `cloud`: provider, region, and display currency
- `schedulerStrategy`: `Spread` or `Bin-pack`
- `nodePools`
- `workloads`
- `metadata`

Invariants:

- Scenario ids are stable within a workspace.
- Scenario names are user-facing and not used for identity.
- A scenario must be valid without access to a live cluster.
- All defaults applied by normalization should be visible in the normalized scenario or result.

## Node Pool

A node pool describes a set of similar nodes.

Fields:

- `id`
- `name`
- `mode`: `manual` or `autoscale-to-fit`
- `nodeCount` for manual pools
- `initialNodes`, `minNodes`, and `maxNodes` for autoscale-to-fit pools
- `shape`
- `hourlyCost`
- `labels`
- `taints`
- `maxPods`
- `systemReserved`
- `kubeReserved`
- `metadata`

Invariants:

- Manual pools have a fixed node count.
- Autoscale-to-fit pools must have `minNodes <= initialNodes <= maxNodes`.
- Node pool labels and taints are copied to materialized nodes unless explicitly overridden by a future feature.
- `maxPods` must be positive.
- Reserved CPU and memory cannot exceed node capacity.

## Node Shape

A node shape describes capacity and pricing assumptions.

Fields:

- `id`
- `name`
- `provider`
- `region`
- `providerSku`
- `vcpu`
- `memoryMiB`
- `hourlyCost`
- `currency`
- `metadata`

Provider SKUs are catalog/import metadata. The simulator consumes normalized `vcpu`, `memoryMiB`, `maxPods`, and hourly cost only; provider-specific lookup belongs in catalogs, importers, and pricing utilities.

## Workload

A workload describes desired pods.

Fields:

- `id`
- `name`
- `kind`: `DaemonSet` or `Deployment`
- `team`
- `classification`: `platform`, `system`, or `application`
- `color`
- `resources`
- `replicas` for Deployments
- `nodeSelector`
- `tolerations`
- `required`: primarily for DaemonSets
- `metadata`

Future fields:

- Affinity and anti-affinity.
- Priority.
- Topology spread constraints.
- Namespace.
- Labels.

Invariants:

- Deployment workloads must specify replicas.
- DaemonSet desired pod count is derived from eligible nodes.
- Workload color is visualization metadata and must not affect simulation.
- Classification is used for grouping, attribution, display, and deterministic ordering.

## Resource Request

Fields:

- `cpuMillis`
- `memoryMiB`

Invariants:

- Requests are non-negative.
- A pod with zero request is schedulable by resource filters but still consumes a pod slot.
- The simulator uses requests, not observed usage, until a metrics-based model is explicitly introduced.

## Taint

Fields:

- `key`
- `value`
- `effect`

Initial effects:

- `NoSchedule`

Future effects:

- `PreferNoSchedule`
- `NoExecute`

## Toleration

Fields:

- `key`
- `operator`
- `value`
- `effect`

Initial operators:

- `Equal`
- `Exists`

## Materialized Node

Materialized nodes are created by the engine from node pools. They may appear in result output but should not be authored directly in the initial schema.

Fields:

- `id`
- `name`
- `nodePoolId`
- `ordinal`
- `capacity`
- `allocatable`
- `labels`
- `taints`
- `maxPods`
- `addedByAutoscaler`

## Pod Instance

Pod instances are created by the engine from workloads.

Fields:

- `id`
- `workloadId`
- `kind`
- `ordinal`
- `resources`
- `constraints`
- `expectedNodeId` for DaemonSet pods when applicable

Pod ids must be deterministic.

## Simulation Result

The result is derived data from running the engine.

Fields:

- `scenarioId`
- `engineVersion`
- `schedulerStrategy`
- `nodes`
- `placements`
- `pendingPods`
- `workloadHealth`
- `capacitySummary`
- `costSummary`
- `autoscalingSummary`
- `trace`

Invariants:

- The result should not be edited by the UI.
- Results can be regenerated from scenario input.
- Result ordering must be deterministic.

## Placement

Fields:

- `podId`
- `workloadId`
- `nodeId`
- `nodePoolId`
- `cpuMillis`
- `memoryMiB`
- `schedulerStrategy`
- `score`
- `traceId`

## Pending Pod

Fields:

- `podId`
- `workloadId`
- `reasons`
- `nodeRejections`
- `autoscaleAttempted`

Reasons should be user-readable and structured enough for grouping.

Example reason categories:

- `InsufficientCpu`
- `InsufficientMemory`
- `MaxPodsExceeded`
- `NodeSelectorMismatch`
- `UntoleratedTaint`
- `NodePoolMaxNodesReached`
- `DaemonSetRequiredButUnschedulable`

## Workload Health

Fields:

- `workloadId`
- `desiredReplicas`
- `scheduledReplicas`
- `pendingReplicas`
- `state`: `Healthy`, `Degraded`, or `Unhealthy`
- `reasons`

Rules:

- Healthy: all desired pods scheduled.
- Degraded: some scheduled and some pending.
- Unhealthy: zero scheduled, or a required DaemonSet cannot run where expected.

## Capacity Summary

Capacity should be broken down by node, node pool, workload, team, and classification where possible.

Core categories:

- Total capacity.
- System reserved.
- Kube reserved.
- DaemonSet tax.
- Application requests.
- Other platform/system requests.
- Unused capacity.
- Stranded capacity.

Stranded capacity is capacity that exists but is hard to use because another resource is exhausted or placement constraints make it unavailable.

## Cost Summary

Cost output should support:

- Cost by node pool.
- Cost by team.
- Cost by workload classification.
- Cost of system tax.
- Cost impact of added autoscale nodes.
- Scenario total hourly cost.

Initial attribution can be request-based:

- Reserved resources and DaemonSet tax are attributed to platform or system classifications.
- Application workload requests are attributed to their teams.
- Unused capacity remains unattributed or attributed to the node pool.

Any attribution model must be documented because cost allocation can be subjective.

## Cluster Snapshot

The cluster snapshot is an external import format, not the core scenario schema.

Preferred flow:

```text
kubectl/helper script/local AI
  -> cluster-snapshot.json
  -> Kubernomics import
  -> baseline scenario
  -> duplicated what-if scenarios
```

Snapshot fields may include:

- Nodes.
- Node pools.
- Node labels and taints.
- Allocatable capacity.
- Pods.
- Workload owners.
- Requests.
- DaemonSets.
- Namespaces.
- PVCs and StorageClasses.
- Optional metrics-server usage data.

The importer decides how to normalize snapshots into a scenario. The simulation engine should not depend on raw snapshot structure.

## Schema Evolution

The schema should include a version field from the start.

Current version constants live in code:

- `CLUSTER_SNAPSHOT_SCHEMA_VERSION` for cluster snapshots.
- `SCENARIO_SCHEMA_VERSION` for editable scenarios.
- `SIMULATION_ENGINE_VERSION` for generated simulation results.

Recommended policy:

- Additive optional fields are allowed within a minor schema version.
- Breaking changes require a new schema version and a migration.
- Importers should emit the current scenario version.
- Old scenario files should fail with useful errors or migrate explicitly.

See [Schema migration policy](schema-migration.md) for the compatibility and failure rules.

## Validation Philosophy

Validation should reject:

- Missing required ids.
- Duplicate ids.
- Invalid resource units.
- Negative resource requests.
- Invalid autoscaling bounds.
- Node pools with reserved resources greater than capacity.
- Workloads that reference impossible constraints where this is statically knowable.

Validation should warn, not reject, when:

- A workload has a selector that matches no current node pool.
- A manual scenario has workloads that are likely too large.
- Cost fields are missing and cost views will be incomplete.
