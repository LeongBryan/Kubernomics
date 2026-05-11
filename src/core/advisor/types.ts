import type { UnschedulableReason } from '../simulator'

export type AdvisorSeverity = 'info' | 'warning' | 'critical'

export type AdvisorCategory =
  | 'reclaimable-capacity'
  | 'pending-workload'
  | 'pdb-blocker'
  | 'placement-constraint'
  | 'storage-mobility'
  | 'system-tax'
  | 'not-analyzed'
  | 'unsupported-constraint'

export type AdvisorFinding = {
  id: string
  severity: AdvisorSeverity
  category: AdvisorCategory
  title: string
  detail: string
  nodePoolId?: string
  nodePoolName?: string
  workloadId?: string
  workloadName?: string
  reasons?: UnschedulableReason[]
  monthlySavings?: number
}

export type RecommendationSafetyStatus = 'safe' | 'blocked' | 'uncertain'

export type DisruptionPreviewEntry = {
  workloadId: string
  workloadName: string
  namespace: string
  podCount: number
  hasCriticalBlocker: boolean
}

export type NodePoolRecommendation = {
  nodePoolId: string
  nodePoolName: string
  reclaimableNodes: number
  estimatedMonthlySavings: number
  summary: string
  safetyStatus: RecommendationSafetyStatus
  safetyExplanation: string
  blockers: AdvisorFinding[]
  investigations: string[]
  disruptionPreview: DisruptionPreviewEntry[]
  affectedNamespaces: string[]
}

export type WorkloadCoverageEntry = {
  workloadId: string
  workloadName: string
  namespace: string
  checkedConstraints: string[]
  unsupportedConstraints: string[]
}

export type AnalysisCoverage = {
  checked: string[]
  notChecked: string[]
  unsupportedConstraintWorkloads: WorkloadCoverageEntry[]
}

export type RepackAdvisorResult = {
  engineVersion: '0.1.0'
  scenarioId: string
  binPackResultId: string
  totalReclaimableNodes: number
  estimatedMonthlySavings: number
  recommendations: NodePoolRecommendation[]
  findings: AdvisorFinding[]
  notAnalyzed: AdvisorFinding[]
  coverage: AnalysisCoverage
}
