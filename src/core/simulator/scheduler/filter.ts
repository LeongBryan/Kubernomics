import type { LabelSelector, NodeRejection, NodeState, PodInstance, Taint, Toleration, UnschedulableReason } from '../types'

export type FilterResult = {
  node: NodeState
  feasible: boolean
  reasons: UnschedulableReason[]
}

export function selectorMatches(selector: LabelSelector | undefined, labels: LabelSelector): boolean {
  if (!selector) return true
  return Object.entries(selector).every(([key, value]) => labels[key] === value)
}

function toleratesTaint(toleration: Toleration, taint: Taint): boolean {
  if (toleration.effect && toleration.effect !== taint.effect) return false
  if (toleration.operator === 'Exists') {
    return !toleration.key || toleration.key === taint.key
  }
  return toleration.key === taint.key && toleration.value === taint.value
}

export function toleratesNodeTaints(tolerations: Toleration[], taints: Taint[]): boolean {
  return taints
    .filter((taint) => taint.effect !== 'PreferNoSchedule')
    .every((taint) => tolerations.some((toleration) => toleratesTaint(toleration, taint)))
}

export function daemonSetExpectedOnNode(pod: PodInstance, node: NodeState): boolean {
  return selectorMatches(pod.nodeSelector, node.labels) && toleratesNodeTaints(pod.tolerations, node.taints)
}

export function filterNode(pod: PodInstance, node: NodeState): FilterResult {
  const reasons: UnschedulableReason[] = []

  if (!selectorMatches(pod.nodeSelector, node.labels)) reasons.push('NodeSelectorMismatch')
  if (!toleratesNodeTaints(pod.tolerations, node.taints)) reasons.push('UntoleratedTaint')
  if (node.remaining.cpuMillis < pod.resources.cpuMillis) reasons.push('InsufficientCpu')
  if (node.remaining.memoryMiB < pod.resources.memoryMiB) reasons.push('InsufficientMemory')
  if (node.podCount >= node.maxPods) reasons.push('MaxPodsExceeded')

  return {
    node,
    feasible: reasons.length === 0,
    reasons
  }
}

export function filterNodes(pod: PodInstance, nodes: NodeState[]): FilterResult[] {
  return nodes.map((node) => filterNode(pod, node))
}

export function toNodeRejections(results: FilterResult[]): NodeRejection[] {
  return results
    .filter((result) => !result.feasible)
    .map((result) => ({
      nodeId: result.node.id,
      nodeName: result.node.name,
      nodePoolId: result.node.nodePoolId,
      nodePoolName: result.node.nodePoolName,
      reasons: [...result.reasons]
    }))
}

export function aggregateReasons(results: FilterResult[]): UnschedulableReason[] {
  const reasons = new Set<UnschedulableReason>()
  for (const result of results) {
    for (const reason of result.reasons) reasons.add(reason)
  }
  if (reasons.size === 0) reasons.add('NoEligibleNodes')
  return [...reasons].sort()
}
