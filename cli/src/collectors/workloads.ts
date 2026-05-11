import type { SnapshotPDB, SnapshotWorkload } from '../schema/cluster-snapshot.js'
import { kubectlJson } from '../kubectl.js'
import { normalizeWorkload, selectorMatches } from '../normalizers/kubernetes.js'

type WorkloadList = {
  items?: Record<string, unknown>[]
}

const WORKLOAD_RESOURCES = ['deployments', 'statefulsets', 'daemonsets', 'cronjobs']

export async function collectWorkloads(context?: string, namespace?: string): Promise<SnapshotWorkload[]> {
  const lists = await Promise.all(
    WORKLOAD_RESOURCES.map((resource) => kubectlJson<WorkloadList>(resource, { context, namespace }, true))
  )
  return lists.flatMap((list) => (list.items ?? []).map(normalizeWorkload))
}

export function attachPdbRefs(workloads: SnapshotWorkload[], pdbs: SnapshotPDB[]): SnapshotWorkload[] {
  return workloads.map((workload) => {
    const pdb = pdbs.find(
      (candidate) =>
        candidate.namespace === workload.namespace &&
        candidate.selector &&
        selectorMatches(candidate.selector, workload.labels)
    )
    return pdb ? { ...workload, pdbRef: pdb.name } : workload
  })
}
