import type { SnapshotNode } from '../schema/cluster-snapshot.js'
import { kubectlJson } from '../kubectl.js'
import { normalizeNode } from '../normalizers/kubernetes.js'

type NodeList = {
  items?: Record<string, unknown>[]
}

export async function collectNodes(context?: string): Promise<SnapshotNode[]> {
  const list = await kubectlJson<NodeList>('nodes', { context }, false)
  return (list.items ?? []).map(normalizeNode)
}
