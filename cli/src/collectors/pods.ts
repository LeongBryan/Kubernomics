import type { SnapshotPod } from '../schema/cluster-snapshot.js'
import { kubectlJson } from '../kubectl.js'
import { normalizePod } from '../normalizers/kubernetes.js'

type PodList = {
  items?: Record<string, unknown>[]
}

export async function collectPods(context?: string, namespace?: string): Promise<SnapshotPod[]> {
  const list = await kubectlJson<PodList>('pods', { context, namespace }, true)
  return (list.items ?? []).map(normalizePod)
}
