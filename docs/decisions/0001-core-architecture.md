# ADR 0001: Core Architecture

Date: 2026-05-11

Status: Accepted

## Context

Kubernomics is moving from a scrappy prototype into a proper repository. The product needs to support node-capacity experiments, scheduling simulation, cost analysis, import workflows, and a visualization UI.

The main architectural risk is allowing the UI, importer logic, and scheduler behavior to grow together without clear boundaries. That would make the simulator hard to test, hard to trust, and hard to extend beyond one cluster.

## Decision

Kubernomics will be separated into four layers:

1. Scenario schema.
2. Simulation engine.
3. Visualization UI.
4. Importers.

The scenario schema is the stable contract between layers.

The simulation engine will be pure, deterministic, and stateless:

```text
scenario input
  -> deterministic simulation
  -> result output
```

The initial application will be a local-first browser app using React, TypeScript, Tailwind, and lightweight state management such as Zustand. No backend will be added unless a concrete product requirement justifies it.

## Consequences

Positive:

- The scheduler can be tested without rendering UI.
- Scenarios can be imported, exported, diffed, and shared as files.
- The same engine can later run in a worker, CLI, or backend if needed.
- Importers can evolve independently from the UI.
- Scenario comparison becomes straightforward because simulations are deterministic.

Negative:

- More upfront schema design is required.
- Some UI prototypes will take longer because behavior must be expressed through the schema and engine.
- Schema migrations will need discipline once users have saved scenarios.

## Invariants

- React components must not contain scheduling rules.
- Zustand or other UI state must not be required to run a simulation.
- Importers must output scenarios, not engine internals or UI-specific state.
- Engine output must be derived only from scenario input and engine version.
- Hidden mutable global state is not allowed in the simulation path.

## Alternatives Considered

### UI-first prototype

Build scheduling logic directly inside React state and components.

Rejected because it would be fast initially but would make deterministic testing, explanation traces, and future import workflows fragile.

### Backend-first service

Create an API and backend simulation service immediately.

Rejected for the initial version because the core workflows can be local-first, file-based, and browser-driven. A backend can be introduced later if collaboration, large scenarios, or centralized storage require it.

### Importer-driven model

Use real cluster snapshots as the primary internal model.

Rejected because Kubernomics needs editable what-if scenarios. Raw snapshots are source-specific and should remain outside the core schema boundary.

## Follow-up Work

- Define scenario and result schemas.
- Select validation approach.
- Build fixture scenarios.
- Implement pure engine tests before UI polish.
- Document schema migration policy.
