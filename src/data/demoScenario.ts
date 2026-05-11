import { SCENARIO_SCHEMA_VERSION } from '../core/simulator'
import type { NodePool, Scenario, SchedulerStrategy, Toleration, Workload } from '../core/simulator'

export type NodeProfile = 'small-aks' | 'consolidated'

export type CapacityMode = 'manual' | 'autoscale-to-fit'

const tolerateNoSchedule: Toleration[] = [{ operator: 'Exists', effect: 'NoSchedule' }]

const appToleration: Toleration[] = [{ key: 'NodeType', operator: 'Equal', value: 'app', effect: 'NoSchedule' }]

const systemToleration: Toleration[] = [{ key: 'CriticalAddonsOnly', operator: 'Equal', value: 'true', effect: 'NoSchedule' }]

function appPool(mode: CapacityMode, profile: NodeProfile): NodePool {
  const consolidated = profile === 'consolidated'
  return {
    id: 'pool-app',
    name: consolidated ? 'app-consolidated' : 'app-small',
    mode,
    nodeCount: mode === 'manual' ? 2 : undefined,
    initialNodes: mode === 'autoscale-to-fit' ? 2 : undefined,
    minNodes: mode === 'autoscale-to-fit' ? 2 : undefined,
    maxNodes: mode === 'autoscale-to-fit' ? 4 : undefined,
    shape: consolidated
      ? {
          id: 'standard-d8ds-v5',
          name: 'Standard_D8ds_v5',
          provider: 'azure',
          region: 'southeastasia',
          providerSku: 'Standard_D8ds_v5',
          vcpu: 8,
          memoryMiB: 32768,
          hourlyCost: 0.54
        }
      : {
          id: 'standard-d4ds-v5',
          name: 'Standard_D4ds_v5',
          provider: 'azure',
          region: 'southeastasia',
          providerSku: 'Standard_D4ds_v5',
          vcpu: 4,
          memoryMiB: 16384,
          hourlyCost: 0.282
        },
    labels: {
      agentpool: consolidated ? 'appconsolidated' : 'appsmall',
      'kubernetes.azure.com/mode': 'user',
      'node.kubernetes.io/instance-type': consolidated ? 'Standard_D8ds_v5' : 'Standard_D4ds_v5',
      'topology.kubernetes.io/region': 'southeastasia',
      type: 'app'
    },
    taints: [{ key: 'NodeType', value: 'app', effect: 'NoSchedule' }],
    maxPods: consolidated ? 14 : 8,
    systemReserved: { cpuMillis: consolidated ? 300 : 250, memoryMiB: 512 },
    kubeReserved: { cpuMillis: 150, memoryMiB: 512 }
  }
}

function systemPool(): NodePool {
  return {
    id: 'pool-system',
    name: 'system',
    mode: 'manual',
    nodeCount: 1,
    shape: {
      id: 'standard-d2ds-v5',
      name: 'Standard_D2ds_v5',
      provider: 'azure',
      region: 'southeastasia',
      providerSku: 'Standard_D2ds_v5',
      vcpu: 2,
      memoryMiB: 8192,
      hourlyCost: 0.142
    },
    labels: {
      agentpool: 'system',
      'kubernetes.azure.com/mode': 'system',
      'node.kubernetes.io/instance-type': 'Standard_D2ds_v5',
      'topology.kubernetes.io/region': 'southeastasia',
      type: 'system'
    },
    taints: [{ key: 'CriticalAddonsOnly', value: 'true', effect: 'NoSchedule' }],
    maxPods: 10,
    systemReserved: { cpuMillis: 200, memoryMiB: 512 },
    kubeReserved: { cpuMillis: 100, memoryMiB: 384 }
  }
}

const platformDaemonSets: Workload[] = [
  {
    id: 'ds-azure-cni',
    name: 'Azure CNI',
    kind: 'DaemonSet',
    team: 'Platform',
    classification: 'platform',
    color: '#0e7490',
    resources: { cpuMillis: 120, memoryMiB: 180 },
    nodeSelector: {},
    tolerations: tolerateNoSchedule,
    required: true
  },
  {
    id: 'ds-istio-ztunnel',
    name: 'Istio ztunnel',
    kind: 'DaemonSet',
    team: 'Platform',
    classification: 'platform',
    color: '#0891b2',
    resources: { cpuMillis: 180, memoryMiB: 256 },
    nodeSelector: {},
    tolerations: tolerateNoSchedule,
    required: true
  },
  {
    id: 'ds-monitoring-agent',
    name: 'Monitoring agent',
    kind: 'DaemonSet',
    team: 'Observability',
    classification: 'system',
    color: '#2563eb',
    resources: { cpuMillis: 220, memoryMiB: 350 },
    nodeSelector: {},
    tolerations: tolerateNoSchedule,
    required: true
  },
  {
    id: 'ds-logging-agent',
    name: 'Logging agent',
    kind: 'DaemonSet',
    team: 'Observability',
    classification: 'system',
    color: '#7c3aed',
    resources: { cpuMillis: 150, memoryMiB: 256 },
    nodeSelector: {},
    tolerations: tolerateNoSchedule,
    required: true
  }
]

const workloads: Workload[] = [
  ...platformDaemonSets,
  {
    id: 'deploy-ingress-gateway',
    name: 'Ingress gateway',
    kind: 'Deployment',
    team: 'Platform',
    classification: 'platform',
    color: '#0f766e',
    resources: { cpuMillis: 400, memoryMiB: 512 },
    replicas: 2,
    nodeSelector: { type: 'system' },
    tolerations: systemToleration
  },
  {
    id: 'deploy-checkout-api',
    name: 'Checkout API',
    kind: 'Deployment',
    team: 'Team Atlas',
    classification: 'application',
    color: '#dc2626',
    resources: { cpuMillis: 700, memoryMiB: 768 },
    replicas: 4,
    nodeSelector: { type: 'app' },
    tolerations: appToleration
  },
  {
    id: 'deploy-fraud-worker',
    name: 'Fraud worker',
    kind: 'Deployment',
    team: 'Team Atlas',
    classification: 'application',
    color: '#f97316',
    resources: { cpuMillis: 900, memoryMiB: 1024 },
    replicas: 3,
    nodeSelector: { type: 'app' },
    tolerations: appToleration
  },
  {
    id: 'deploy-recommendations',
    name: 'Recommendations',
    kind: 'Deployment',
    team: 'Team Borealis',
    classification: 'application',
    color: '#16a34a',
    resources: { cpuMillis: 500, memoryMiB: 1024 },
    replicas: 4,
    nodeSelector: { type: 'app' },
    tolerations: appToleration
  },
  {
    id: 'deploy-report-exporter',
    name: 'Report exporter',
    kind: 'Deployment',
    team: 'Team Cygnus',
    classification: 'application',
    color: '#9333ea',
    resources: { cpuMillis: 800, memoryMiB: 1536 },
    replicas: 2,
    nodeSelector: { type: 'app' },
    tolerations: appToleration
  }
]

export function buildDemoScenario({
  schedulerStrategy,
  capacityMode,
  nodeProfile
}: {
  schedulerStrategy: SchedulerStrategy
  capacityMode: CapacityMode
  nodeProfile: NodeProfile
}): Scenario {
  return {
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    id: `demo-${schedulerStrategy}-${capacityMode}-${nodeProfile}`,
    name: 'AKS platform tax demo',
    description:
      'A small AKS-like scenario with platform DaemonSet tax, app teams, constrained manual capacity, and autoscale-to-fit behavior.',
    cloud: { provider: 'azure', region: 'southeastasia', currency: 'USD' },
    schedulerStrategy,
    nodePools: [systemPool(), appPool(capacityMode, nodeProfile)],
    workloads
  }
}
