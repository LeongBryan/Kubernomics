import { bindPod } from './scheduler/bind'
import { aggregateReasons, daemonSetExpectedOnNode, filterNode, filterNodes, toNodeRejections } from './scheduler/filter'
import { chooseNode } from './scheduler/score'
import type {
  AutoscalingRecord,
  CapacitySummary,
  NodePool,
  NodeResult,
  NodeState,
  PendingPod,
  Placement,
  PodInstance,
  Scenario,
  SimulationResult,
  TraceEvent,
  UnschedulableReason,
  Workload
} from './types'
import { computeCost } from './cost'
import { computeWorkloadHealth } from './health'
import { nodeHourlyCost } from './pricing'
import { SIMULATION_ENGINE_VERSION } from './schemaVersions'

function emptyResources() {
  return { cpuMillis: 0, memoryMiB: 0 }
}

function addResources(target: { cpuMillis: number; memoryMiB: number }, source: { cpuMillis: number; memoryMiB: number }) {
  target.cpuMillis += source.cpuMillis
  target.memoryMiB += source.memoryMiB
}

function poolInitialCount(pool: NodePool): number {
  if (pool.mode === 'manual') return pool.nodeCount ?? 0
  return pool.initialNodes ?? pool.minNodes ?? 0
}

function poolMaxCount(pool: NodePool): number {
  if (pool.mode === 'manual') return pool.nodeCount ?? 0
  return pool.maxNodes ?? pool.initialNodes ?? pool.minNodes ?? 0
}

function materializeNode(pool: NodePool, ordinal: number, addedByAutoscaler: boolean): NodeState {
  const capacity = {
    cpuMillis: (pool.shape.vcpu ?? pool.shape.vCpu ?? 0) * 1000,
    memoryMiB: pool.shape.memoryMiB
  }
  const reserved = {
    cpuMillis: pool.systemReserved.cpuMillis + pool.kubeReserved.cpuMillis,
    memoryMiB: pool.systemReserved.memoryMiB + pool.kubeReserved.memoryMiB
  }
  const allocatable = {
    cpuMillis: capacity.cpuMillis - reserved.cpuMillis,
    memoryMiB: capacity.memoryMiB - reserved.memoryMiB
  }

  return {
    id: `${pool.id}-${ordinal}`,
    name: `${pool.name}-${ordinal + 1}`,
    nodePoolId: pool.id,
    nodePoolName: pool.name,
    ordinal,
    shapeName: pool.shape.name,
    hourlyCost: nodeHourlyCost(pool),
    capacity,
    allocatable,
    reserved,
    remaining: { ...allocatable },
    labels: { ...pool.labels },
    taints: [...pool.taints],
    maxPods: pool.maxPods,
    podCount: 0,
    addedByAutoscaler,
    placements: []
  }
}

function materializeInitialNodes(pools: NodePool[]): NodeState[] {
  return pools.flatMap((pool) =>
    Array.from({ length: poolInitialCount(pool) }, (_, index) => materializeNode(pool, index, false))
  )
}

function deploymentPriority(workload: Workload): number {
  if (workload.classification === 'platform') return 0
  if (workload.classification === 'system') return 1
  return 2
}

function createPod(workload: Workload, ordinal: number, idSuffix = `${ordinal}`): PodInstance {
  return {
    id: `${workload.id}-${idSuffix}`,
    workloadId: workload.id,
    workloadName: workload.name,
    kind: workload.kind,
    team: workload.team,
    classification: workload.classification,
    ordinal,
    resources: workload.resources,
    nodeSelector: workload.nodeSelector,
    tolerations: workload.tolerations,
    required: workload.required ?? workload.kind === 'DaemonSet',
    color: workload.color
  }
}

function addPendingPod({
  pendingPods,
  pod,
  reasons,
  nodeRejections,
  autoscaleAttempted
}: {
  pendingPods: PendingPod[]
  pod: PodInstance
  reasons: UnschedulableReason[]
  nodeRejections: PendingPod['nodeRejections']
  autoscaleAttempted: boolean
}): void {
  pendingPods.push({
    podId: pod.id,
    workloadId: pod.workloadId,
    workloadName: pod.workloadName,
    ordinal: pod.ordinal,
    reasons: [...new Set(reasons)].sort(),
    nodeRejections,
    autoscaleAttempted
  })
}

function scheduleDaemonSetsOnNode({
  node,
  daemonSets,
  desiredPods,
  placements,
  pendingPods,
  trace,
  strategy
}: {
  node: NodeState
  daemonSets: Workload[]
  desiredPods: Map<string, number>
  placements: Placement[]
  pendingPods: PendingPod[]
  trace: TraceEvent[]
  strategy: Scenario['schedulerStrategy']
}): void {
  for (const workload of daemonSets) {
    const pod = createPod(workload, desiredPods.get(workload.id) ?? 0, node.id)
    if (!daemonSetExpectedOnNode(pod, node)) continue

    desiredPods.set(workload.id, (desiredPods.get(workload.id) ?? 0) + 1)
    const result = filterNode(pod, node)

    if (!result.feasible) {
      const reasons: UnschedulableReason[] = workload.required
        ? [...result.reasons, 'DaemonSetRequiredButUnschedulable']
        : result.reasons
      addPendingPod({
        pendingPods,
        pod,
        reasons,
        nodeRejections: toNodeRejections([result]),
        autoscaleAttempted: false
      })
      trace.push({
        id: `daemonset-pending:${pod.id}`,
        type: 'daemonset',
        message: `${workload.name} could not run on ${node.name}: ${reasons.join(', ')}`
      })
      continue
    }

    const placement = bindPod({
      node,
      pod,
      schedulerStrategy: strategy,
      score: null,
      scoreComponents: {},
      traceId: `daemonset:${pod.id}:${node.id}`
    })
    placements.push(placement)
    trace.push({
      id: placement.traceId,
      type: 'daemonset',
      message: `${workload.name} scheduled on ${node.name} as DaemonSet tax`
    })
  }
}

function scheduleDaemonSetsOnNodes(args: Omit<Parameters<typeof scheduleDaemonSetsOnNode>[0], 'node'> & { nodes: NodeState[] }): void {
  for (const node of args.nodes) scheduleDaemonSetsOnNode({ ...args, node })
}

function nodeResult(node: NodeState): NodeResult {
  return {
    ...node,
    used: {
      cpuMillis: node.allocatable.cpuMillis - node.remaining.cpuMillis,
      memoryMiB: node.allocatable.memoryMiB - node.remaining.memoryMiB
    },
    unused: {
      cpuMillis: node.remaining.cpuMillis,
      memoryMiB: node.remaining.memoryMiB
    }
  }
}

function computeCapacitySummary(nodes: NodeResult[]): CapacitySummary {
  const summary: CapacitySummary = {
    total: emptyResources(),
    allocatable: emptyResources(),
    reserved: emptyResources(),
    daemonSetTax: emptyResources(),
    application: emptyResources(),
    platformAndSystem: emptyResources(),
    unused: emptyResources()
  }

  for (const node of nodes) {
    addResources(summary.total, node.capacity)
    addResources(summary.allocatable, node.allocatable)
    addResources(summary.reserved, node.reserved)
    addResources(summary.unused, node.unused)
    for (const placement of node.placements) {
      if (placement.kind === 'DaemonSet') addResources(summary.daemonSetTax, placement)
      else if (placement.classification === 'application') addResources(summary.application, placement)
      else addResources(summary.platformAndSystem, placement)
    }
  }

  return summary
}

function currentPoolCount(nodes: NodeState[], poolId: string): number {
  return nodes.filter((node) => node.nodePoolId === poolId).length
}

function selectAutoscalePool({
  scenario,
  nodes,
  pod,
  daemonSets
}: {
  scenario: Scenario
  nodes: NodeState[]
  pod: PodInstance
  daemonSets: Workload[]
}): NodePool | null {
  for (const pool of scenario.nodePools) {
    if (pool.mode !== 'autoscale-to-fit') continue
    if (currentPoolCount(nodes, pool.id) >= poolMaxCount(pool)) continue

    const candidate = materializeNode(pool, currentPoolCount(nodes, pool.id), true)
    const desiredPods = new Map<string, number>()
    const pendingPods: PendingPod[] = []
    const placements: Placement[] = []
    const trace: TraceEvent[] = []
    scheduleDaemonSetsOnNode({
      node: candidate,
      daemonSets,
      desiredPods,
      placements,
      pendingPods,
      trace,
      strategy: scenario.schedulerStrategy
    })
    if (filterNode(pod, candidate).feasible) return pool
  }
  return null
}

function autoscalingSummary(scenario: Scenario, nodes: NodeResult[]): AutoscalingRecord[] {
  return scenario.nodePools.map((pool) => {
    const initialNodes = poolInitialCount(pool)
    const finalNodes = nodes.filter((node) => node.nodePoolId === pool.id).length
    const addedNodes = Math.max(0, finalNodes - initialNodes)
    return {
      nodePoolId: pool.id,
      nodePoolName: pool.name,
      mode: pool.mode,
      initialNodes,
      finalNodes,
      addedNodes,
      hourlyCostImpact: Math.round(addedNodes * nodeHourlyCost(pool) * 100) / 100
    }
  })
}

export function simulateScenario(scenario: Scenario): SimulationResult {
  const nodes = materializeInitialNodes(scenario.nodePools)
  const daemonSets = scenario.workloads
    .filter((workload) => workload.kind === 'DaemonSet')
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
  const deployments = scenario.workloads
    .filter((workload) => workload.kind === 'Deployment')
    .sort((a, b) => deploymentPriority(a) - deploymentPriority(b) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
  const desiredPods = new Map<string, number>()
  const placements: Placement[] = []
  const pendingPods: PendingPod[] = []
  const trace: TraceEvent[] = []

  for (const deployment of deployments) desiredPods.set(deployment.id, deployment.replicas ?? 0)
  for (const daemonSet of daemonSets) desiredPods.set(daemonSet.id, 0)

  scheduleDaemonSetsOnNodes({
    nodes,
    daemonSets,
    desiredPods,
    placements,
    pendingPods,
    trace,
    strategy: scenario.schedulerStrategy
  })

  for (const workload of deployments) {
    for (let ordinal = 0; ordinal < (workload.replicas ?? 0); ordinal += 1) {
      const pod = createPod(workload, ordinal)
      let filterResults = filterNodes(pod, nodes)
      let feasibleNodes = filterResults.filter((result) => result.feasible).map((result) => result.node)
      let autoscaleAttempted = false

      if (feasibleNodes.length === 0) {
        const pool = selectAutoscalePool({ scenario, nodes, pod, daemonSets })
        autoscaleAttempted = scenario.nodePools.some((nodePool) => nodePool.mode === 'autoscale-to-fit')

        if (pool) {
          const node = materializeNode(pool, currentPoolCount(nodes, pool.id), true)
          nodes.push(node)
          trace.push({
            id: `autoscale:${pod.id}:${node.id}`,
            type: 'autoscale',
            message: `Added ${node.name} because no existing node could fit ${pod.workloadName}`
          })
          scheduleDaemonSetsOnNode({
            node,
            daemonSets,
            desiredPods,
            placements,
            pendingPods,
            trace,
            strategy: scenario.schedulerStrategy
          })
          filterResults = filterNodes(pod, nodes)
          feasibleNodes = filterResults.filter((result) => result.feasible).map((result) => result.node)
        }
      }

      if (feasibleNodes.length === 0) {
        const reasons = aggregateReasons(filterResults)
        if (
          autoscaleAttempted &&
          scenario.nodePools.some(
            (pool) => pool.mode === 'autoscale-to-fit' && currentPoolCount(nodes, pool.id) >= poolMaxCount(pool)
          )
        ) {
          reasons.push('NodePoolMaxNodesReached')
        }
        addPendingPod({
          pendingPods,
          pod,
          reasons,
          nodeRejections: toNodeRejections(filterResults),
          autoscaleAttempted
        })
        trace.push({
          id: `pending:${pod.id}`,
          type: 'pending',
          message: `${pod.workloadName} pod ${ordinal + 1} remained pending: ${[...new Set(reasons)].sort().join(', ')}`
        })
        continue
      }

      const choice = chooseNode(pod, feasibleNodes, scenario.schedulerStrategy)
      trace.push({
        id: choice.traceId,
        type: 'score',
        message: `${pod.workloadName} pod ${ordinal + 1} selected ${choice.node.name} with ${scenario.schedulerStrategy} score ${choice.score}`
      })
      const placement = bindPod({
        node: choice.node,
        pod,
        schedulerStrategy: scenario.schedulerStrategy,
        score: choice.score,
        scoreComponents: choice.components,
        traceId: choice.traceId
      })
      placements.push(placement)
      trace.push({
        id: `bind:${pod.id}:${choice.node.id}`,
        type: 'bind',
        message: `${pod.workloadName} pod ${ordinal + 1} bound to ${choice.node.name}`
      })
    }
  }

  const nodeResults = nodes.map(nodeResult)
  const capacitySummary = computeCapacitySummary(nodeResults)

  return {
    scenarioId: scenario.id,
    engineVersion: SIMULATION_ENGINE_VERSION,
    schedulerStrategy: scenario.schedulerStrategy,
    nodes: nodeResults,
    placements,
    pendingPods,
    workloadHealth: computeWorkloadHealth({ workloads: scenario.workloads, placements, pendingPods, desiredPods }),
    capacitySummary,
    costSummary: computeCost(nodeResults, placements),
    autoscalingSummary: autoscalingSummary(scenario, nodeResults),
    trace
  }
}
