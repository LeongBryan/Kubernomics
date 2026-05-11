import type { CostBucket, CostSummary, NodeResult, Placement } from './types'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function resourceShare(cpuMillis: number, memoryMiB: number, node: NodeResult): number {
  const cpuShare = node.capacity.cpuMillis <= 0 ? 0 : cpuMillis / node.capacity.cpuMillis
  const memoryShare = node.capacity.memoryMiB <= 0 ? 0 : memoryMiB / node.capacity.memoryMiB
  return Math.max(0, (cpuShare + memoryShare) / 2)
}

function addBucket(map: Map<string, CostBucket>, id: string, name: string, hourly: number): void {
  const current = map.get(id) ?? { id, name, hourly: 0 }
  current.hourly += hourly
  map.set(id, current)
}

export function computeCost(nodes: NodeResult[], placements: Placement[]): CostSummary {
  const byNodePool = new Map<string, CostBucket>()
  const byTeam = new Map<string, CostBucket>()
  let hourly = 0
  let systemTaxHourly = 0
  let unusedCapacityHourly = 0
  let addedNodesHourly = 0

  for (const node of nodes) {
    hourly += node.hourlyCost
    addBucket(byNodePool, node.nodePoolId, node.nodePoolName, node.hourlyCost)
    if (node.addedByAutoscaler) addedNodesHourly += node.hourlyCost

    const nodePlacements = placements.filter((placement) => placement.nodeId === node.id)
    const daemonSetPlacements = nodePlacements.filter((placement) => placement.kind === 'DaemonSet')
    const reservedShare = resourceShare(node.reserved.cpuMillis, node.reserved.memoryMiB, node)
    const daemonSetShare = daemonSetPlacements.reduce(
      (sum, placement) => sum + resourceShare(placement.cpuMillis, placement.memoryMiB, node),
      0
    )
    const unusedShare = resourceShare(node.unused.cpuMillis, node.unused.memoryMiB, node)

    systemTaxHourly += node.hourlyCost * (reservedShare + daemonSetShare)
    unusedCapacityHourly += node.hourlyCost * unusedShare

    for (const placement of nodePlacements) {
      const share = resourceShare(placement.cpuMillis, placement.memoryMiB, node)
      addBucket(byTeam, placement.team, placement.team, node.hourlyCost * share)
    }
  }

  return {
    hourly: round2(hourly),
    daily: round2(hourly * 24),
    monthly: round2(hourly * 24 * 30),
    byNodePool: [...byNodePool.values()].map((bucket) => ({ ...bucket, hourly: round2(bucket.hourly) })),
    byTeam: [...byTeam.values()].map((bucket) => ({ ...bucket, hourly: round2(bucket.hourly) })).sort((a, b) => b.hourly - a.hourly),
    systemTaxHourly: round2(systemTaxHourly),
    unusedCapacityHourly: round2(unusedCapacityHourly),
    addedNodesHourly: round2(addedNodesHourly)
  }
}
