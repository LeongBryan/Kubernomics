import type { NodePool } from './types'

const HOURS_PER_DAY = 24

function numericMetadata(pool: NodePool, key: string): number | undefined {
  const value = pool.metadata?.[key]
  if (value === undefined) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function poolBaselineNodeCount(pool: NodePool): number {
  const observedNodeCount = numericMetadata(pool, 'observedNodeCount')
  if (observedNodeCount !== undefined && observedNodeCount > 0) return observedNodeCount
  return pool.nodeCount ?? pool.initialNodes ?? pool.minNodes ?? pool.maxNodes ?? 0
}

export function observedPoolDailyCost(pool: NodePool): number | undefined {
  const observedDailyCost = numericMetadata(pool, 'observedDailyCost')
  return observedDailyCost !== undefined && observedDailyCost >= 0 ? observedDailyCost : undefined
}

export function nodeHourlyCost(pool: NodePool): number {
  const observedDailyCost = observedPoolDailyCost(pool)
  const baselineNodes = poolBaselineNodeCount(pool)
  if (observedDailyCost !== undefined && baselineNodes > 0) {
    return observedDailyCost / baselineNodes / HOURS_PER_DAY
  }
  return pool.hourlyCost ?? pool.shape.hourlyCost ?? 0
}
