import type { SnapshotPDB } from '../schema/cluster-snapshot.js'
import { kubectlJson } from '../kubectl.js'
import { normalizePDB } from '../normalizers/kubernetes.js'

type PdbList = {
  items?: Record<string, unknown>[]
}

export async function collectPDBs(context?: string, namespace?: string): Promise<SnapshotPDB[]> {
  const list = await kubectlJson<PdbList>('pdb', { context, namespace }, true)
  return (list.items ?? []).map(normalizePDB)
}
