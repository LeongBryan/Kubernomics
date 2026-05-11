import type {
  LabelSelector,
  NodeCondition,
  ResourceQuantity,
  SnapshotNode,
  SnapshotPDB,
  SnapshotPVC,
  SnapshotPod,
  SnapshotPodMetric,
  SnapshotStorageClass,
  SnapshotTaint,
  SnapshotToleration,
  SnapshotWorkload,
  SnapshotNodeMetric,
} from '../schema/cluster-snapshot.js'

type K8sObject = Record<string, any>

const NODE_CONDITIONS = new Set<NodeCondition>(['Ready', 'MemoryPressure', 'DiskPressure', 'PIDPressure'])

export function parseCpuMillis(value: unknown): number {
  if (value === undefined || value === null) return 0
  const text = String(value).trim()
  if (!text) return 0
  if (text.endsWith('n')) return Math.ceil(Number(text.slice(0, -1)) / 1_000_000)
  if (text.endsWith('u')) return Math.ceil(Number(text.slice(0, -1)) / 1000)
  if (text.endsWith('m')) return Math.round(Number(text.slice(0, -1)))
  return Math.round(Number(text) * 1000)
}

export function parseMemoryMiB(value: unknown): number {
  if (value === undefined || value === null) return 0
  const text = String(value).trim()
  if (!text) return 0
  const match = text.match(/^([0-9.]+)([a-zA-Z]+)?$/)
  if (!match) return 0
  const amount = Number(match[1])
  const unit = match[2] ?? ''
  const factors: Record<string, number> = {
    Ki: 1 / 1024,
    Mi: 1,
    Gi: 1024,
    Ti: 1024 * 1024,
    K: 1000 / 1024 / 1024,
    M: 1000 * 1000 / 1024 / 1024,
    G: 1000 * 1000 * 1000 / 1024 / 1024,
    T: 1000 * 1000 * 1000 * 1000 / 1024 / 1024,
  }
  return Math.round(amount * (factors[unit] ?? 1 / 1024 / 1024))
}

function labelsOf(item: K8sObject): Record<string, string> {
  return { ...(item.metadata?.labels ?? {}) }
}

function normalizeTaint(taint: K8sObject): SnapshotTaint | null {
  if (!taint.key || !taint.effect) return null
  if (!['NoSchedule', 'PreferNoSchedule', 'NoExecute'].includes(taint.effect)) return null
  return {
    key: String(taint.key),
    ...(taint.value !== undefined ? { value: String(taint.value) } : {}),
    effect: taint.effect,
  }
}

function normalizeToleration(toleration: K8sObject): SnapshotToleration {
  return {
    ...(toleration.key !== undefined ? { key: String(toleration.key) } : {}),
    operator: toleration.operator === 'Equal' ? 'Equal' : 'Exists',
    ...(toleration.value !== undefined ? { value: String(toleration.value) } : {}),
    ...(toleration.effect !== undefined ? { effect: toleration.effect } : {}),
  }
}

function podSpecRequests(spec: K8sObject = {}): ResourceQuantity {
  const containers = Array.isArray(spec.containers) ? spec.containers : []
  const initContainers = Array.isArray(spec.initContainers) ? spec.initContainers : []
  const appRequests = containers.reduce(
    (sum, container) => ({
      cpuMillis: sum.cpuMillis + parseCpuMillis(container.resources?.requests?.cpu),
      memoryMiB: sum.memoryMiB + parseMemoryMiB(container.resources?.requests?.memory),
    }),
    { cpuMillis: 0, memoryMiB: 0 }
  )
  const initRequests = initContainers.reduce(
    (max, container) => ({
      cpuMillis: Math.max(max.cpuMillis, parseCpuMillis(container.resources?.requests?.cpu)),
      memoryMiB: Math.max(max.memoryMiB, parseMemoryMiB(container.resources?.requests?.memory)),
    }),
    { cpuMillis: 0, memoryMiB: 0 }
  )
  return {
    cpuMillis: Math.max(appRequests.cpuMillis, initRequests.cpuMillis),
    memoryMiB: Math.max(appRequests.memoryMiB, initRequests.memoryMiB),
  }
}

function volumeFlags(spec: K8sObject = {}) {
  const volumes = Array.isArray(spec.volumes) ? spec.volumes : []
  return {
    usesPVC: volumes.some((volume: K8sObject) => Boolean(volume.persistentVolumeClaim)),
    usesHostPath: volumes.some((volume: K8sObject) => Boolean(volume.hostPath)),
    usesLocalStorage: volumes.some((volume: K8sObject) => Boolean(volume.emptyDir) || Boolean(volume.ephemeral)),
  }
}

function unsupportedConstraints(spec: K8sObject = {}): string[] {
  const constraints: string[] = []
  if (Array.isArray(spec.affinity?.podAntiAffinity?.requiredDuringSchedulingIgnoredDuringExecution)) {
    constraints.push('required-pod-anti-affinity')
  }
  if (Array.isArray(spec.affinity?.podAffinity?.requiredDuringSchedulingIgnoredDuringExecution)) {
    constraints.push('required-pod-affinity')
  }
  if (Array.isArray(spec.topologySpreadConstraints) && spec.topologySpreadConstraints.length > 0) {
    constraints.push('topology-spread-constraints')
  }
  return constraints
}

function podTemplate(item: K8sObject): K8sObject {
  if (item.kind === 'CronJob') return item.spec?.jobTemplate?.spec?.template ?? {}
  return item.spec?.template ?? {}
}

function inferNodePool(labels: Record<string, string>): string | undefined {
  return (
    labels['kubernetes.azure.com/agentpool'] ??
    labels.agentpool ??
    labels['eks.amazonaws.com/nodegroup'] ??
    labels['cloud.google.com/gke-nodepool'] ??
    labels['karpenter.sh/nodepool']
  )
}

function inferTeam(labels: Record<string, string>): string | undefined {
  return labels.team ?? labels['app.kubernetes.io/part-of'] ?? labels.owner
}

function selectorOf(item: K8sObject): LabelSelector | undefined {
  const selector = item.spec?.selector
  if (!selector) return undefined
  if (selector.matchLabels) return { matchLabels: { ...selector.matchLabels } }
  return undefined
}

export function selectorMatches(selector: LabelSelector | undefined, labels: Record<string, string>): boolean {
  if (!selector?.matchLabels) return false
  return Object.entries(selector.matchLabels).every(([key, value]) => labels[key] === value)
}

export function normalizeNode(item: K8sObject): SnapshotNode {
  const labels = labelsOf(item)
  const capacity = item.status?.capacity ?? {}
  const allocatable = item.status?.allocatable ?? {}
  const conditions = (item.status?.conditions ?? [])
    .filter((condition: K8sObject) => condition.status === 'True' && NODE_CONDITIONS.has(condition.type))
    .map((condition: K8sObject) => condition.type as NodeCondition)

  return {
    name: item.metadata?.name ?? 'unknown-node',
    nodePool: inferNodePool(labels),
    instanceType: labels['node.kubernetes.io/instance-type'] ?? labels['beta.kubernetes.io/instance-type'],
    zone: labels['topology.kubernetes.io/zone'] ?? labels['failure-domain.beta.kubernetes.io/zone'],
    labels,
    taints: (item.spec?.taints ?? []).map(normalizeTaint).filter(Boolean),
    capacity: {
      cpuMillis: parseCpuMillis(capacity.cpu),
      memoryMiB: parseMemoryMiB(capacity.memory),
    },
    allocatable: {
      cpuMillis: parseCpuMillis(allocatable.cpu),
      memoryMiB: parseMemoryMiB(allocatable.memory),
    },
    maxPods: Number(allocatable.pods ?? capacity.pods ?? 110),
    conditions,
  }
}

export function normalizePod(item: K8sObject): SnapshotPod {
  const spec = item.spec ?? {}
  const volumes = volumeFlags(spec)
  const owner = Array.isArray(item.metadata?.ownerReferences) ? item.metadata.ownerReferences[0] : undefined
  return {
    name: item.metadata?.name ?? 'unknown-pod',
    namespace: item.metadata?.namespace ?? 'default',
    ...(spec.nodeName ? { nodeName: spec.nodeName } : {}),
    phase: item.status?.phase ?? 'Unknown',
    ...(owner?.kind ? { ownerKind: owner.kind } : {}),
    ...(owner?.name ? { ownerName: owner.name } : {}),
    labels: labelsOf(item),
    requests: podSpecRequests(spec),
    nodeSelector: { ...(spec.nodeSelector ?? {}) },
    tolerations: (spec.tolerations ?? []).map(normalizeToleration),
    ...volumes,
  }
}

export function normalizeWorkload(item: K8sObject): SnapshotWorkload {
  const template = podTemplate(item)
  const metadataLabels = labelsOf(item)
  const templateLabels = { ...(template.metadata?.labels ?? {}) }
  const spec = template.spec ?? {}
  const constraints = unsupportedConstraints(spec)
  return {
    name: item.metadata?.name ?? 'unknown-workload',
    namespace: item.metadata?.namespace ?? 'default',
    kind: item.kind,
    ...(item.kind !== 'DaemonSet' ? { replicas: item.spec?.replicas ?? 1 } : {}),
    labels: templateLabels,
    podTemplate: {
      requests: podSpecRequests(spec),
      nodeSelector: { ...(spec.nodeSelector ?? {}) },
      tolerations: (spec.tolerations ?? []).map(normalizeToleration),
      ...volumeFlags(spec),
      hasRequiredPodAntiAffinity: constraints.includes('required-pod-anti-affinity'),
      hasTopologySpreadConstraints: constraints.includes('topology-spread-constraints'),
      unsupportedConstraints: constraints,
    },
    team: inferTeam({ ...metadataLabels, ...templateLabels }),
  }
}

export function normalizePDB(item: K8sObject): SnapshotPDB {
  return {
    name: item.metadata?.name ?? 'unknown-pdb',
    namespace: item.metadata?.namespace ?? 'default',
    ...(item.spec?.minAvailable !== undefined ? { minAvailable: item.spec.minAvailable } : {}),
    ...(item.spec?.maxUnavailable !== undefined ? { maxUnavailable: item.spec.maxUnavailable } : {}),
    currentHealthy: item.status?.currentHealthy ?? 0,
    desiredHealthy: item.status?.desiredHealthy ?? 0,
    disruptionsAllowed: item.status?.disruptionsAllowed ?? 0,
    selector: selectorOf(item),
  }
}

export function normalizePVC(item: K8sObject): SnapshotPVC {
  return {
    name: item.metadata?.name ?? 'unknown-pvc',
    namespace: item.metadata?.namespace ?? 'default',
    storageClassName: item.spec?.storageClassName,
    phase: item.status?.phase,
    accessModes: item.spec?.accessModes ?? [],
    requestedStorageMiB: parseMemoryMiB(item.spec?.resources?.requests?.storage),
    volumeName: item.spec?.volumeName,
  }
}

export function normalizeStorageClass(item: K8sObject): SnapshotStorageClass {
  return {
    name: item.metadata?.name ?? 'unknown-storageclass',
    provisioner: item.provisioner ?? 'unknown',
    reclaimPolicy: item.reclaimPolicy,
    volumeBindingMode: item.volumeBindingMode,
    allowVolumeExpansion: item.allowVolumeExpansion,
  }
}

export function parseNodeMetrics(raw: string): SnapshotNodeMetric[] {
  return raw
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [name, cpu, memory] = line.trim().split(/\s+/)
      return { name, cpuMillis: parseCpuMillis(cpu), memoryMiB: parseMemoryMiB(memory) }
    })
}

export function parsePodMetrics(raw: string): SnapshotPodMetric[] {
  return raw
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [namespace, name, cpu, memory] = line.trim().split(/\s+/)
      return { namespace, name, cpuMillis: parseCpuMillis(cpu), memoryMiB: parseMemoryMiB(memory) }
    })
}
