import { DEFAULT_CLOUD, findCatalogShape, nodeShapePatch } from '../catalogs/providers'
import { SCENARIO_SCHEMA_VERSION, type NodePool, type Scenario, type Workload, type WorkloadClassification } from '../core/simulator'
import type { ClusterSnapshot, NodePoolPricing, SnapshotNode, SnapshotTaint, SnapshotWorkload } from '../schema/clusterSnapshot'

type NodeGroup = {
  name: string
  instanceType: string
  nodes: SnapshotNode[]
}

const COLOR_BY_CLASS: Record<WorkloadClassification, string> = {
  platform: '#0284c7',
  system: '#7c3aed',
  application: '#0f766e',
}

const VOLATILE_NODE_LABEL_PREFIXES = [
  'kubernetes.io/hostname',
  'topology.kubernetes.io/',
  'failure-domain.beta.kubernetes.io/',
  'node.kubernetes.io/instance-type',
  'beta.kubernetes.io/instance-type',
]

export function isClusterSnapshot(value: unknown): value is ClusterSnapshot {
  const maybe = value as Partial<ClusterSnapshot>
  return maybe?.version === '0.1' && Array.isArray(maybe.nodes) && Array.isArray(maybe.pods) && Array.isArray(maybe.workloads)
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'
}

function resourceKey(node: SnapshotNode): string {
  return node.nodePool ?? node.instanceType ?? 'nodes'
}

function commonLabels(nodes: SnapshotNode[]): Record<string, string> {
  const [first] = nodes
  if (!first) return {}
  return Object.fromEntries(
    Object.entries(first.labels).filter(([key, value]) => {
      if (VOLATILE_NODE_LABEL_PREFIXES.some((prefix) => key === prefix || key.startsWith(prefix))) return false
      return nodes.every((node) => node.labels[key] === value)
    })
  )
}

function commonTaints(nodes: SnapshotNode[]): SnapshotTaint[] {
  const [first] = nodes
  if (!first) return []
  return first.taints.filter((taint) =>
    nodes.every((node) =>
      node.taints.some(
        (candidate) =>
          candidate.key === taint.key && candidate.value === taint.value && candidate.effect === taint.effect
      )
    )
  )
}

function groupNodes(nodes: SnapshotNode[]): NodeGroup[] {
  const groups = new Map<string, NodeGroup>()
  for (const node of nodes) {
    const name = resourceKey(node)
    const instanceType = node.instanceType ?? name
    const key = `${name}:${instanceType}`
    const existing = groups.get(key)
    if (existing) existing.nodes.push(node)
    else groups.set(key, { name, instanceType, nodes: [node] })
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name) || a.instanceType.localeCompare(b.instanceType))
}

function pricingForGroup(group: NodeGroup, pricing?: ClusterSnapshot['pricing']): NodePoolPricing | undefined {
  return pricing?.nodePools.find((entry) => entry.nodePool === group.name && entry.instanceType === group.instanceType)
}

function poolFromGroup(group: NodeGroup, pricing?: ClusterSnapshot['pricing']): NodePool {
  const region = DEFAULT_CLOUD.region
  const catalogShape = findCatalogShape(DEFAULT_CLOUD.provider, group.instanceType, region)
  const first = group.nodes[0]
  const capacity = first?.capacity ?? { cpuMillis: 0, memoryMiB: 0 }
  const allocatable = first?.allocatable ?? capacity
  const poolPricing = pricingForGroup(group, pricing)
  const shapePatch = catalogShape
    ? nodeShapePatch(catalogShape, region)
    : {
        shape: {
          id: `imported-${slug(group.instanceType)}`,
          name: group.instanceType,
          provider: DEFAULT_CLOUD.provider,
          providerSku: group.instanceType,
          region,
          vcpu: capacity.cpuMillis / 1000,
          memoryMiB: capacity.memoryMiB,
          currency: DEFAULT_CLOUD.currency,
        },
        hourlyCost: undefined,
        maxPods: first?.maxPods ?? 110,
        systemReserved: {
          cpuMillis: Math.max(0, capacity.cpuMillis - allocatable.cpuMillis),
          memoryMiB: Math.max(0, capacity.memoryMiB - allocatable.memoryMiB),
        },
        kubeReserved: { cpuMillis: 0, memoryMiB: 0 },
      }
  const hourlyCost = poolPricing?.hourlyCostUsd ?? shapePatch.hourlyCost

  return {
    id: `pool-${slug(group.name)}`,
    name: group.name,
    mode: 'manual',
    nodeCount: group.nodes.length,
    labels: commonLabels(group.nodes),
    taints: commonTaints(group.nodes),
    ...shapePatch,
    hourlyCost,
    shape: {
      ...shapePatch.shape,
      hourlyCost,
    },
    maxPods: Math.min(...group.nodes.map((node) => node.maxPods || shapePatch.maxPods || 110)),
    metadata: {
      observedNodeCount: String(group.nodes.length),
      importedInstanceType: group.instanceType,
      ...(poolPricing?.observedDailyCostUsd !== undefined
        ? { observedDailyCost: String(poolPricing.observedDailyCostUsd) }
        : {}),
    },
  }
}

function workloadClass(workload: SnapshotWorkload): WorkloadClassification {
  if (workload.kind === 'DaemonSet') return 'platform'
  if (workload.namespace === 'kube-system') return 'system'
  return 'application'
}

function workloadFromSnapshot(workload: SnapshotWorkload): Workload {
  const classification = workloadClass(workload)
  const kind = workload.kind === 'DaemonSet' ? 'DaemonSet' : 'Deployment'
  const metadata: Record<string, string> = {
    namespace: workload.namespace,
    sourceKind: workload.kind,
  }
  if (workload.pdbRef) metadata.pdbRef = workload.pdbRef
  if (workload.podTemplate.usesPVC) metadata.usesPVC = 'true'
  if (workload.podTemplate.usesHostPath) metadata.usesHostPath = 'true'
  if (workload.podTemplate.usesLocalStorage) metadata.usesLocalStorage = 'true'
  if (workload.podTemplate.hasRequiredPodAntiAffinity) metadata.hasRequiredPodAntiAffinity = 'true'
  if (workload.podTemplate.hasTopologySpreadConstraints) metadata.hasTopologySpreadConstraints = 'true'
  if (workload.podTemplate.unsupportedConstraints?.length) {
    metadata.unsupportedConstraints = workload.podTemplate.unsupportedConstraints.join(',')
  }
  return {
    id: `wl-${slug(`${workload.namespace}-${workload.name}`)}`,
    name: workload.namespace === 'default' ? workload.name : `${workload.namespace}/${workload.name}`,
    kind,
    team: workload.team ?? (classification === 'application' ? 'application' : classification),
    classification,
    color: COLOR_BY_CLASS[classification],
    resources: workload.podTemplate.requests,
    replicas: kind === 'Deployment' ? workload.replicas ?? 1 : undefined,
    nodeSelector: workload.podTemplate.nodeSelector,
    tolerations: workload.podTemplate.tolerations,
    required: kind === 'DaemonSet',
    metadata,
  }
}

export function importClusterSnapshot(snapshot: ClusterSnapshot): Scenario {
  if (!isClusterSnapshot(snapshot)) throw new Error('Expected a Kubernomics ClusterSnapshot v0.1 JSON file')
  const blockingPdbs = new Map(
    snapshot.pdbs
      .filter((pdb) => pdb.disruptionsAllowed === 0)
      .map((pdb) => [`${pdb.namespace}/${pdb.name}`, String(pdb.disruptionsAllowed)])
  )
  const workloads = snapshot.workloads.map((workload) => {
    const normalized = workloadFromSnapshot(workload)
    const pdbKey = workload.pdbRef ? `${workload.namespace}/${workload.pdbRef}` : ''
    if (blockingPdbs.has(pdbKey)) {
      return {
        ...normalized,
        metadata: {
          ...(normalized.metadata ?? {}),
          pdbDisruptionsAllowed: blockingPdbs.get(pdbKey) ?? '0',
        },
      }
    }
    return normalized
  })
  return {
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    id: `snapshot-${slug(snapshot.clusterName ?? snapshot.context ?? snapshot.capturedAt)}`,
    name: snapshot.clusterName ?? snapshot.context ?? 'Imported cluster snapshot',
    description: `Imported from cluster snapshot captured at ${snapshot.capturedAt}.`,
    cloud: DEFAULT_CLOUD,
    schedulerStrategy: 'Spread',
    nodePools: groupNodes(snapshot.nodes).map((group) => poolFromGroup(group, snapshot.pricing)),
    workloads,
    metadata: {
      source: 'cluster-snapshot',
      capturedAt: snapshot.capturedAt,
      ...(snapshot.context ? { context: snapshot.context } : {}),
    },
  }
}
