import { describe, expect, it } from 'vitest'
import { simulateScenario } from './simulateScenario'
import { filterNodes } from './scheduler/filter'
import { scoreNode } from './scheduler/score'
import { SCENARIO_SCHEMA_VERSION } from './schemaVersions'
import type { NodePool, NodeResult, NodeState, Scenario, Workload } from './types'

function pool(patch: Partial<NodePool> = {}): NodePool {
  return {
    id: 'pool-general',
    name: 'general',
    mode: 'manual',
    nodeCount: 1,
    shape: {
      id: 'shape-test',
      name: 'test-node',
      provider: 'test',
      region: 'test',
      providerSku: 'test',
      vcpu: 1,
      memoryMiB: 1024,
      hourlyCost: 1
    },
    labels: { pool: 'general' },
    taints: [],
    maxPods: 10,
    systemReserved: { cpuMillis: 0, memoryMiB: 0 },
    kubeReserved: { cpuMillis: 0, memoryMiB: 0 },
    ...patch
  }
}

function deployment(patch: Partial<Workload> = {}): Workload {
  return {
    id: 'deploy-app',
    name: 'app',
    kind: 'Deployment',
    team: 'team',
    classification: 'application',
    color: '#2563eb',
    resources: { cpuMillis: 100, memoryMiB: 100 },
    replicas: 1,
    nodeSelector: {},
    tolerations: [],
    ...patch
  }
}

function daemonSet(patch: Partial<Workload> = {}): Workload {
  return {
    ...deployment({
      id: 'ds-agent',
      name: 'agent',
      kind: 'DaemonSet',
      classification: 'platform',
      required: true,
      ...patch
    })
  }
}

function scenario(patch: Partial<Scenario> = {}): Scenario {
  return {
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    id: 'scenario-test',
    name: 'Scenario test',
    description: 'test',
    cloud: { provider: 'azure', region: 'southeastasia', currency: 'USD' },
    schedulerStrategy: 'Spread',
    nodePools: [pool()],
    workloads: [deployment()],
    ...patch
  }
}

function appCounts(result: ReturnType<typeof simulateScenario>, workloadId = 'deploy-app'): number[] {
  return result.nodes.map((node) => node.placements.filter((placement) => placement.workloadId === workloadId).length)
}

function asNodeState(node: NodeResult): NodeState {
  return {
    ...node,
    remaining: { ...node.unused }
  }
}

describe('simulateScenario', () => {
  it('filters by selector, taint, cpu, memory, and max pods', () => {
    const input = scenario({
      nodePools: [
        pool({
          labels: { pool: 'gpu' },
          taints: [{ key: 'dedicated', value: 'gpu', effect: 'NoSchedule' }],
          maxPods: 1
        })
      ],
      workloads: []
    })
    const result = simulateScenario(input)
    const pod = {
      id: 'pod',
      workloadId: 'w',
      workloadName: 'w',
      kind: 'Deployment' as const,
      team: 'team',
      classification: 'application' as const,
      ordinal: 0,
      resources: { cpuMillis: 2000, memoryMiB: 2048 },
      nodeSelector: { pool: 'general' },
      tolerations: [],
      required: false,
      color: '#000'
    }

    expect(filterNodes(pod, result.nodes.map(asNodeState)).at(0)?.reasons).toEqual(
      expect.arrayContaining(['NodeSelectorMismatch', 'UntoleratedTaint', 'InsufficientCpu', 'InsufficientMemory'])
    )
  })

  it('scores Spread toward headroom and Bin-pack toward fuller used nodes', () => {
    const base = scenario({
      nodePools: [pool({ nodeCount: 2 })],
      workloads: [deployment({ replicas: 1, resources: { cpuMillis: 300, memoryMiB: 100 } })]
    })
    const result = simulateScenario({ ...base, schedulerStrategy: 'Bin-pack' })
    const usedNode = asNodeState(result.nodes[0])
    const emptyNode = asNodeState(result.nodes[1])
    const pod = {
      id: 'pod',
      workloadId: 'w',
      workloadName: 'w',
      kind: 'Deployment' as const,
      team: 'team',
      classification: 'application' as const,
      ordinal: 0,
      resources: { cpuMillis: 100, memoryMiB: 100 },
      nodeSelector: {},
      tolerations: [],
      required: false,
      color: '#000'
    }

    expect(scoreNode(pod, emptyNode, 'Spread').score).toBeGreaterThan(scoreNode(pod, usedNode, 'Spread').score)
    expect(scoreNode(pod, usedNode, 'Bin-pack').score).toBeGreaterThan(scoreNode(pod, emptyNode, 'Bin-pack').score)
  })

  it('uses Spread to distribute feasible pods and Bin-pack to densify nodes', () => {
    const base = scenario({
      nodePools: [pool({ nodeCount: 3 })],
      workloads: [deployment({ replicas: 3, resources: { cpuMillis: 100, memoryMiB: 100 } })]
    })

    expect(appCounts(simulateScenario({ ...base, schedulerStrategy: 'Spread' }))).toEqual([1, 1, 1])
    expect(appCounts(simulateScenario({ ...base, schedulerStrategy: 'Bin-pack' }))).toEqual([3, 0, 0])
  })

  it('keeps manual mode fixed and leaves pods pending', () => {
    const result = simulateScenario(
      scenario({
        nodePools: [pool({ nodeCount: 1 })],
        workloads: [deployment({ replicas: 2, resources: { cpuMillis: 700, memoryMiB: 100 } })]
      })
    )

    expect(result.nodes).toHaveLength(1)
    expect(result.pendingPods).toHaveLength(1)
    expect(result.workloadHealth[0].state).toBe('Degraded')
  })

  it('autoscale-to-fit adds nodes only when no existing node can fit the pod', () => {
    const autoscalePool = pool({
      mode: 'autoscale-to-fit',
      nodeCount: undefined,
      initialNodes: 2,
      minNodes: 2,
      maxNodes: 4
    })
    const noScale = simulateScenario(
      scenario({
        nodePools: [autoscalePool],
        workloads: [deployment({ replicas: 4, resources: { cpuMillis: 500, memoryMiB: 100 } })]
      })
    )
    const scale = simulateScenario(
      scenario({
        nodePools: [autoscalePool],
        workloads: [deployment({ replicas: 5, resources: { cpuMillis: 500, memoryMiB: 100 } })]
      })
    )

    expect(noScale.autoscalingSummary[0]).toMatchObject({ initialNodes: 2, finalNodes: 2, addedNodes: 0 })
    expect(scale.autoscalingSummary[0]).toMatchObject({ initialNodes: 2, finalNodes: 3, addedNodes: 1 })
  })

  it('scales observed pool daily cost by simulated node count', () => {
    const result = simulateScenario(
      scenario({
        nodePools: [
          pool({
            mode: 'autoscale-to-fit',
            nodeCount: undefined,
            initialNodes: 0,
            minNodes: 0,
            maxNodes: 3,
            metadata: { observedDailyCost: '96', observedNodeCount: '2' }
          })
        ],
        workloads: [deployment({ replicas: 3, resources: { cpuMillis: 700, memoryMiB: 100 } })]
      })
    )

    expect(result.nodes).toHaveLength(3)
    expect(result.costSummary.daily).toBe(144)
    expect(result.costSummary.monthly).toBe(4320)
  })

  it('accounts for DaemonSet pods on every eligible initial and autoscaled node', () => {
    const result = simulateScenario(
      scenario({
        nodePools: [pool({ mode: 'autoscale-to-fit', nodeCount: undefined, initialNodes: 1, minNodes: 1, maxNodes: 2 })],
        workloads: [daemonSet({ resources: { cpuMillis: 100, memoryMiB: 100 } }), deployment({ replicas: 2, resources: { cpuMillis: 600, memoryMiB: 100 } })]
      })
    )

    expect(result.autoscalingSummary[0].addedNodes).toBe(1)
    expect(result.workloadHealth.find((workload) => workload.workloadId === 'ds-agent')).toMatchObject({
      desiredPods: 2,
      scheduledPods: 2,
      state: 'Healthy'
    })
  })

  it('is deterministic for the same scenario input', () => {
    const input = scenario({
      nodePools: [pool({ nodeCount: 3 })],
      workloads: [deployment({ replicas: 5, resources: { cpuMillis: 250, memoryMiB: 100 } })]
    })

    expect(simulateScenario(input)).toEqual(simulateScenario(input))
  })
})
