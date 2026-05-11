import { describe, expect, it } from 'vitest'
import { bindPod } from './bind'
import { aggregateReasons, filterNode, filterNodes, toNodeRejections } from './filter'
import { chooseNode, scoreNode } from './score'
import type { NodeState, PodInstance, Placement } from '../types'

function pod(patch: Partial<PodInstance> = {}): PodInstance {
  return {
    id: 'pod-app-0',
    workloadId: 'workload-app',
    workloadName: 'app',
    kind: 'Deployment',
    team: 'team-a',
    classification: 'application',
    ordinal: 0,
    resources: { cpuMillis: 500, memoryMiB: 512 },
    nodeSelector: {},
    tolerations: [],
    required: false,
    color: '#0f766e',
    ...patch
  }
}

function placement(patch: Partial<Placement> = {}): Placement {
  return {
    podId: 'existing-pod',
    workloadId: 'existing-workload',
    workloadName: 'existing',
    kind: 'Deployment',
    team: 'team-a',
    classification: 'application',
    color: '#0f766e',
    ordinal: 0,
    nodeId: 'node-alpha-0',
    nodeName: 'alpha-1',
    nodePoolId: 'pool-alpha',
    nodePoolName: 'alpha',
    cpuMillis: 1000,
    memoryMiB: 2048,
    schedulerStrategy: 'Bin-pack',
    score: 1,
    scoreComponents: {},
    traceId: 'existing-trace',
    ...patch
  }
}

function node(patch: Partial<NodeState> = {}): NodeState {
  return {
    id: 'node-alpha-0',
    name: 'alpha-1',
    nodePoolId: 'pool-alpha',
    nodePoolName: 'alpha',
    ordinal: 0,
    shapeName: 'Standard_D4ds_v5',
    hourlyCost: 0.28,
    capacity: { cpuMillis: 4000, memoryMiB: 16384 },
    allocatable: { cpuMillis: 4000, memoryMiB: 8192 },
    reserved: { cpuMillis: 0, memoryMiB: 0 },
    remaining: { cpuMillis: 4000, memoryMiB: 8192 },
    labels: { pool: 'general' },
    taints: [],
    maxPods: 20,
    podCount: 0,
    addedByAutoscaler: false,
    placements: [],
    ...patch
  }
}

describe('scheduler filter phase', () => {
  it('returns structured rejection reasons for every failed predicate', () => {
    const candidate = node({
      labels: { pool: 'data' },
      taints: [{ key: 'dedicated', value: 'data', effect: 'NoSchedule' }],
      remaining: { cpuMillis: 250, memoryMiB: 256 },
      maxPods: 1,
      podCount: 1
    })
    const result = filterNode(
      pod({
        resources: { cpuMillis: 500, memoryMiB: 512 },
        nodeSelector: { pool: 'frontend' }
      }),
      candidate
    )

    expect(result.feasible).toBe(false)
    expect(result.reasons).toEqual([
      'NodeSelectorMismatch',
      'UntoleratedTaint',
      'InsufficientCpu',
      'InsufficientMemory',
      'MaxPodsExceeded'
    ])
  })

  it('ignores PreferNoSchedule taints during hard feasibility checks', () => {
    const result = filterNode(
      pod(),
      node({ taints: [{ key: 'soft-preference', effect: 'PreferNoSchedule' }] })
    )

    expect(result.feasible).toBe(true)
    expect(result.reasons).toEqual([])
  })

  it('aggregates pending reasons and preserves per-node rejections', () => {
    const candidates = [
      node({ id: 'node-a', name: 'a-1', remaining: { cpuMillis: 100, memoryMiB: 8192 } }),
      node({ id: 'node-b', name: 'b-1', remaining: { cpuMillis: 4000, memoryMiB: 100 } })
    ]
    const results = filterNodes(pod(), candidates)

    expect(aggregateReasons(results)).toEqual(['InsufficientCpu', 'InsufficientMemory'])
    expect(toNodeRejections(results)).toMatchObject([
      { nodeId: 'node-a', reasons: ['InsufficientCpu'] },
      { nodeId: 'node-b', reasons: ['InsufficientMemory'] }
    ])
    expect(aggregateReasons([])).toEqual(['NoEligibleNodes'])
  })
})

describe('scheduler score phase', () => {
  it('scores Spread toward headroom and Bin-pack toward already used nodes', () => {
    const incoming = pod()
    const empty = node()
    const used = node({
      remaining: { cpuMillis: 3000, memoryMiB: 6144 },
      podCount: 1,
      placements: [placement()]
    })

    expect(scoreNode(incoming, empty, 'Spread').score).toBeGreaterThan(scoreNode(incoming, used, 'Spread').score)
    expect(scoreNode(incoming, used, 'Bin-pack').score).toBeGreaterThan(scoreNode(incoming, empty, 'Bin-pack').score)
  })

  it('breaks exact score ties deterministically', () => {
    const choice = chooseNode(
      pod(),
      [
        node({ id: 'node-beta-0', name: 'beta-1', nodePoolId: 'pool-beta', nodePoolName: 'beta', ordinal: 0 }),
        node({ id: 'node-alpha-0', name: 'alpha-1', nodePoolId: 'pool-alpha', nodePoolName: 'alpha', ordinal: 0 })
      ],
      'Spread'
    )

    expect(choice.node.id).toBe('node-alpha-0')
    expect(choice.traceId).toBe('score:pod-app-0:node-alpha-0')
  })
})

describe('scheduler bind phase', () => {
  it('creates a placement and mutates node accounting exactly once', () => {
    const target = node()
    const incoming = pod({ resources: { cpuMillis: 750, memoryMiB: 1024 } })
    const result = bindPod({
      node: target,
      pod: incoming,
      schedulerStrategy: 'Spread',
      score: 0.75,
      scoreComponents: { cpuHeadroomScore: 0.8 },
      traceId: 'score:pod-app-0:node-alpha-0'
    })

    expect(result).toMatchObject({
      podId: 'pod-app-0',
      nodeId: 'node-alpha-0',
      cpuMillis: 750,
      memoryMiB: 1024,
      schedulerStrategy: 'Spread',
      score: 0.75
    })
    expect(target.remaining).toEqual({ cpuMillis: 3250, memoryMiB: 7168 })
    expect(target.podCount).toBe(1)
    expect(target.placements).toEqual([result])
  })
})
