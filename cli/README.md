# kubernomics CLI

Status: **MVP** — read-only kubectl collection is implemented for local use.

The CLI captures cluster state from kubectl and writes `cluster-snapshot.json`.
That file is then imported into the Kubernomics UI to create a baseline scenario.

The CLI is **read-only**. It does not mutate the cluster.

---

## Planned usage

```bash
# capture current cluster to file
kubernomics snapshot --context my-cluster --output cluster-snapshot.json

# or pipe to stdout
kubernomics snapshot > cluster-snapshot.json
```

Then import `cluster-snapshot.json` into the UI with the same Import button used for scenario YAML files.

From this repository, build the CLI with:

```bash
npm run cli:build
```

---

## Data collected

```
kubectl get nodes -o json
kubectl get pods -A -o json
kubectl get deployments -A -o json
kubectl get daemonsets -A -o json
kubectl get statefulsets -A -o json
kubectl get pdb -A -o json
kubectl get pvc -A -o json
kubectl get storageclass -o json
kubectl top nodes              (if metrics-server available)
kubectl top pods -A            (if metrics-server available)
```

---

## Structure

```
cli/src/
├── index.ts              entry point, command routing
├── commands/
│   └── snapshot.ts       snapshot command
├── collectors/
│   ├── nodes.ts          kubectl get nodes -> SnapshotNode[]
│   ├── pods.ts           kubectl get pods -> SnapshotPod[]
│   ├── workloads.ts      kubectl get deployments/daemonsets/... -> SnapshotWorkload[]
│   ├── pdbs.ts           kubectl get pdb -> SnapshotPDB[]
│   ├── storage.ts        kubectl get pvc/storageclass -> storage snapshots
│   └── metrics.ts        kubectl top, when metrics-server is available
└── schema/
    └── cluster-snapshot.ts   re-exports shared ClusterSnapshot schema
```

---

## Design constraints

- The CLI never writes to the cluster.
- Simulation logic lives in `src/core/`, not here.
- The CLI outputs `ClusterSnapshot`, not `Scenario` — the UI handles normalization.
- kubectl is the only required external dependency.
- Unsupported constraints (topology spread, affinity, etc.) are declared in warnings, not silently dropped.
