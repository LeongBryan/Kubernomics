import type { NodeState, PodInstance, SchedulerStrategy, ScoreComponents } from '../types'

export type NodeScore = {
  node: NodeState
  score: number
  components: ScoreComponents
}

export type NodeChoice = NodeScore & {
  feasibleNodeCount: number
  traceId: string
}

function ratio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return numerator / denominator
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000
}

function nonDaemonPodCount(node: NodeState): number {
  return node.placements.filter((placement) => placement.kind !== 'DaemonSet').length
}

function projectedImbalance(pod: PodInstance, node: NodeState): number {
  const usedCpu = node.allocatable.cpuMillis - node.remaining.cpuMillis + pod.resources.cpuMillis
  const usedMemory = node.allocatable.memoryMiB - node.remaining.memoryMiB + pod.resources.memoryMiB
  return Math.abs(ratio(usedCpu, node.allocatable.cpuMillis) - ratio(usedMemory, node.allocatable.memoryMiB))
}

export function scoreNode(pod: PodInstance, node: NodeState, strategy: SchedulerStrategy): NodeScore {
  const remainingCpuAfter = node.remaining.cpuMillis - pod.resources.cpuMillis
  const remainingMemoryAfter = node.remaining.memoryMiB - pod.resources.memoryMiB
  const usedCpuAfter = node.allocatable.cpuMillis - remainingCpuAfter
  const usedMemoryAfter = node.allocatable.memoryMiB - remainingMemoryAfter

  if (strategy === 'Bin-pack') {
    const cpuFillScore = ratio(usedCpuAfter, node.allocatable.cpuMillis)
    const memoryFillScore = ratio(usedMemoryAfter, node.allocatable.memoryMiB)
    const alreadyUsedBonus = nonDaemonPodCount(node) > 0 ? 0.08 : 0
    const emptyNodePenalty = nonDaemonPodCount(node) === 0 ? 0.04 : 0
    const score = (cpuFillScore + memoryFillScore) / 2 + alreadyUsedBonus - emptyNodePenalty

    return {
      node,
      score: round(score),
      components: {
        cpuFillScore: round(cpuFillScore),
        memoryFillScore: round(memoryFillScore),
        alreadyUsedBonus,
        emptyNodePenalty
      }
    }
  }

  const cpuHeadroomScore = ratio(remainingCpuAfter, node.allocatable.cpuMillis)
  const memoryHeadroomScore = ratio(remainingMemoryAfter, node.allocatable.memoryMiB)
  const podSpreadScore = 1 - ratio(node.podCount + 1, node.maxPods)
  const score = (cpuHeadroomScore + memoryHeadroomScore + podSpreadScore) / 3

  return {
    node,
    score: round(score),
    components: {
      cpuHeadroomScore: round(cpuHeadroomScore),
      memoryHeadroomScore: round(memoryHeadroomScore),
      podSpreadScore: round(podSpreadScore)
    }
  }
}

export function chooseNode(pod: PodInstance, nodes: NodeState[], strategy: SchedulerStrategy): NodeChoice {
  const scored = nodes.map((node) => scoreNode(pod, node, strategy))
  const [chosen] = [...scored].sort((a, b) => {
    const scoreDiff = b.score - a.score
    if (scoreDiff !== 0) return scoreDiff

    const imbalanceDiff = projectedImbalance(pod, a.node) - projectedImbalance(pod, b.node)
    if (imbalanceDiff !== 0) return imbalanceDiff

    const poolDiff = a.node.nodePoolName.localeCompare(b.node.nodePoolName)
    if (poolDiff !== 0) return poolDiff

    const ordinalDiff = a.node.ordinal - b.node.ordinal
    if (ordinalDiff !== 0) return ordinalDiff

    return a.node.id.localeCompare(b.node.id)
  })

  return {
    ...chosen,
    feasibleNodeCount: nodes.length,
    traceId: `score:${pod.id}:${chosen.node.id}`
  }
}
