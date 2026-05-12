import { describe, expect, it } from 'vitest'
import { simulateScenario } from '../core/simulator'
import { CLUSTER_SNAPSHOT_SCHEMA_VERSION, type ClusterSnapshot } from '../schema/clusterSnapshot'
import { importClusterSnapshot } from './clusterSnapshotImport'

const snapshot: ClusterSnapshot = {
  version: CLUSTER_SNAPSHOT_SCHEMA_VERSION,
  capturedAt: '2026-05-11T00:00:00.000Z',
  clusterName: 'local-test',
  nodes: [
    {
      name: 'node-1',
      nodePool: 'system',
      instanceType: 'Standard_D4ds_v5',
      labels: {
        'kubernetes.azure.com/agentpool': 'system',
        'kubernetes.io/hostname': 'node-1',
      },
      taints: [],
      capacity: { cpuMillis: 4000, memoryMiB: 16384 },
      allocatable: { cpuMillis: 3860, memoryMiB: 14034 },
      maxPods: 110,
      conditions: ['Ready'],
    },
  ],
  pods: [],
  workloads: [
    {
      name: 'api',
      namespace: 'default',
      kind: 'Deployment',
      replicas: 2,
      labels: { app: 'api' },
      team: 'backend',
      podTemplate: {
        requests: { cpuMillis: 250, memoryMiB: 256 },
        nodeSelector: {},
        tolerations: [],
      },
    },
  ],
  pdbs: [],
  namespaces: ['default'],
}

describe('importClusterSnapshot', () => {
  it('normalizes a ClusterSnapshot into a runnable baseline scenario', () => {
    const scenario = importClusterSnapshot(snapshot)
    const result = simulateScenario(scenario)

    expect(scenario).toMatchObject({
      schemaVersion: '0.1',
      name: 'local-test',
      cloud: { provider: 'azure', region: 'southeastasia', currency: 'USD' },
    })
    expect(scenario.nodePools).toHaveLength(1)
    expect(scenario.nodePools[0]).toMatchObject({
      name: 'system',
      nodeCount: 1,
      shape: { providerSku: 'Standard_D4ds_v5', vcpu: 4, memoryMiB: 16384 },
    })
    expect(result.pendingPods).toHaveLength(0)
  })

  it('uses snapshot pricing metadata when available', () => {
    const scenario = importClusterSnapshot({
      ...snapshot,
      pricing: {
        source: 'custom',
        currency: 'USD',
        nodePools: [
          {
            nodePool: 'system',
            instanceType: 'Standard_D4ds_v5',
            hourlyCostUsd: 1.5,
            observedDailyCostUsd: 72,
          },
        ],
      },
    })

    expect(scenario.nodePools[0]).toMatchObject({
      hourlyCost: 1.5,
      shape: { hourlyCost: 1.5 },
      metadata: {
        observedDailyCost: '72',
        observedNodeCount: '1',
      },
    })
  })
})
