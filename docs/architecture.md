# Architecture

Kubernomics is built around a stable scenario contract and a pure simulation engine. The UI, importers, and future integrations depend on the schema rather than calling into each other directly.

## Architectural Layers

```text
external inputs
  -> importers
  -> scenario schema
  -> simulation engine
  -> result schema
  -> visualization UI
```

### Scenario Schema

The scenario schema describes the desired experiment:

- Node pools and node shapes.
- Workloads and resource requests.
- Scheduling constraints.
- Scheduler strategy.
- Autoscaling mode.
- Cost assumptions.
- Metadata for visualization and attribution.

The schema is the most important boundary in the system. It should be versioned, validated, documented, and stable enough for scenarios to be stored as files.

### Simulation Engine

The simulation engine is a pure TypeScript module:

```text
simulate(scenario) -> simulationResult
```

It must be:

- Deterministic.
- Stateless.
- Independent from React.
- Independent from Zustand or any other UI state store.
- Independent from browser APIs.
- Explicit about errors and unschedulable reasons.

The engine owns:

- Node materialization.
- Workload pod expansion.
- Filter, score, and bind scheduling.
- Autoscale-to-fit behavior.
- Capacity accounting.
- Workload health computation.
- Cost summaries.
- Explanation traces.

### Repack Advisor

The advisor consumes `Scenario + SimulationResult` and produces deterministic findings and node-pool recommendations.

The advisor owns:

- Reclaimable node detection after bin-pack simulation.
- Estimated monthly savings for reclaimable nodes.
- Pending and unschedulable workload findings.
- Imported blockers such as PDBs, required anti-affinity, topology spread, PVCs, hostPath, and local storage.
- High DaemonSet/platform/system tax detection on small nodes.
- Clear "not yet analyzed" findings for constraints outside the current model.

### Visualization UI

The UI consumes scenarios and simulation results. It should not contain scheduling rules.

The UI owns:

- Scenario editing workflows.
- Scenario duplication.
- Import/export controls.
- Result visualization.
- Scenario comparison.
- User preferences such as selected view, visible breakdowns, and colors.

### Importers

Importers translate external data into Kubernomics scenarios. They should be replaceable adapters around the schema.

Initial importer targets:

- Manual JSON/YAML.
- `cluster-snapshot.json` generated outside the UI.

Future importer targets:

- Prometheus metrics.
- Cloud pricing APIs.
- Terraform or AKS node pool definitions.
- Other cluster snapshot formats.

The browser UI must not call `kubectl` directly. Live cluster access belongs outside the app boundary.

## Proposed Source Layout

This is a starting point, not a commitment to exact filenames:

```text
src/
  schema/
    scenario.ts
    result.ts
    validation.ts
    versions.ts
  engine/
    simulate.ts
    materialize.ts
    capacity.ts
    cost.ts
    health.ts
    trace.ts
    scheduler/
      filter.ts
      score.ts
      bind.ts
      strategies/
        spread.ts
        binPack.ts
  importers/
    scenarioFile/
      json.ts
      yaml.ts
    clusterSnapshot/
      snapshotSchema.ts
      normalize.ts
      toScenario.ts
  state/
    scenarioStore.ts
    uiStore.ts
  ui/
    components/
    views/
    charts/
    colors.ts
  fixtures/
    scenarios/
    snapshots/
tests/
  engine/
  schema/
  importers/
docs/
  decisions/
```

## Module Boundaries

### `schema`

Defines types, validation, schema versioning, and migration helpers.

Allowed dependencies:

- TypeScript runtime-free types.
- A validation library if selected.

Not allowed:

- React.
- UI state.
- Scheduler implementation details.
- Importer-specific assumptions.

### `engine`

Runs the deterministic simulation.

Allowed dependencies:

- `schema`.
- Small pure helper libraries if justified.

Not allowed:

- React.
- DOM APIs.
- Browser storage.
- Network access.
- Randomness without an explicit seeded source.
- Hidden mutable global state.

### `importers`

Converts external data into scenarios.

Allowed dependencies:

- `schema`.
- Parser libraries for JSON/YAML.
- Source-specific normalization helpers.

Not allowed:

- React.
- Direct engine mutation.
- UI-specific color or layout decisions except optional metadata defaults.

### `ui`

Presents scenarios, edits assumptions, and visualizes results.

Allowed dependencies:

- `schema`.
- `engine` through a simple simulation call.
- UI framework and visualization libraries.
- State management.

Not allowed:

- Scheduler business logic.
- Cluster access.
- Importer logic that cannot be tested without the UI.

## Data Flow

1. User creates, imports, or duplicates a scenario.
2. The scenario is validated against the schema.
3. UI calls the simulation engine with the scenario.
4. The engine returns placements, health, capacity, cost, and traces.
5. UI renders the result and comparison views.
6. User exports scenarios or results as files.

## Invariants

- Scenario input is immutable from the engine's perspective.
- Simulation output is derived only from the scenario and engine version.
- Scheduling decisions are deterministic and traceable.
- Resource units are normalized before scheduling.
- Workload health is computed from scheduled and pending pod counts.
- Autoscaling only adds nodes when no existing feasible node can fit the current pod.
- Spread and Bin-pack share the same filter phase.
- Importers produce scenarios; they do not directly produce UI state.

## State Management

Initial UI state should be lightweight and local.

Recommended split:

- Persisted scenario state: scenario documents, selected scenario, scenario metadata.
- Derived simulation state: results computed from scenario input.
- Ephemeral UI state: selected panels, filters, hover state, expanded rows.

Simulation results should be recomputable and should not be hand-edited by the UI.

## Testing Strategy

The test suite should start with the engine and schema.

Core tests:

- Scenario validation rejects ambiguous or invalid input.
- Manual node pools do not add nodes.
- Autoscale-to-fit adds nodes only when needed.
- Spread distributes across feasible existing nodes.
- Bin-pack fills used nodes before opening new ones.
- DaemonSet tax is applied per eligible node.
- Workload health reports Healthy, Degraded, and Unhealthy correctly.
- Scheduler traces explain filter failures and tie-break decisions.

Snapshot-style tests are acceptable for complete simulation results if the trace output is stable and readable.

## What Should Be Built First

1. Schema types and validation.
2. Minimal scenario fixtures.
3. Pure engine with node materialization, resource accounting, and health output.
4. Scheduler filter phase.
5. Spread and Bin-pack scoring.
6. Autoscale-to-fit behavior.
7. Engine trace output.
8. JSON/YAML import/export.
9. Minimal visualization for capacity and workload health.
10. Scenario comparison.

## Risks and Complexity Traps

Perfect scheduler emulation:

- Kubernetes scheduling has many plugins and evolving behavior. Kubernomics should model a documented subset well instead of chasing full parity.

UI-coupled scheduling:

- Putting placement logic in React components will make the simulator hard to test and explain.

Hidden defaults:

- Defaults must be encoded in scenario normalization and visible in output. Silent assumptions make cost analysis hard to trust.

Cluster-specific overfitting:

- Imported baseline data should produce an editable scenario, not lock the product to one cluster's labels, taints, or conventions.

Autoscaling ambiguity:

- Autoscale-to-fit must be precise: add a node only when no existing feasible node can fit the current pod.

DaemonSet modeling:

- DaemonSets are central to system tax. Their placement, resource requests, and failure behavior should be explicit early.

Cost attribution:

- Cost by team and system tax can become subjective. The first model should be simple, documented, and consistent.
