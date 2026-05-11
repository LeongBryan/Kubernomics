import type { NodeState, Placement, PodInstance, SchedulerStrategy, ScoreComponents } from '../types'

export function bindPod({
  node,
  pod,
  schedulerStrategy,
  score,
  scoreComponents,
  traceId
}: {
  node: NodeState
  pod: PodInstance
  schedulerStrategy: SchedulerStrategy
  score: number | null
  scoreComponents: ScoreComponents
  traceId: string
}): Placement {
  const placement: Placement = {
    podId: pod.id,
    workloadId: pod.workloadId,
    workloadName: pod.workloadName,
    kind: pod.kind,
    team: pod.team,
    classification: pod.classification,
    color: pod.color,
    ordinal: pod.ordinal,
    nodeId: node.id,
    nodeName: node.name,
    nodePoolId: node.nodePoolId,
    nodePoolName: node.nodePoolName,
    cpuMillis: pod.resources.cpuMillis,
    memoryMiB: pod.resources.memoryMiB,
    schedulerStrategy,
    score,
    scoreComponents,
    traceId
  }

  node.remaining.cpuMillis -= pod.resources.cpuMillis
  node.remaining.memoryMiB -= pod.resources.memoryMiB
  node.podCount += 1
  node.placements.push(placement)

  return placement
}
