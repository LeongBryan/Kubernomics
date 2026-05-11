import type { SnapshotPVC, SnapshotStorageClass } from '../schema/cluster-snapshot.js'
import { kubectlJson } from '../kubectl.js'
import { normalizePVC, normalizeStorageClass } from '../normalizers/kubernetes.js'

type ResourceList = {
  items?: Record<string, unknown>[]
}

export async function collectPVCs(context?: string, namespace?: string): Promise<SnapshotPVC[]> {
  const list = await kubectlJson<ResourceList>('pvc', { context, namespace }, true)
  return (list.items ?? []).map(normalizePVC)
}

export async function collectStorageClasses(context?: string): Promise<SnapshotStorageClass[]> {
  const list = await kubectlJson<ResourceList>('storageclass', { context }, false)
  return (list.items ?? []).map(normalizeStorageClass)
}
