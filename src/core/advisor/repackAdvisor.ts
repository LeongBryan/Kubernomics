import { nodeHourlyCost, simulateScenario, type NodePool, type Scenario, type SimulationResult, type Workload } from '../simulator'
import type {
  AdvisorFinding,
  AnalysisCoverage,
  DisruptionPreviewEntry,
  NodePoolRecommendation,
  RecommendationSafetyStatus,
  RepackAdvisorResult,
  WorkloadCoverageEntry,
} from './types'

const ADVISOR_ENGINE_VERSION = '0.1.0' as const
const HOURS_PER_MONTH = 24 * 30

const CHECKED_CONSTRAINTS = [
  'PodDisruptionBudget (disruptionsAllowed = 0)',
  'Required pod anti-affinity',
  'Topology spread constraints',
  'PVC storage dependencies',
  'hostPath / local storage mobility',
  'DaemonSet and platform system tax',
  'Node selector matching',
  'Taint and toleration filtering',
]

const NOT_CHECKED_CONSTRAINTS = [
  'Preferred affinity / anti-affinity rules',
  'Pod priority and preemption',
  'HorizontalPodAutoscaler (HPA) scaling behavior',
  'ResourceQuota and LimitRange enforcement',
  'PDB with percentage-based minAvailable',
  'NetworkPolicy disruption impact',
  'Karpenter / Cluster Autoscaler policy constraints',
]

const CATEGORY_LABELS: Record<AdvisorFinding['category'], string> = {
  'reclaimable-capacity': 'reclaimable capacity',
  'pending-workload': 'pending workloads',
  'pdb-blocker': 'blocking PDBs',
  'placement-constraint': 'placement constraints',
  'storage-mobility': 'storage mobility checks',
  'system-tax': 'platform tax',
  'not-analyzed': 'not analyzed',
  'unsupported-constraint': 'unsupported constraints',
}

function workloadNamespace(workload: Workload): string {
  return workload.metadata?.namespace ?? 'unknown'
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'
}

function metadataTrue(workload: Workload, key: string): boolean {
  return workload.metadata?.[key] === 'true'
}

function nonDaemonPlacementCount(node: SimulationResult['nodes'][number]): number {
  return node.placements.filter((placement) => placement.kind !== 'DaemonSet').length
}

function summarizeFindings(findings: AdvisorFinding[]): string[] {
  const groups = new Map<string, AdvisorFinding[]>()
  for (const finding of findings) {
    const key = `${finding.severity}:${finding.category}`
    groups.set(key, [...(groups.get(key) ?? []), finding])
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      const severityOrder: Record<AdvisorFinding['severity'], number> = { critical: 0, warning: 1, info: 2 }
      const [aSeverity, aCategory] = a.split(':') as [AdvisorFinding['severity'], AdvisorFinding['category']]
      const [bSeverity, bCategory] = b.split(':') as [AdvisorFinding['severity'], AdvisorFinding['category']]
      return severityOrder[aSeverity] - severityOrder[bSeverity] || CATEGORY_LABELS[aCategory].localeCompare(CATEGORY_LABELS[bCategory])
    })
    .map(([key, group]) => {
      const [severity, category] = key.split(':') as [AdvisorFinding['severity'], AdvisorFinding['category']]
      const examples = group
        .map((finding) => finding.workloadName ?? finding.nodePoolName ?? finding.title)
        .filter(Boolean)
        .slice(0, 3)
      const suffix = examples.length > 0 ? `, for example ${examples.join(', ')}${group.length > examples.length ? ', ...' : ''}` : ''
      return `${group.length} ${severity} ${CATEGORY_LABELS[category]} finding${group.length === 1 ? '' : 's'}${suffix}`
    })
}

function recommendationRelevantBlockers(blockers: AdvisorFinding[], workloads: Workload[]): AdvisorFinding[] {
  const workloadMap = new Map(workloads.map((workload) => [workload.id, workload]))
  return blockers.filter((finding) => {
    if (!finding.workloadId) return true
    const workload = workloadMap.get(finding.workloadId)
    if (!workload) return true
    return workload.kind !== 'DaemonSet'
  })
}

function daemonAndSystemCpu(node: SimulationResult['nodes'][number]): number {
  return node.placements
    .filter((placement) => placement.kind === 'DaemonSet' || placement.classification === 'platform' || placement.classification === 'system')
    .reduce((sum, placement) => sum + placement.cpuMillis, 0)
}

function daemonAndSystemMemory(node: SimulationResult['nodes'][number]): number {
  return node.placements
    .filter((placement) => placement.kind === 'DaemonSet' || placement.classification === 'platform' || placement.classification === 'system')
    .reduce((sum, placement) => sum + placement.memoryMiB, 0)
}

function emptyReclaimableNodes(result: SimulationResult, pool: NodePool): SimulationResult['nodes'] {
  return result.nodes.filter((node) => node.nodePoolId === pool.id && nonDaemonPlacementCount(node) === 0)
}

function pendingFindings(result: SimulationResult): AdvisorFinding[] {
  return result.pendingPods.map((pod) => ({
    id: `pending:${pod.podId}`,
    severity: pod.reasons.includes('NoEligibleNodes') ? 'critical' : 'warning',
    category: 'pending-workload',
    title: `${pod.workloadName} has pending pods`,
    detail: `${pod.workloadName} pod ${pod.ordinal + 1} could not be scheduled: ${pod.reasons.join(', ')}.`,
    workloadId: pod.workloadId,
    workloadName: pod.workloadName,
    reasons: pod.reasons,
  }))
}

function workloadBlockers(workload: Workload): AdvisorFinding[] {
  const findings: AdvisorFinding[] = []
  const name = workload.name

  if (workload.metadata?.pdbDisruptionsAllowed === '0') {
    findings.push({
      id: `pdb:${workload.id}`,
      severity: 'critical',
      category: 'pdb-blocker',
      title: `${name} has a blocking PDB`,
      detail: `${name} is protected by ${workload.metadata.pdbRef ?? 'a PDB'} with disruptionsAllowed=0. It cannot be safely evicted.`,
      workloadId: workload.id,
      workloadName: name,
    })
  }

  if (metadataTrue(workload, 'hasRequiredPodAntiAffinity')) {
    findings.push({
      id: `anti-affinity:${workload.id}`,
      severity: 'warning',
      category: 'placement-constraint',
      title: `${name} uses required pod anti-affinity`,
      detail: `${name} may resist repacking because required pod anti-affinity is not modeled by the simulator yet. Verify placement is safe before draining.`,
      workloadId: workload.id,
      workloadName: name,
    })
  }

  if (metadataTrue(workload, 'hasTopologySpreadConstraints')) {
    findings.push({
      id: `topology-spread:${workload.id}`,
      severity: 'warning',
      category: 'placement-constraint',
      title: `${name} uses topology spread constraints`,
      detail: `${name} may need zone or hostname spread that the simulator does not enforce yet. Repacking may violate spread requirements.`,
      workloadId: workload.id,
      workloadName: name,
    })
  }

  if (metadataTrue(workload, 'usesPVC') || metadataTrue(workload, 'usesHostPath') || metadataTrue(workload, 'usesLocalStorage')) {
    const storage = [
      metadataTrue(workload, 'usesPVC') ? 'PVC' : '',
      metadataTrue(workload, 'usesHostPath') ? 'hostPath' : '',
      metadataTrue(workload, 'usesLocalStorage') ? 'local storage' : '',
    ].filter(Boolean)
    findings.push({
      id: `storage:${workload.id}`,
      severity: metadataTrue(workload, 'usesHostPath') || metadataTrue(workload, 'usesLocalStorage') ? 'critical' : 'warning',
      category: 'storage-mobility',
      title: `${name} has storage mobility constraints`,
      detail: `${name} uses ${storage.join(', ')}. Eviction requires storage migration checks before draining; node-local storage cannot move automatically.`,
      workloadId: workload.id,
      workloadName: name,
    })
  }

  return findings
}

function unsupportedConstraintFindings(workloads: Workload[]): AdvisorFinding[] {
  return workloads.flatMap((workload) => {
    const raw = workload.metadata?.unsupportedConstraints
    if (!raw) return []
    let constraints: string[] = []
    try {
      constraints = JSON.parse(raw)
    } catch {
      constraints = [raw]
    }
    if (constraints.length === 0) return []
    return [
      {
        id: `unsupported:${workload.id}`,
        severity: 'warning',
        category: 'unsupported-constraint',
        title: `${workload.name} has constraints the analyzer cannot inspect`,
        detail: `Detected but not modeled: ${constraints.join(', ')}. Repacking this workload may violate scheduling rules not visible to the simulator.`,
        workloadId: workload.id,
        workloadName: workload.name,
      } satisfies AdvisorFinding,
    ]
  })
}

function notAnalyzedFinding(scenario: Scenario): AdvisorFinding {
  return {
    id: `not-analyzed:${scenario.id}`,
    severity: 'info',
    category: 'not-analyzed',
    title: 'Some Kubernetes constraints are not yet analyzed',
    detail:
      'Preferred affinity, priority/preemption, HPA behavior, quotas, and live disruption safety are reported only when snapshot metadata exposes them. See Analysis Coverage for the full list.',
  }
}

function systemTaxFindings(result: SimulationResult, pools: NodePool[]): AdvisorFinding[] {
  return pools.flatMap((pool) => {
    const nodes = result.nodes.filter((node) => node.nodePoolId === pool.id)
    if (nodes.length === 0) return []
    const avgCpuRatio =
      nodes.reduce((sum, node) => sum + daemonAndSystemCpu(node) / Math.max(1, node.allocatable.cpuMillis), 0) / nodes.length
    const avgMemoryRatio =
      nodes.reduce((sum, node) => sum + daemonAndSystemMemory(node) / Math.max(1, node.allocatable.memoryMiB), 0) / nodes.length
    const vcpu = pool.shape.vcpu ?? pool.shape.vCpu ?? 0
    const highTax = Math.max(avgCpuRatio, avgMemoryRatio)
    if (vcpu > 4 || highTax < 0.25) return []
    return [
      {
        id: `system-tax:${pool.id}`,
        severity: highTax >= 0.4 ? 'warning' : 'info',
        category: 'system-tax',
        title: `${pool.name} spends a high share on platform tax`,
        detail: `${pool.name} averages ${Math.round(avgCpuRatio * 100)}% CPU / ${Math.round(avgMemoryRatio * 100)}% memory consumed by DaemonSets and platform workloads. Compacting to fewer nodes increases this overhead ratio further.`,
        nodePoolId: pool.id,
        nodePoolName: pool.name,
      } satisfies AdvisorFinding,
    ]
  })
}

function buildDisruptionPreview(
  pool: NodePool,
  binPackResult: SimulationResult,
  workloads: Workload[],
  blockersByWorkloadId: Map<string, AdvisorFinding[]>,
): DisruptionPreviewEntry[] {
  const workloadMap = new Map(workloads.map((w) => [w.id, w]))
  const podCounts = new Map<string, number>()

  for (const placement of binPackResult.placements) {
    if (placement.nodePoolId !== pool.id) continue
    if (placement.kind === 'DaemonSet') continue
    podCounts.set(placement.workloadId, (podCounts.get(placement.workloadId) ?? 0) + 1)
  }

  return Array.from(podCounts.entries()).map(([workloadId, podCount]) => {
    const workload = workloadMap.get(workloadId)
    const blockers = blockersByWorkloadId.get(workloadId) ?? []
    return {
      workloadId,
      workloadName: workload?.name ?? workloadId,
      namespace: workload ? workloadNamespace(workload) : 'unknown',
      podCount,
      hasCriticalBlocker: blockers.some((b) => b.severity === 'critical'),
    }
  })
}

function buildSafety(
  reclaimableNodes: number,
  poolBlockers: AdvisorFinding[],
): { status: RecommendationSafetyStatus; explanation: string } {
  const hardBlockers = poolBlockers.filter((b) => b.severity === 'critical' && (b.category === 'pdb-blocker' || b.category === 'pending-workload'))
  const investigationBlockers = poolBlockers.filter(
    (b) => b.severity === 'critical' || b.severity === 'warning' || b.category === 'unsupported-constraint'
  )
  const summaries = summarizeFindings(investigationBlockers)

  if (reclaimableNodes === 0) {
    return {
      status: 'uncertain',
      explanation: 'No empty nodes were produced by bin-pack simulation. Nothing to reclaim in the current configuration.',
    }
  }
  if (hardBlockers.length > 0) {
    return {
      status: 'blocked',
      explanation: `${reclaimableNodes} node${reclaimableNodes === 1 ? '' : 's'} look reclaimable in simulation, but drain safety is blocked by ${summarizeFindings(hardBlockers).join('; ')}.`,
    }
  }
  if (investigationBlockers.length > 0) {
    return {
      status: 'uncertain',
      explanation: `${reclaimableNodes} node${reclaimableNodes === 1 ? '' : 's'} look reclaimable in simulation. Verify drain candidates first because this pool has ${summaries.join('; ')}.`,
    }
  }
  return {
    status: 'safe',
    explanation: `${reclaimableNodes} node${reclaimableNodes === 1 ? '' : 's'} appear safe to reclaim. No critical or unmodeled constraints were detected on workloads in this pool.`,
  }
}

function buildCoverage(workloads: Workload[]): AnalysisCoverage {
  const unsupportedConstraintWorkloads: WorkloadCoverageEntry[] = []

  for (const workload of workloads) {
    const raw = workload.metadata?.unsupportedConstraints
    let unsupported: string[] = []
    if (raw) {
      try {
        unsupported = JSON.parse(raw)
      } catch {
        unsupported = [raw]
      }
    }

    const checked: string[] = []
    if (workload.metadata?.pdbDisruptionsAllowed !== undefined) checked.push('PodDisruptionBudget')
    if (workload.metadata?.hasRequiredPodAntiAffinity !== undefined) checked.push('required pod anti-affinity')
    if (workload.metadata?.hasTopologySpreadConstraints !== undefined) checked.push('topology spread constraints')
    if (workload.metadata?.usesPVC !== undefined) checked.push('PVC storage')
    if (workload.metadata?.usesHostPath !== undefined) checked.push('hostPath storage')
    if (workload.metadata?.usesLocalStorage !== undefined) checked.push('local storage')

    if (unsupported.length > 0) {
      unsupportedConstraintWorkloads.push({
        workloadId: workload.id,
        workloadName: workload.name,
        namespace: workloadNamespace(workload),
        checkedConstraints: checked,
        unsupportedConstraints: unsupported,
      })
    }
  }

  return {
    checked: CHECKED_CONSTRAINTS,
    notChecked: NOT_CHECKED_CONSTRAINTS,
    unsupportedConstraintWorkloads,
  }
}

function recommendationForPool({
  pool,
  binPackResult,
  blockers,
  workloads,
}: {
  pool: NodePool
  binPackResult: SimulationResult
  blockers: AdvisorFinding[]
  workloads: Workload[]
}): NodePoolRecommendation {
  const reclaimableNodes = emptyReclaimableNodes(binPackResult, pool).length
  const estimatedMonthlySavings = Math.round(reclaimableNodes * nodeHourlyCost(pool) * HOURS_PER_MONTH * 100) / 100

  const poolBlockers = blockers.filter((finding) => {
    if (finding.nodePoolId === pool.id) return true
    if (!finding.workloadId) return false
    return binPackResult.placements.some((placement) => placement.workloadId === finding.workloadId && placement.nodePoolId === pool.id)
  })
  const relevantPoolBlockers = recommendationRelevantBlockers(poolBlockers, workloads)

  const blockersByWorkloadId = new Map<string, AdvisorFinding[]>()
  for (const blocker of relevantPoolBlockers) {
    if (blocker.workloadId) {
      const existing = blockersByWorkloadId.get(blocker.workloadId) ?? []
      existing.push(blocker)
      blockersByWorkloadId.set(blocker.workloadId, existing)
    }
  }

  const disruptionPreview = buildDisruptionPreview(pool, binPackResult, workloads, blockersByWorkloadId)
  const affectedNamespaces = [...new Set(disruptionPreview.map((e) => e.namespace).filter((ns) => ns !== 'unknown'))]
  const { status: safetyStatus, explanation: safetyExplanation } = buildSafety(reclaimableNodes, relevantPoolBlockers)

  const summary =
    reclaimableNodes > 0
      ? `${pool.name} can potentially reclaim ${reclaimableNodes} node${reclaimableNodes === 1 ? '' : 's'} after bin-pack simulation.`
      : `${pool.name} has no empty nodes after bin-pack simulation.`

  return {
    nodePoolId: pool.id,
    nodePoolName: pool.name,
    reclaimableNodes,
    estimatedMonthlySavings,
    summary,
    safetyStatus,
    safetyExplanation,
    blockers: relevantPoolBlockers,
    investigations: summarizeFindings(relevantPoolBlockers),
    disruptionPreview,
    affectedNamespaces,
  }
}

export function adviseRepack(scenario: Scenario, result: SimulationResult): RepackAdvisorResult {
  const binPackScenario: Scenario = { ...scenario, schedulerStrategy: 'Bin-pack' }
  const binPackResult = result.schedulerStrategy === 'Bin-pack' ? result : simulateScenario(binPackScenario)
  const workloadFindings = scenario.workloads.flatMap(workloadBlockers)
  const pending = pendingFindings(binPackResult)
  const systemTax = systemTaxFindings(binPackResult, scenario.nodePools)
  const unsupportedConstraints = unsupportedConstraintFindings(scenario.workloads)
  const notAnalyzed = [notAnalyzedFinding(scenario)]
  const findings = [...pending, ...workloadFindings, ...systemTax, ...unsupportedConstraints]
  const coverage = buildCoverage(scenario.workloads)

  const recommendations = scenario.nodePools.map((pool) =>
    recommendationForPool({ pool, binPackResult, blockers: findings, workloads: scenario.workloads })
  )
  const estimatedMonthlySavings = Math.round(recommendations.reduce((sum, rec) => sum + rec.estimatedMonthlySavings, 0) * 100) / 100

  return {
    engineVersion: ADVISOR_ENGINE_VERSION,
    scenarioId: scenario.id,
    binPackResultId: `binpack:${slug(scenario.id)}`,
    totalReclaimableNodes: recommendations.reduce((sum, rec) => sum + rec.reclaimableNodes, 0),
    estimatedMonthlySavings,
    recommendations,
    findings,
    notAnalyzed,
    coverage,
  }
}
