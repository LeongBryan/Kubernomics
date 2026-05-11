import { SCENARIO_SCHEMA_VERSION } from '../core/simulator'
import type { Scenario } from '../core/simulator'

// Anonymized sample cluster baseline.
// Node shapes use static AKS-oriented Azure catalog assumptions for the MVP.
export const clusterBaselineScenarios: Scenario[] = [
  {
    "schemaVersion": SCENARIO_SCHEMA_VERSION,
    "id": "baseline-generic-cluster",
    "name": "Generic AKS cluster",
    "description": "Generic AKS sample with mixed manual and autoscaling node pools.",
    "cloud": {
      "provider": "azure",
      "region": "southeastasia",
      "currency": "USD"
    },
    "schedulerStrategy": "Spread",
    "nodePools": [
      {
        "id": "pool-backend",
        "name": "backend",
        "mode": "autoscale-to-fit",
        "shape": {
          "id": "standard-d8ds-v5",
          "name": "Standard_D8ds_v5",
          "provider": "azure",
          "region": "southeastasia",
          "providerSku": "Standard_D8ds_v5",
          "vcpu": 8,
          "memoryMiB": 32768,
          "hourlyCost": 0.54,
          "currency": "USD"
        },
        "hourlyCost": 0.54,
        "labels": {
          "agentpool": "backend",
          "kubernetes.azure.com/agentpool": "backend",
          "kubernetes.azure.com/mode": "user",
          "kubernetes.azure.com/role": "agent",
          "kubernetes.io/arch": "amd64",
          "kubernetes.io/os": "linux",
          "node.kubernetes.io/instance-type": "Standard_D8ds_v5",
          "topology.kubernetes.io/region": "southeastasia",
          "type": "backend"
        },
        "taints": [
          {
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "maxPods": 110,
        "systemReserved": {
          "cpuMillis": 300,
          "memoryMiB": 2560
        },
        "kubeReserved": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "initialNodes": 7,
        "minNodes": 3,
        "maxNodes": 20
      },
      {
        "id": "pool-worker",
        "name": "worker",
        "mode": "autoscale-to-fit",
        "shape": {
          "id": "standard-f4s-v2",
          "name": "Standard_F4s_v2",
          "provider": "azure",
          "region": "southeastasia",
          "providerSku": "Standard_F4s_v2",
          "vcpu": 4,
          "memoryMiB": 8192,
          "hourlyCost": 0.199,
          "currency": "USD"
        },
        "hourlyCost": 0.199,
        "labels": {
          "agentpool": "worker",
          "kubernetes.azure.com/agentpool": "worker",
          "kubernetes.azure.com/mode": "user",
          "kubernetes.azure.com/role": "agent",
          "kubernetes.io/arch": "amd64",
          "kubernetes.io/os": "linux",
          "node.kubernetes.io/instance-type": "Standard_F4s_v2",
          "topology.kubernetes.io/region": "southeastasia",
          "type": "worker"
        },
        "taints": [
          {
            "key": "NodeType",
            "value": "worker",
            "effect": "NoSchedule"
          }
        ],
        "maxPods": 110,
        "systemReserved": {
          "cpuMillis": 140,
          "memoryMiB": 1792
        },
        "kubeReserved": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "initialNodes": 4,
        "minNodes": 1,
        "maxNodes": 16
      },
      {
        "id": "pool-data",
        "name": "data",
        "mode": "manual",
        "shape": {
          "id": "standard-e8ads-v5",
          "name": "Standard_E8ads_v5",
          "provider": "azure",
          "region": "southeastasia",
          "providerSku": "Standard_E8ads_v5",
          "vcpu": 8,
          "memoryMiB": 65536,
          "hourlyCost": 0.636,
          "currency": "USD"
        },
        "hourlyCost": 0.636,
        "labels": {
          "agentpool": "data",
          "kubernetes.azure.com/agentpool": "data",
          "kubernetes.azure.com/mode": "user",
          "kubernetes.azure.com/role": "agent",
          "kubernetes.io/arch": "amd64",
          "kubernetes.io/os": "linux",
          "node.kubernetes.io/instance-type": "Standard_E8ads_v5",
          "topology.kubernetes.io/region": "southeastasia",
          "type": "data"
        },
        "taints": [
          {
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "maxPods": 110,
        "systemReserved": {
          "cpuMillis": 300,
          "memoryMiB": 2560
        },
        "kubeReserved": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeCount": 4
      },
      {
        "id": "pool-system",
        "name": "system",
        "mode": "manual",
        "shape": {
          "id": "standard-d2ds-v5",
          "name": "Standard_D2ds_v5",
          "provider": "azure",
          "region": "southeastasia",
          "providerSku": "Standard_D2ds_v5",
          "vcpu": 2,
          "memoryMiB": 8192,
          "hourlyCost": 0.142,
          "currency": "USD"
        },
        "hourlyCost": 0.142,
        "labels": {
          "agentpool": "system",
          "kubernetes.azure.com/agentpool": "system",
          "kubernetes.azure.com/mode": "system",
          "kubernetes.azure.com/role": "agent",
          "kubernetes.io/arch": "amd64",
          "kubernetes.io/os": "linux",
          "node.kubernetes.io/instance-type": "Standard_D2ds_v5",
          "topology.kubernetes.io/region": "southeastasia",
          "type": "system"
        },
        "taints": [
          {
            "key": "CriticalAddonsOnly",
            "value": "true",
            "effect": "NoSchedule"
          }
        ],
        "maxPods": 110,
        "systemReserved": {
          "cpuMillis": 100,
          "memoryMiB": 1792
        },
        "kubeReserved": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeCount": 3
      },
      {
        "id": "pool-general",
        "name": "general",
        "mode": "autoscale-to-fit",
        "shape": {
          "id": "standard-d8as-v5",
          "name": "Standard_D8as_v5",
          "provider": "azure",
          "region": "southeastasia",
          "providerSku": "Standard_D8as_v5",
          "vcpu": 8,
          "memoryMiB": 32768,
          "hourlyCost": 0.384,
          "currency": "USD"
        },
        "hourlyCost": 0.384,
        "labels": {
          "agentpool": "general",
          "kubernetes.azure.com/agentpool": "general",
          "kubernetes.azure.com/mode": "user",
          "kubernetes.azure.com/role": "agent",
          "kubernetes.io/arch": "amd64",
          "kubernetes.io/os": "linux",
          "node.kubernetes.io/instance-type": "Standard_D8as_v5",
          "topology.kubernetes.io/region": "southeastasia",
          "type": "general"
        },
        "taints": [],
        "maxPods": 110,
        "systemReserved": {
          "cpuMillis": 300,
          "memoryMiB": 2560
        },
        "kubeReserved": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "initialNodes": 6,
        "minNodes": 3,
        "maxNodes": 15
      },
      {
        "id": "pool-messaging",
        "name": "messaging",
        "mode": "manual",
        "shape": {
          "id": "standard-d4as-v5",
          "name": "Standard_D4as_v5",
          "provider": "azure",
          "region": "southeastasia",
          "providerSku": "Standard_D4as_v5",
          "vcpu": 4,
          "memoryMiB": 16384,
          "hourlyCost": 0.192,
          "currency": "USD"
        },
        "hourlyCost": 0.192,
        "labels": {
          "agentpool": "messaging",
          "kubernetes.azure.com/agentpool": "messaging",
          "kubernetes.azure.com/mode": "user",
          "kubernetes.azure.com/role": "agent",
          "kubernetes.io/arch": "amd64",
          "kubernetes.io/os": "linux",
          "node.kubernetes.io/instance-type": "Standard_D4as_v5",
          "topology.kubernetes.io/region": "southeastasia",
          "type": "messaging"
        },
        "taints": [
          {
            "key": "NodeType",
            "value": "messaging",
            "effect": "NoSchedule"
          }
        ],
        "maxPods": 110,
        "systemReserved": {
          "cpuMillis": 140,
          "memoryMiB": 2350
        },
        "kubeReserved": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeCount": 3
      },
      {
        "id": "pool-observability",
        "name": "observability",
        "mode": "manual",
        "shape": {
          "id": "standard-e4ads-v5",
          "name": "Standard_E4ads_v5",
          "provider": "azure",
          "region": "southeastasia",
          "providerSku": "Standard_E4ads_v5",
          "vcpu": 4,
          "memoryMiB": 32768,
          "hourlyCost": 0.318,
          "currency": "USD"
        },
        "hourlyCost": 0.318,
        "labels": {
          "agentpool": "observability",
          "kubernetes.azure.com/agentpool": "observability",
          "kubernetes.azure.com/mode": "user",
          "kubernetes.azure.com/role": "agent",
          "kubernetes.io/arch": "amd64",
          "kubernetes.io/os": "linux",
          "node.kubernetes.io/instance-type": "Standard_E4ads_v5",
          "topology.kubernetes.io/region": "southeastasia",
          "type": "observability"
        },
        "taints": [
          {
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "maxPods": 110,
        "systemReserved": {
          "cpuMillis": 140,
          "memoryMiB": 2350
        },
        "kubeReserved": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeCount": 3
      },
      {
        "id": "pool-frontend",
        "name": "frontend",
        "mode": "autoscale-to-fit",
        "shape": {
          "id": "standard-f8s-v2",
          "name": "Standard_F8s_v2",
          "provider": "azure",
          "region": "southeastasia",
          "providerSku": "Standard_F8s_v2",
          "vcpu": 8,
          "memoryMiB": 16384,
          "hourlyCost": 0.398,
          "currency": "USD"
        },
        "hourlyCost": 0.398,
        "labels": {
          "agentpool": "frontend",
          "kubernetes.azure.com/agentpool": "frontend",
          "kubernetes.azure.com/mode": "user",
          "kubernetes.azure.com/role": "agent",
          "kubernetes.io/arch": "amd64",
          "kubernetes.io/os": "linux",
          "node.kubernetes.io/instance-type": "Standard_F8s_v2",
          "topology.kubernetes.io/region": "southeastasia",
          "type": "frontend"
        },
        "taints": [
          {
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "maxPods": 110,
        "systemReserved": {
          "cpuMillis": 300,
          "memoryMiB": 2350
        },
        "kubeReserved": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "initialNodes": 4,
        "minNodes": 2,
        "maxNodes": 10
      },
      {
        "id": "pool-edge",
        "name": "edge",
        "mode": "manual",
        "shape": {
          "id": "standard-b2ms",
          "name": "Standard_B2ms",
          "provider": "azure",
          "region": "southeastasia",
          "providerSku": "Standard_B2ms",
          "vcpu": 2,
          "memoryMiB": 8192,
          "hourlyCost": 0.106,
          "currency": "USD"
        },
        "hourlyCost": 0.106,
        "labels": {
          "agentpool": "edge",
          "kubernetes.azure.com/agentpool": "edge",
          "kubernetes.azure.com/mode": "user",
          "kubernetes.azure.com/role": "agent",
          "kubernetes.io/arch": "amd64",
          "kubernetes.io/os": "linux",
          "node.kubernetes.io/instance-type": "Standard_B2ms",
          "topology.kubernetes.io/region": "southeastasia",
          "type": "edge"
        },
        "taints": [
          {
            "key": "NodeType",
            "value": "edge",
            "effect": "NoSchedule"
          }
        ],
        "maxPods": 110,
        "systemReserved": {
          "cpuMillis": 100,
          "memoryMiB": 2148
        },
        "kubeReserved": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeCount": 2
      }
    ],
    "workloads": [
      {
        "id": "wl-platform-daemonset-api-agent",
        "name": "platform/api-agent",
        "kind": "DaemonSet",
        "team": "platform",
        "classification": "system",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-operations-daemonset-worker-agent",
        "name": "operations/worker-agent",
        "kind": "DaemonSet",
        "team": "operations",
        "classification": "system",
        "color": "#ea580c",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "node-role.kubernetes.io/master",
            "effect": "NoSchedule"
          },
          {
            "operator": "Exists",
            "key": "NodeType",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-frontend-daemonset-frontend-agent",
        "name": "frontend/frontend-agent",
        "kind": "DaemonSet",
        "team": "frontend",
        "classification": "system",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-backend-daemonset-backend-agent",
        "name": "backend/backend-agent",
        "kind": "DaemonSet",
        "team": "backend",
        "classification": "system",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 100
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          },
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          }
        ],
        "required": true
      },
      {
        "id": "wl-data-daemonset-scheduler-agent",
        "name": "data/scheduler-agent",
        "kind": "DaemonSet",
        "team": "data",
        "classification": "system",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 200,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          },
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          }
        ],
        "required": true
      },
      {
        "id": "wl-finance-daemonset-gateway-agent",
        "name": "finance/gateway-agent",
        "kind": "DaemonSet",
        "team": "finance",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 33,
          "memoryMiB": 108
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-analytics-daemonset-processor-agent",
        "name": "analytics/processor-agent",
        "kind": "DaemonSet",
        "team": "analytics",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 300,
          "memoryMiB": 300
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-payments-daemonset-consumer-agent",
        "name": "payments/consumer-agent",
        "kind": "DaemonSet",
        "team": "payments",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 16,
          "memoryMiB": 50
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-security-daemonset-service-agent",
        "name": "security/service-agent",
        "kind": "DaemonSet",
        "team": "security",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 200
        },
        "nodeSelector": {
          "kubernetes.io/os": "windows"
        },
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-support-daemonset-job-agent",
        "name": "support/job-agent",
        "kind": "DaemonSet",
        "team": "support",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 70,
          "memoryMiB": 180
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-platform-daemonset-api-agent",
        "name": "platform/api-agent",
        "kind": "DaemonSet",
        "team": "platform",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 100
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-operations-daemonset-worker-agent",
        "name": "operations/worker-agent",
        "kind": "DaemonSet",
        "team": "operations",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 36
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-frontend-daemonset-frontend-agent",
        "name": "frontend/frontend-agent",
        "kind": "DaemonSet",
        "team": "frontend",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 50
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Equal",
            "key": "node-role.kubernetes.io/master",
            "value": "true",
            "effect": "NoSchedule"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-backend-daemonset-backend-agent",
        "name": "backend/backend-agent",
        "kind": "DaemonSet",
        "team": "backend",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 50
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Equal",
            "key": "node-role.kubernetes.io/master",
            "value": "true",
            "effect": "NoSchedule"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-data-daemonset-scheduler-agent",
        "name": "data/scheduler-agent",
        "kind": "DaemonSet",
        "team": "data",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 30,
          "memoryMiB": 60
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-finance-daemonset-gateway-agent",
        "name": "finance/gateway-agent",
        "kind": "DaemonSet",
        "team": "finance",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 40,
          "memoryMiB": 40
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-analytics-daemonset-processor-agent",
        "name": "analytics/processor-agent",
        "kind": "DaemonSet",
        "team": "analytics",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 40,
          "memoryMiB": 80
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-payments-daemonset-consumer-agent",
        "name": "payments/consumer-agent",
        "kind": "DaemonSet",
        "team": "payments",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 40,
          "memoryMiB": 40
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-security-daemonset-service-agent",
        "name": "security/service-agent",
        "kind": "DaemonSet",
        "team": "security",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-support-daemonset-job-agent",
        "name": "support/job-agent",
        "kind": "DaemonSet",
        "team": "support",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 200
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-platform-daemonset-api-agent",
        "name": "platform/api-agent",
        "kind": "DaemonSet",
        "team": "platform",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 300
        },
        "nodeSelector": {
          "kubernetes.io/os": "windows"
        },
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-operations-daemonset-worker-agent",
        "name": "operations/worker-agent",
        "kind": "DaemonSet",
        "team": "operations",
        "classification": "platform",
        "color": "#059669",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Equal",
            "key": "node-role.kubernetes.io/master",
            "value": "true",
            "effect": "NoSchedule"
          },
          {
            "operator": "Exists",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "effect": "NoSchedule"
          }
        ],
        "required": true
      },
      {
        "id": "wl-frontend-deployment-frontend-3",
        "name": "frontend/frontend-3",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-backend-deployment-backend-3",
        "name": "backend/backend-3",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 250,
          "memoryMiB": 1024
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-3",
        "name": "data/scheduler-3",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 250,
          "memoryMiB": 1024
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-3",
        "name": "finance/gateway-3",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-3",
        "name": "analytics/processor-3",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-3",
        "name": "payments/consumer-3",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 30,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-3",
        "name": "security/service-3",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-3",
        "name": "support/job-3",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 30,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-4",
        "name": "platform/api-4",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-4",
        "name": "operations/worker-4",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 30,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-4",
        "name": "frontend/frontend-4",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-4",
        "name": "backend/backend-4",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-4",
        "name": "data/scheduler-4",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-4",
        "name": "finance/gateway-4",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 250,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-analytics-deployment-processor-4",
        "name": "analytics/processor-4",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 5
      },
      {
        "id": "wl-payments-deployment-consumer-4",
        "name": "payments/consumer-4",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-4",
        "name": "security/service-4",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-support-deployment-job-4",
        "name": "support/job-4",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-platform-deployment-api-5",
        "name": "platform/api-5",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-operations-deployment-worker-5",
        "name": "operations/worker-5",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-frontend-deployment-frontend-5",
        "name": "frontend/frontend-5",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-5",
        "name": "backend/backend-5",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-5",
        "name": "data/scheduler-5",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-finance-deployment-gateway-5",
        "name": "finance/gateway-5",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-5",
        "name": "analytics/processor-5",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-5",
        "name": "payments/consumer-5",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-security-deployment-service-5",
        "name": "security/service-5",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "observability"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "observability",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-5",
        "name": "support/job-5",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-6",
        "name": "platform/api-6",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 300,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-operations-deployment-worker-6",
        "name": "operations/worker-6",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 300,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-frontend-deployment-frontend-6",
        "name": "frontend/frontend-6",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          },
          {
            "operator": "Equal",
            "key": "CriticalAddonsOnly",
            "value": "true",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-6",
        "name": "backend/backend-6",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-6",
        "name": "data/scheduler-6",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-6",
        "name": "finance/gateway-6",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-6",
        "name": "analytics/processor-6",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 10,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-6",
        "name": "payments/consumer-6",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 200,
          "memoryMiB": 1024
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-6",
        "name": "security/service-6",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 1024
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-6",
        "name": "support/job-6",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 150,
          "memoryMiB": 5000
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-7",
        "name": "platform/api-7",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 1024
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-7",
        "name": "operations/worker-7",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 250,
          "memoryMiB": 256
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-7",
        "name": "frontend/frontend-7",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 500
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-7",
        "name": "backend/backend-7",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 500
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-7",
        "name": "data/scheduler-7",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 2000,
          "memoryMiB": 8192
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "gpu",
            "effect": "NoSchedule"
          },
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-7",
        "name": "finance/gateway-7",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 750
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-7",
        "name": "analytics/processor-7",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 2
      },
      {
        "id": "wl-payments-deployment-consumer-7",
        "name": "payments/consumer-7",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 100
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-7",
        "name": "security/service-7",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 750
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-7",
        "name": "support/job-7",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 2
      },
      {
        "id": "wl-platform-deployment-api-8",
        "name": "platform/api-8",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 250,
          "memoryMiB": 256
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-8",
        "name": "operations/worker-8",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-8",
        "name": "frontend/frontend-8",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-8",
        "name": "backend/backend-8",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-8",
        "name": "data/scheduler-8",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-8",
        "name": "finance/gateway-8",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-8",
        "name": "analytics/processor-8",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-8",
        "name": "payments/consumer-8",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-8",
        "name": "security/service-8",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 2000,
          "memoryMiB": 3072
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-8",
        "name": "support/job-8",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 2500,
          "memoryMiB": 4096
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-9",
        "name": "platform/api-9",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 10,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-9",
        "name": "operations/worker-9",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 384
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-9",
        "name": "frontend/frontend-9",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#ea580c",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-9",
        "name": "backend/backend-9",
        "kind": "Deployment",
        "team": "backend",
        "classification": "system",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-9",
        "name": "data/scheduler-9",
        "kind": "Deployment",
        "team": "data",
        "classification": "system",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-9",
        "name": "finance/gateway-9",
        "kind": "Deployment",
        "team": "finance",
        "classification": "system",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-9",
        "name": "analytics/processor-9",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-9",
        "name": "payments/consumer-9",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-9",
        "name": "security/service-9",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-9",
        "name": "support/job-9",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 400,
          "memoryMiB": 512
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-10",
        "name": "platform/api-10",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-10",
        "name": "operations/worker-10",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 200,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-10",
        "name": "frontend/frontend-10",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-backend-deployment-backend-10",
        "name": "backend/backend-10",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-data-deployment-scheduler-10",
        "name": "data/scheduler-10",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "messaging",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-10",
        "name": "finance/gateway-10",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-10",
        "name": "analytics/processor-10",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "messaging",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-10",
        "name": "payments/consumer-10",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "messaging",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-10",
        "name": "security/service-10",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-10",
        "name": "support/job-10",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-11",
        "name": "platform/api-11",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 4000
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-11",
        "name": "operations/worker-11",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 4096
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 4
      },
      {
        "id": "wl-frontend-deployment-frontend-11",
        "name": "frontend/frontend-11",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 4096
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-backend-deployment-backend-11",
        "name": "backend/backend-11",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#ea580c",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-11",
        "name": "data/scheduler-11",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-11",
        "name": "finance/gateway-11",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 32
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-analytics-deployment-processor-11",
        "name": "analytics/processor-11",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 32
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-11",
        "name": "payments/consumer-11",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-11",
        "name": "security/service-11",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-11",
        "name": "support/job-11",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-12",
        "name": "platform/api-12",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-12",
        "name": "operations/worker-12",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-12",
        "name": "frontend/frontend-12",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-12",
        "name": "backend/backend-12",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-12",
        "name": "data/scheduler-12",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 200,
          "memoryMiB": 300
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-12",
        "name": "finance/gateway-12",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 300,
          "memoryMiB": 450
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 3
      },
      {
        "id": "wl-analytics-deployment-processor-12",
        "name": "analytics/processor-12",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 150
        },
        "nodeSelector": {
          "kubernetes.io/os": "linux",
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-12",
        "name": "payments/consumer-12",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-12",
        "name": "security/service-12",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-12",
        "name": "support/job-12",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-13",
        "name": "platform/api-13",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 2048
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "cni.istio.io/not-ready"
          },
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-13",
        "name": "operations/worker-13",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-13",
        "name": "frontend/frontend-13",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 250,
          "memoryMiB": 2548
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-13",
        "name": "backend/backend-13",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 200,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-13",
        "name": "data/scheduler-13",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-finance-deployment-gateway-13",
        "name": "finance/gateway-13",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-13",
        "name": "analytics/processor-13",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 200,
          "memoryMiB": 384
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-payments-deployment-consumer-13",
        "name": "payments/consumer-13",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-13",
        "name": "security/service-13",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-13",
        "name": "support/job-13",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-14",
        "name": "platform/api-14",
        "kind": "Deployment",
        "team": "platform",
        "classification": "system",
        "color": "#059669",
        "resources": {
          "cpuMillis": 170,
          "memoryMiB": 530
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-operations-deployment-worker-14",
        "name": "operations/worker-14",
        "kind": "Deployment",
        "team": "operations",
        "classification": "system",
        "color": "#059669",
        "resources": {
          "cpuMillis": 5,
          "memoryMiB": 50
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-14",
        "name": "frontend/frontend-14",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "system",
        "color": "#059669",
        "resources": {
          "cpuMillis": 11,
          "memoryMiB": 60
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-14",
        "name": "backend/backend-14",
        "kind": "Deployment",
        "team": "backend",
        "classification": "system",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 70
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "node-role.kubernetes.io/master",
            "effect": "NoSchedule"
          },
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "key": "node.kubernetes.io/unreachable",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "key": "node.kubernetes.io/not-ready",
            "effect": "NoExecute"
          }
        ],
        "replicas": 5
      },
      {
        "id": "wl-data-deployment-scheduler-14",
        "name": "data/scheduler-14",
        "kind": "Deployment",
        "team": "data",
        "classification": "system",
        "color": "#059669",
        "resources": {
          "cpuMillis": 20,
          "memoryMiB": 10
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "key": "node.kubernetes.io/unreachable",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "key": "node.kubernetes.io/not-ready",
            "effect": "NoExecute"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-14",
        "name": "finance/gateway-14",
        "kind": "Deployment",
        "team": "finance",
        "classification": "system",
        "color": "#059669",
        "resources": {
          "cpuMillis": 40,
          "memoryMiB": 489
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-14",
        "name": "analytics/processor-14",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "system",
        "color": "#059669",
        "resources": {
          "cpuMillis": 193,
          "memoryMiB": 430
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Exists",
            "key": "CriticalAddonsOnly"
          },
          {
            "operator": "Exists",
            "key": "node.kubernetes.io/unreachable",
            "effect": "NoExecute"
          },
          {
            "operator": "Exists",
            "key": "node.kubernetes.io/not-ready",
            "effect": "NoExecute"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-payments-deployment-consumer-14",
        "name": "payments/consumer-14",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 384
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-security-deployment-service-14",
        "name": "security/service-14",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 200,
          "memoryMiB": 384
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-support-deployment-job-14",
        "name": "support/job-14",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-platform-deployment-api-15",
        "name": "platform/api-15",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-operations-deployment-worker-15",
        "name": "operations/worker-15",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 500
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-15",
        "name": "frontend/frontend-15",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 256
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-15",
        "name": "backend/backend-15",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 750
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-15",
        "name": "data/scheduler-15",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 500
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-15",
        "name": "finance/gateway-15",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-15",
        "name": "analytics/processor-15",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 512
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-15",
        "name": "payments/consumer-15",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#ea580c",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-15",
        "name": "security/service-15",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-support-deployment-job-15",
        "name": "support/job-15",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 32
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-16",
        "name": "platform/api-16",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 1,
          "memoryMiB": 32
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-16",
        "name": "operations/worker-16",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 64,
          "memoryMiB": 200
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-16",
        "name": "frontend/frontend-16",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-16",
        "name": "backend/backend-16",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 1,
          "memoryMiB": 32
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-16",
        "name": "data/scheduler-16",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#ea580c",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 1024
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-16",
        "name": "finance/gateway-16",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 200,
          "memoryMiB": 1024
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-16",
        "name": "analytics/processor-16",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 64,
          "memoryMiB": 200
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-16",
        "name": "payments/consumer-16",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#15803d",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-16",
        "name": "security/service-16",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 1024
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-16",
        "name": "support/job-16",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-platform-deployment-api-17",
        "name": "platform/api-17",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-operations-deployment-worker-17",
        "name": "operations/worker-17",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 128
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-17",
        "name": "frontend/frontend-17",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 32
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-17",
        "name": "backend/backend-17",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 250,
          "memoryMiB": 528
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-17",
        "name": "data/scheduler-17",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 30,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-17",
        "name": "finance/gateway-17",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 384
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-17",
        "name": "analytics/processor-17",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-17",
        "name": "payments/consumer-17",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-17",
        "name": "security/service-17",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 250,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-17",
        "name": "support/job-17",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 2000,
          "memoryMiB": 4096
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-18",
        "name": "platform/api-18",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 150,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-18",
        "name": "operations/worker-18",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 500,
          "memoryMiB": 2000
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-18",
        "name": "frontend/frontend-18",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 9216
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-18",
        "name": "backend/backend-18",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 3000,
          "memoryMiB": 3072
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 3
      },
      {
        "id": "wl-data-deployment-scheduler-18",
        "name": "data/scheduler-18",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 2000,
          "memoryMiB": 18432
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-18",
        "name": "finance/gateway-18",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 2000,
          "memoryMiB": 1024
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-18",
        "name": "analytics/processor-18",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 3000,
          "memoryMiB": 5120
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-18",
        "name": "payments/consumer-18",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 1024
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-18",
        "name": "security/service-18",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 2000,
          "memoryMiB": 7168
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-18",
        "name": "support/job-18",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 2000,
          "memoryMiB": 8192
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-19",
        "name": "platform/api-19",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 2000,
          "memoryMiB": 3584
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-19",
        "name": "operations/worker-19",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#7c3aed",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 1024
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-19",
        "name": "frontend/frontend-19",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-19",
        "name": "backend/backend-19",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#dc2626",
        "resources": {
          "cpuMillis": 30,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-19",
        "name": "data/scheduler-19",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#ea580c",
        "resources": {
          "cpuMillis": 1000,
          "memoryMiB": 1024
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-19",
        "name": "finance/gateway-19",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#4f46e5",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-19",
        "name": "analytics/processor-19",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 448
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-19",
        "name": "payments/consumer-19",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 576
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-security-deployment-service-19",
        "name": "security/service-19",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 1280
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-19",
        "name": "support/job-19",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 704
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-20",
        "name": "platform/api-20",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-20",
        "name": "operations/worker-20",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-20",
        "name": "frontend/frontend-20",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-20",
        "name": "backend/backend-20",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-data-deployment-scheduler-20",
        "name": "data/scheduler-20",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-20",
        "name": "finance/gateway-20",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-20",
        "name": "analytics/processor-20",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-20",
        "name": "payments/consumer-20",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 448
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-20",
        "name": "security/service-20",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-20",
        "name": "support/job-20",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-21",
        "name": "platform/api-21",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-operations-deployment-worker-21",
        "name": "operations/worker-21",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-21",
        "name": "frontend/frontend-21",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-21",
        "name": "backend/backend-21",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-21",
        "name": "data/scheduler-21",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 448
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-21",
        "name": "finance/gateway-21",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-21",
        "name": "analytics/processor-21",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-21",
        "name": "payments/consumer-21",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-security-deployment-service-21",
        "name": "security/service-21",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-21",
        "name": "support/job-21",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-22",
        "name": "platform/api-22",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-22",
        "name": "operations/worker-22",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 448
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-22",
        "name": "frontend/frontend-22",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-22",
        "name": "backend/backend-22",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-22",
        "name": "data/scheduler-22",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-finance-deployment-gateway-22",
        "name": "finance/gateway-22",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-22",
        "name": "analytics/processor-22",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-22",
        "name": "payments/consumer-22",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-22",
        "name": "security/service-22",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 448
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-22",
        "name": "support/job-22",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-23",
        "name": "platform/api-23",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-23",
        "name": "operations/worker-23",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-frontend-deployment-frontend-23",
        "name": "frontend/frontend-23",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-23",
        "name": "backend/backend-23",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-23",
        "name": "data/scheduler-23",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-23",
        "name": "finance/gateway-23",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 448
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-23",
        "name": "analytics/processor-23",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-23",
        "name": "payments/consumer-23",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-23",
        "name": "security/service-23",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 448
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-23",
        "name": "support/job-23",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 320
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-24",
        "name": "platform/api-24",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 384
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-24",
        "name": "operations/worker-24",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-24",
        "name": "frontend/frontend-24",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 384
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-24",
        "name": "backend/backend-24",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-24",
        "name": "data/scheduler-24",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 512
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-24",
        "name": "finance/gateway-24",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 576
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-24",
        "name": "analytics/processor-24",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 576
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 2
      },
      {
        "id": "wl-payments-deployment-consumer-24",
        "name": "payments/consumer-24",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#0891b2",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 640
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-24",
        "name": "security/service-24",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#b45309",
        "resources": {
          "cpuMillis": 50,
          "memoryMiB": 64
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-24",
        "name": "support/job-24",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {},
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-25",
        "name": "platform/api-25",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#be123c",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 128
        },
        "nodeSelector": {
          "type": "frontend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "frontend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-25",
        "name": "operations/worker-25",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-25",
        "name": "frontend/frontend-25",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#059669",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 256
        },
        "nodeSelector": {
          "type": "data"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "data",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-25",
        "name": "backend/backend-25",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 768
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-25",
        "name": "data/scheduler-25",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 100,
          "memoryMiB": 768
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-finance-deployment-gateway-25",
        "name": "finance/gateway-25",
        "kind": "Deployment",
        "team": "finance",
        "classification": "application",
        "color": "#ea580c",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-analytics-deployment-processor-25",
        "name": "analytics/processor-25",
        "kind": "Deployment",
        "team": "analytics",
        "classification": "application",
        "color": "#ea580c",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-payments-deployment-consumer-25",
        "name": "payments/consumer-25",
        "kind": "Deployment",
        "team": "payments",
        "classification": "application",
        "color": "#ea580c",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-security-deployment-service-25",
        "name": "security/service-25",
        "kind": "Deployment",
        "team": "security",
        "classification": "application",
        "color": "#ea580c",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-support-deployment-job-25",
        "name": "support/job-25",
        "kind": "Deployment",
        "team": "support",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-platform-deployment-api-26",
        "name": "platform/api-26",
        "kind": "Deployment",
        "team": "platform",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-operations-deployment-worker-26",
        "name": "operations/worker-26",
        "kind": "Deployment",
        "team": "operations",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-frontend-deployment-frontend-26",
        "name": "frontend/frontend-26",
        "kind": "Deployment",
        "team": "frontend",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-backend-deployment-backend-26",
        "name": "backend/backend-26",
        "kind": "Deployment",
        "team": "backend",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      },
      {
        "id": "wl-data-deployment-scheduler-26",
        "name": "data/scheduler-26",
        "kind": "Deployment",
        "team": "data",
        "classification": "application",
        "color": "#2563eb",
        "resources": {
          "cpuMillis": 0,
          "memoryMiB": 0
        },
        "nodeSelector": {
          "type": "backend"
        },
        "tolerations": [
          {
            "operator": "Equal",
            "key": "NodeType",
            "value": "backend",
            "effect": "NoSchedule"
          }
        ],
        "replicas": 1
      }
    ],
  }
]
