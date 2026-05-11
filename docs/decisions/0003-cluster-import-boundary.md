# ADR 0003: Cluster Import Boundary

Date: 2026-05-11

Status: Accepted

## Context

Kubernomics should eventually support importing real cluster snapshots from `kubectl` and other sources. However, the initial product is a local-first browser application, and the UI should not require live cluster access.

Direct browser-to-cluster access would introduce authentication complexity, security concerns, platform-specific behavior, and a tight coupling between the UI and one import method.

## Decision

Kubernomics will use a file-based import boundary for cluster data:

```text
kubectl/helper script/local AI
  -> cluster-snapshot.json
  -> Kubernomics import
  -> baseline scenario
  -> duplicated what-if scenarios
```

The UI will not call `kubectl` directly.

Cluster importers will translate external snapshots into the scenario schema. The raw snapshot format is not the simulator's internal model.

Future input sources may include:

- Manual YAML/JSON.
- `kubectl` snapshot.
- Prometheus metrics.
- Cloud pricing APIs.
- Terraform or AKS node pool definitions.

Each source should adapt into the scenario schema through a replaceable importer.

## Consequences

Positive:

- The browser app remains local-first and simple.
- Cluster credentials stay outside the UI.
- Import behavior is testable with fixture files.
- Multiple input sources can converge on the same scenario model.
- Users can duplicate imported baselines into what-if scenarios.

Negative:

- Import is not fully automatic at first.
- Users need a helper script or external workflow to produce snapshots.
- Snapshot freshness is outside the app's control.
- Some live cluster details may be lost during normalization.

## Invariants

- The UI does not shell out to `kubectl`.
- The simulation engine does not depend on raw cluster snapshots.
- Importers produce scenarios.
- Imported scenarios can be edited like manually authored scenarios.
- Source-specific fields must live in metadata unless promoted into the core schema.
- Import warnings should be visible to users.

## Snapshot Scope

The first `cluster-snapshot.json` format should capture enough information to create a useful baseline:

- Nodes.
- Node labels and taints.
- Node pool identity when known.
- Allocatable CPU and memory.
- Max pods when known.
- Pods.
- Workload owners.
- Workload requests.
- DaemonSets.
- Namespaces.
- Team or owner labels when available.

Optional future fields:

- Observed metrics.
- Cloud SKU and pricing metadata.
- Namespace quotas.
- Priority classes.
- Storage and zone metadata.

## Alternatives Considered

### UI calls `kubectl`

Rejected because it couples the browser UI to local shell access, kubeconfig behavior, authentication plugins, and host permissions.

### Backend imports clusters directly

Rejected for the initial version because there is no current need for a backend. It would add authentication, deployment, and security scope before the core simulator is proven.

### Use raw Kubernetes API objects as the scenario schema

Rejected because Kubernomics scenarios are what-if documents, not exact cluster dumps. The product needs a stable, editable experiment schema.

## Follow-up Work

- Define a minimal `cluster-snapshot.json` format.
- Build importer fixtures from representative clusters.
- Add importer warnings for unsupported or ambiguous Kubernetes features.
- Add a helper script outside the UI for snapshot generation.
- Document how imported baselines should be duplicated before editing.
