import { describe, expect, it } from 'vitest'
import { simulateScenario, type NodePool, type Scenario, type Workload } from '../simulator'
import { SCENARIO_SCHEMA_VERSION } from '../simulator/schemaVersions'
import { adviseRepack } from './repackAdvisor'

function pool(patch: Partial<NodePool> = {}): NodePool {
  return {
    id: 'pool-general',
    name: 'general',
    mode: 'manual',
    nodeCount: 3,
    shape: {
      id: 'shape-small',
      name: 'small',
      provider: 'azure',
      providerSku: 'Standard_D2ds_v5',
      region: 'southeastasia',
      vcpu: 2,
      memoryMiB: 8192,
      hourlyCost: 0.1,
      currency: 'USD',
    },
    hourlyCost: 0.1,
    labels: {},
    taints: [],
    maxPods: 20,
    systemReserved: { cpuMillis: 0, memoryMiB: 0 },
    kubeReserved: { cpuMillis: 0, memoryMiB: 0 },
    ...patch,
  }
}

function workload(patch: Partial<Workload> = {}): Workload {
  return {
    id: 'wl-api',
    name: 'api',
    kind: 'Deployment',
    team: 'backend',
    classification: 'application',
    color: '#0f766e',
    resources: { cpuMillis: 500, memoryMiB: 512 },
    replicas: 2,
    nodeSelector: {},
    tolerations: [],
    ...patch,
  }
}

function scenario(patch: Partial<Scenario> = {}): Scenario {
  return {
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    id: 'scenario-advisor',
    name: 'Advisor scenario',
    description: '',
    cloud: { provider: 'azure', region: 'southeastasia', currency: 'USD' },
    schedulerStrategy: 'Spread',
    nodePools: [pool()],
    workloads: [workload()],
    ...patch,
  }
}

describe('adviseRepack', () => {
  it('identifies empty bin-pack nodes and estimates monthly savings', () => {
    const input = scenario()
    const result = simulateScenario(input)
    const advisor = adviseRepack(input, result)

    expect(advisor.totalReclaimableNodes).toBe(2)
    expect(advisor.estimatedMonthlySavings).toBe(144)
    expect(advisor.recommendations[0]).toMatchObject({
      nodePoolName: 'general',
      reclaimableNodes: 2,
      estimatedMonthlySavings: 144,
    })
  })

  it('reports pending pods and imported safety blockers', () => {
    const input = scenario({
      nodePools: [pool({ nodeCount: 1 })],
      workloads: [
        workload({
          replicas: 3,
          resources: { cpuMillis: 1500, memoryMiB: 512 },
          metadata: {
            pdbRef: 'api-pdb',
            pdbDisruptionsAllowed: '0',
            hasRequiredPodAntiAffinity: 'true',
            hasTopologySpreadConstraints: 'true',
            usesPVC: 'true',
          },
        }),
      ],
    })
    const advisor = adviseRepack(input, simulateScenario(input))

    expect(advisor.findings.map((finding) => finding.category)).toEqual(
      expect.arrayContaining(['pending-workload', 'pdb-blocker', 'placement-constraint', 'storage-mobility'])
    )
    expect(advisor.notAnalyzed[0].category).toBe('not-analyzed')
  })
})
