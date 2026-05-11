export const CLUSTER_SNAPSHOT_SCHEMA_VERSION = '0.1' as const

export type ClusterSnapshotVersion = typeof CLUSTER_SNAPSHOT_SCHEMA_VERSION

export interface ClusterSnapshot {
  version: ClusterSnapshotVersion
  capturedAt: string
  clusterName?: string
  context?: string

  nodes: SnapshotNode[]
  pods: SnapshotPod[]
  workloads: SnapshotWorkload[]
  pdbs: SnapshotPDB[]
  namespaces: string[]

  pvcs?: SnapshotPVC[]
  storageClasses?: SnapshotStorageClass[]
  pricing?: SnapshotPricing
  autoscaler?: SnapshotAutoscaler
  metrics?: SnapshotMetrics
  warnings?: string[]
}

export interface SnapshotNode {
  name: string
  nodePool?: string
  instanceType?: string
  zone?: string
  labels: Record<string, string>
  taints: SnapshotTaint[]
  capacity: ResourceQuantity
  allocatable: ResourceQuantity
  maxPods: number
  conditions: NodeCondition[]
}

export interface ResourceQuantity {
  cpuMillis: number
  memoryMiB: number
}

export interface SnapshotTaint {
  key: string
  value?: string
  effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute'
}

export type NodeCondition = 'Ready' | 'MemoryPressure' | 'DiskPressure' | 'PIDPressure'

export interface SnapshotPod {
  name: string
  namespace: string
  nodeName?: string
  phase: 'Running' | 'Pending' | 'Succeeded' | 'Failed' | 'Unknown'
  ownerKind?: string
  ownerName?: string
  labels: Record<string, string>
  requests: ResourceQuantity
  nodeSelector: Record<string, string>
  tolerations: SnapshotToleration[]
  usesPVC: boolean
  usesHostPath: boolean
  usesLocalStorage: boolean
}

export interface SnapshotToleration {
  key?: string
  operator: 'Exists' | 'Equal'
  value?: string
  effect?: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute'
}

export interface SnapshotWorkload {
  name: string
  namespace: string
  kind: 'Deployment' | 'StatefulSet' | 'DaemonSet' | 'CronJob'
  replicas?: number
  labels: Record<string, string>
  podTemplate: SnapshotPodTemplate
  pdbRef?: string
  team?: string
}

export interface SnapshotPodTemplate {
  requests: ResourceQuantity
  nodeSelector: Record<string, string>
  tolerations: SnapshotToleration[]
  usesPVC?: boolean
  usesHostPath?: boolean
  usesLocalStorage?: boolean
  hasRequiredPodAntiAffinity?: boolean
  hasTopologySpreadConstraints?: boolean
  unsupportedConstraints?: string[]
}

export interface SnapshotPDB {
  name: string
  namespace: string
  minAvailable?: number | string
  maxUnavailable?: number | string
  currentHealthy: number
  desiredHealthy: number
  disruptionsAllowed: number
  selector?: LabelSelector
}

export type LabelSelector = {
  matchLabels?: Record<string, string>
}

export interface SnapshotPVC {
  name: string
  namespace: string
  storageClassName?: string
  phase?: string
  accessModes: string[]
  requestedStorageMiB?: number
  volumeName?: string
}

export interface SnapshotStorageClass {
  name: string
  provisioner: string
  reclaimPolicy?: string
  volumeBindingMode?: string
  allowVolumeExpansion?: boolean
}

export interface SnapshotPricing {
  source: 'static-catalog' | 'azure-retail' | 'aws-pricing' | 'gcp-pricing' | 'custom'
  currency: string
  nodePools: NodePoolPricing[]
}

export interface NodePoolPricing {
  nodePool: string
  instanceType: string
  hourlyCostUsd: number
  observedDailyCostUsd?: number
}

export interface SnapshotAutoscaler {
  enabled: boolean
  provider?: 'cluster-autoscaler' | 'karpenter' | 'aks-node-auto-provisioning' | 'unknown'
  nodePools: NodePoolAutoscaler[]
}

export interface NodePoolAutoscaler {
  nodePool: string
  minNodes: number
  maxNodes: number
  currentNodes: number
}

export interface SnapshotMetrics {
  nodes: SnapshotNodeMetric[]
  pods: SnapshotPodMetric[]
}

export interface SnapshotNodeMetric {
  name: string
  cpuMillis: number
  memoryMiB: number
}

export interface SnapshotPodMetric {
  namespace: string
  name: string
  cpuMillis: number
  memoryMiB: number
}
