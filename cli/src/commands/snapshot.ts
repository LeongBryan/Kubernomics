import { writeFile } from 'node:fs/promises'
import { collectMetrics } from '../collectors/metrics.js'
import { collectNodes } from '../collectors/nodes.js'
import { collectPDBs } from '../collectors/pdbs.js'
import { collectPods } from '../collectors/pods.js'
import { collectPVCs, collectStorageClasses } from '../collectors/storage.js'
import { attachPdbRefs, collectWorkloads } from '../collectors/workloads.js'
import { CLUSTER_SNAPSHOT_SCHEMA_VERSION, type ClusterSnapshot } from '../schema/cluster-snapshot.js'

export interface SnapshotOptions {
  context?: string
  output?: string
  namespace?: string
  skipMetrics?: boolean
}

export async function runSnapshot(opts: SnapshotOptions = {}): Promise<ClusterSnapshot> {
  const [nodes, pods, pdbs, rawWorkloads, pvcs, storageClasses, metrics] = await Promise.all([
    collectNodes(opts.context),
    collectPods(opts.context, opts.namespace),
    collectPDBs(opts.context, opts.namespace),
    collectWorkloads(opts.context, opts.namespace),
    collectPVCs(opts.context, opts.namespace),
    collectStorageClasses(opts.context),
    opts.skipMetrics ? Promise.resolve(undefined) : collectMetrics(opts.context, opts.namespace),
  ])

  const workloads = attachPdbRefs(rawWorkloads, pdbs)
  const namespaces = [...new Set([...pods, ...workloads, ...pdbs, ...pvcs].map((item) => item.namespace))].sort()
  const warnings = [
    'Affinity, anti-affinity, topology spread constraints, priority classes, quotas, and HPA policies are not normalized yet.',
    ...(metrics ? [] : ['metrics-server data unavailable; usage metrics omitted.']),
  ]

  const snapshot: ClusterSnapshot = {
    version: CLUSTER_SNAPSHOT_SCHEMA_VERSION,
    capturedAt: new Date().toISOString(),
    ...(opts.context ? { context: opts.context, clusterName: opts.context } : {}),
    nodes,
    pods,
    workloads,
    pdbs,
    namespaces,
    pvcs,
    storageClasses,
    ...(metrics ? { metrics } : {}),
    warnings,
  }

  if (opts.output) {
    await writeFile(opts.output, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
  }

  return snapshot
}
