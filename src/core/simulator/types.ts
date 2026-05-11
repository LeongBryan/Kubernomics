import type { ScenarioSchemaVersion, SimulationEngineVersion } from './schemaVersions'

export type SchedulerStrategy = 'Spread' | 'Bin-pack'

export type NodePoolMode = 'manual' | 'autoscale-to-fit'

export type WorkloadKind = 'DaemonSet' | 'Deployment'

export type WorkloadClassification = 'platform' | 'system' | 'application'

export type HealthState = 'Healthy' | 'Degraded' | 'Unhealthy'

export type CloudProvider = 'azure' | 'aws' | 'gcp' | 'custom'

export type CurrencyCode = 'USD' | 'EUR' | 'SGD'

export type ScenarioCloudSettings = {
  provider: CloudProvider
  region: string
  currency: CurrencyCode
}

export type ResourceRequest = {
  cpuMillis: number
  memoryMiB: number
}

export type Taint = {
  key: string
  value?: string
  effect: 'NoSchedule' | 'NoExecute' | 'PreferNoSchedule'
}

export type Toleration = {
  key?: string
  operator: 'Exists' | 'Equal'
  value?: string
  effect?: Taint['effect']
}

export type LabelSelector = Record<string, string>

export type NodeShape = {
  id: string
  name: string
  provider?: CloudProvider | string
  providerSku?: string
  region: string
  sku?: string
  vcpu: number
  vCpu?: number
  memoryMiB: number
  hourlyCost?: number
  currency?: CurrencyCode | string
}

export type NodePool = {
  id: string
  name: string
  mode: NodePoolMode
  nodeCount?: number
  initialNodes?: number
  minNodes?: number
  maxNodes?: number
  shape: NodeShape
  hourlyCost?: number
  labels: LabelSelector
  taints: Taint[]
  maxPods: number
  systemReserved: ResourceRequest
  kubeReserved: ResourceRequest
  metadata?: Record<string, string>
}

export type Workload = {
  id: string
  name: string
  kind: WorkloadKind
  team: string
  classification: WorkloadClassification
  color: string
  resources: ResourceRequest
  replicas?: number
  nodeSelector: LabelSelector
  tolerations: Toleration[]
  required?: boolean
  metadata?: Record<string, string>
}

export type Scenario = {
  schemaVersion: ScenarioSchemaVersion
  id: string
  name: string
  description: string
  cloud: ScenarioCloudSettings
  schedulerStrategy: SchedulerStrategy
  nodePools: NodePool[]
  workloads: Workload[]
  baselineId?: string
  metadata?: Record<string, string>
}

export type PodInstance = {
  id: string
  workloadId: string
  workloadName: string
  kind: WorkloadKind
  team: string
  classification: WorkloadClassification
  ordinal: number
  resources: ResourceRequest
  nodeSelector: LabelSelector
  tolerations: Toleration[]
  required: boolean
  color: string
}

export type UnschedulableReason =
  | 'InsufficientCpu'
  | 'InsufficientMemory'
  | 'MaxPodsExceeded'
  | 'NodeSelectorMismatch'
  | 'UntoleratedTaint'
  | 'NodePoolMaxNodesReached'
  | 'NoEligibleNodes'
  | 'DaemonSetRequiredButUnschedulable'

export type ScoreComponents = Record<string, number>

export type Placement = {
  podId: string
  workloadId: string
  workloadName: string
  kind: WorkloadKind
  team: string
  classification: WorkloadClassification
  color: string
  ordinal: number
  nodeId: string
  nodeName: string
  nodePoolId: string
  nodePoolName: string
  cpuMillis: number
  memoryMiB: number
  schedulerStrategy: SchedulerStrategy
  score: number | null
  scoreComponents: ScoreComponents
  traceId: string
}

export type NodeRejection = {
  nodeId: string
  nodeName: string
  nodePoolId: string
  nodePoolName: string
  reasons: UnschedulableReason[]
}

export type PendingPod = {
  podId: string
  workloadId: string
  workloadName: string
  ordinal: number
  reasons: UnschedulableReason[]
  nodeRejections: NodeRejection[]
  autoscaleAttempted: boolean
}

export type NodeState = {
  id: string
  name: string
  nodePoolId: string
  nodePoolName: string
  ordinal: number
  shapeName: string
  hourlyCost: number
  capacity: ResourceRequest
  allocatable: ResourceRequest
  reserved: ResourceRequest
  remaining: ResourceRequest
  labels: LabelSelector
  taints: Taint[]
  maxPods: number
  podCount: number
  addedByAutoscaler: boolean
  placements: Placement[]
}

export type NodeResult = Omit<NodeState, 'remaining'> & {
  used: ResourceRequest
  unused: ResourceRequest
}

export type WorkloadHealth = {
  workloadId: string
  workloadName: string
  kind: WorkloadKind
  team: string
  classification: WorkloadClassification
  color: string
  desiredPods: number
  scheduledPods: number
  pendingPods: number
  state: HealthState
  unschedulableReasons: UnschedulableReason[]
}

export type AutoscalingRecord = {
  nodePoolId: string
  nodePoolName: string
  mode: NodePoolMode
  initialNodes: number
  finalNodes: number
  addedNodes: number
  hourlyCostImpact: number
}

export type CapacitySummary = {
  total: ResourceRequest
  allocatable: ResourceRequest
  reserved: ResourceRequest
  daemonSetTax: ResourceRequest
  application: ResourceRequest
  platformAndSystem: ResourceRequest
  unused: ResourceRequest
}

export type CostBucket = {
  id: string
  name: string
  hourly: number
}

export type CostSummary = {
  hourly: number
  daily: number
  monthly: number
  byNodePool: CostBucket[]
  byTeam: CostBucket[]
  systemTaxHourly: number
  unusedCapacityHourly: number
  addedNodesHourly: number
}

export type TraceEvent = {
  id: string
  type: 'filter' | 'score' | 'bind' | 'autoscale' | 'pending' | 'daemonset'
  message: string
}

export type SimulationResult = {
  scenarioId: string
  engineVersion: SimulationEngineVersion
  schedulerStrategy: SchedulerStrategy
  nodes: NodeResult[]
  placements: Placement[]
  pendingPods: PendingPod[]
  workloadHealth: WorkloadHealth[]
  capacitySummary: CapacitySummary
  costSummary: CostSummary
  autoscalingSummary: AutoscalingRecord[]
  trace: TraceEvent[]
}
