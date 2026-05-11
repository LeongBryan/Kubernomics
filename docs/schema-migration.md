# Schema Migration Policy

Kubernomics treats schemas as product contracts. Scenario files, cluster snapshots, and simulation results should remain readable and explainable across app versions.

## Stable Contracts

Current contract versions:

- `ClusterSnapshot` uses `CLUSTER_SNAPSHOT_SCHEMA_VERSION = "0.1"` in `src/schema/clusterSnapshot.ts`.
- `Scenario` uses `SCENARIO_SCHEMA_VERSION = "0.1"` in `src/core/simulator/schemaVersions.ts`.
- `SimulationResult` uses `SIMULATION_ENGINE_VERSION = "0.1.0"` in `src/core/simulator/schemaVersions.ts`.

`ClusterSnapshot` is an external import format. `Scenario` is the normalized what-if document consumed by the simulator and UI. `SimulationResult` is derived output and should be regenerated from a scenario instead of edited directly.

## Version Rules

- Additive optional fields may stay within the same minor schema version.
- New required fields require either defaults in a migration or a schema version bump.
- Renamed, removed, or semantically changed fields require a schema version bump.
- Simulator engine behavior changes should bump `SIMULATION_ENGINE_VERSION`, even when the input `Scenario` schema is unchanged.
- Importers should emit the current `Scenario` version after normalization.

## Migration Rules

Migrations must be:

- Pure: same input produces the same migrated output.
- Idempotent: running the migration twice must not keep changing the document.
- Explicit: destructive changes must be called out in release notes or importer warnings.
- Backward-aware: legacy compatibility fields, such as `shape.vCpu`, may be read while newer normalized fields, such as `shape.vcpu`, remain canonical.

Persisted browser scenarios and imported scenario files should be normalized to the current `Scenario` version before simulation. The simulator core should not contain provider-specific migration logic.

## Failure Policy

When a document cannot be migrated safely, Kubernomics should fail with a useful error that names:

- the detected schema version,
- the supported schema versions,
- the field or invariant that blocks migration,
- and the least surprising repair path.

Silent partial migration is not allowed for fields that affect scheduling, capacity, or cost math.
