import type { SnapshotMetrics } from '../schema/cluster-snapshot.js'
import { kubectlTop } from '../kubectl.js'
import { parseNodeMetrics, parsePodMetrics } from '../normalizers/kubernetes.js'

export async function collectMetrics(context?: string, namespace?: string): Promise<SnapshotMetrics | undefined> {
  try {
    const [nodes, pods] = await Promise.all([
      kubectlTop(['nodes', '--no-headers'], { context }),
      kubectlTop(['pods', '--no-headers'], { context, namespace }),
    ])
    return {
      nodes: parseNodeMetrics(nodes),
      pods: parsePodMetrics(pods),
    }
  } catch {
    return undefined
  }
}
