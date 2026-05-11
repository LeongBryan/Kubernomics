import yaml from 'js-yaml'
import { DEFAULT_CLOUD, nodeShapeCatalog, nodeShapePatch } from '../catalogs/providers'
import type { CloudProvider, CurrencyCode, NodePool, Scenario, Taint, Toleration, Workload } from '../core/simulator/types'
import { SCENARIO_SCHEMA_VERSION } from '../core/simulator/schemaVersions'
import { createId } from './ids'

// ── Human-readable YAML schema ────────────────────────────────────────────────

interface YamlTaint {
  key: string
  value?: string
  effect: Taint['effect']
}

interface YamlToleration {
  key?: string
  value?: string
  effect?: Toleration['effect']
}

interface YamlNodePool {
  name: string
  vm: string
  mode: 'manual' | 'autoscale'
  nodes?: number
  min?: number
  max?: number
  labels?: Record<string, string>
  taints?: YamlTaint[]
}

interface YamlWorkload {
  name: string
  kind: string
  team?: string
  class?: string
  color?: string
  replicas?: number
  cpu: string
  memory: string
  nodeSelector?: Record<string, string>
  tolerations?: YamlToleration[]
  required?: boolean
}

interface YamlScenario {
  name: string
  description?: string
  provider?: CloudProvider
  region?: string
  currency?: CurrencyCode
  strategy: 'Spread' | 'Bin-pack'
  nodePools: YamlNodePool[]
  workloads: YamlWorkload[]
}

// ── Resource string helpers (Kubernetes format) ───────────────────────────────

function cpuMillisToStr(m: number): string {
  return `${m}m`
}

function memMiBToStr(mib: number): string {
  if (mib >= 1024 && mib % 1024 === 0) return `${mib / 1024}Gi`
  return `${mib}Mi`
}

function cpuStrToMillis(s: string): number {
  const str = String(s).trim()
  if (str.endsWith('m')) return parseInt(str, 10)
  return Math.round(parseFloat(str) * 1000)
}

function memStrToMiB(s: string): number {
  const str = String(s).trim()
  if (str.endsWith('Gi')) return Math.round(parseFloat(str) * 1024)
  if (str.endsWith('G')) return Math.round(parseFloat(str) * 1024)
  if (str.endsWith('Mi')) return parseInt(str, 10)
  if (str.endsWith('M')) return parseInt(str, 10)
  return parseInt(str, 10)
}

// ── Default colors by classification ─────────────────────────────────────────

const CLASS_COLORS: Record<string, string> = {
  platform: '#0284c7',
  system: '#7c3aed',
  application: '#0f766e',
}

// ── Export ────────────────────────────────────────────────────────────────────

export function exportScenarioYaml(scenario: Scenario): string {
  const out: YamlScenario = {
    name: scenario.name,
    provider: scenario.cloud.provider,
    region: scenario.cloud.region,
    currency: scenario.cloud.currency,
    strategy: scenario.schedulerStrategy,
    nodePools: scenario.nodePools.map((pool): YamlNodePool => {
      const p: YamlNodePool = {
        name: pool.name,
        vm: pool.shape.providerSku ?? pool.shape.sku ?? pool.shape.name,
        mode: pool.mode === 'autoscale-to-fit' ? 'autoscale' : 'manual',
      }
      if (pool.mode === 'manual') {
        p.nodes = pool.nodeCount ?? 0
      } else {
        p.min = pool.minNodes ?? 0
        p.max = pool.maxNodes ?? pool.initialNodes ?? 10
      }
      if (pool.labels && Object.keys(pool.labels).length) p.labels = pool.labels
      if (pool.taints && pool.taints.length) {
        p.taints = pool.taints.map((t) => ({
          key: t.key,
          ...(t.value ? { value: t.value } : {}),
          effect: t.effect,
        }))
      }
      return p
    }),
    workloads: scenario.workloads.map((w): YamlWorkload => {
      const o: YamlWorkload = {
        name: w.name,
        kind: w.kind,
        cpu: cpuMillisToStr(w.resources.cpuMillis),
        memory: memMiBToStr(w.resources.memoryMiB),
      }
      if (w.team) o.team = w.team
      if (w.classification) o.class = w.classification
      // Only emit color if it differs from the class default (saves clutter for 255 workloads)
      if (w.color && w.color !== CLASS_COLORS[w.classification]) o.color = w.color
      if (w.replicas !== undefined) o.replicas = w.replicas
      if (w.nodeSelector && Object.keys(w.nodeSelector).length) o.nodeSelector = w.nodeSelector
      if (w.tolerations && w.tolerations.length) {
        o.tolerations = w.tolerations.map((t) => ({
          ...(t.key !== undefined ? { key: t.key } : {}),
          ...(t.value ? { value: t.value } : {}),
          ...(t.effect ? { effect: t.effect } : {}),
        }))
      }
      if (w.required) o.required = true
      return o
    }),
  }
  if (scenario.description) out.description = scenario.description

  return yaml.dump(out, { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false })
}

// ── Import ────────────────────────────────────────────────────────────────────

const VALID_KINDS = new Set(['Deployment', 'DaemonSet'])
const VALID_CLASSES = new Set(['platform', 'system', 'application'])

export function importScenarioYaml(raw: string): Scenario {
  let data: unknown
  try {
    data = yaml.load(raw)
  } catch (e) {
    throw new Error(`YAML parse error: ${(e as Error).message}`)
  }

  if (!data || typeof data !== 'object') throw new Error('Expected a YAML object at top level')
  const d = data as Partial<YamlScenario>

  if (!d.name) throw new Error('Missing required field: name')
  if (!Array.isArray(d.nodePools) || d.nodePools.length === 0)
    throw new Error('nodePools must be a non-empty array')
  if (!Array.isArray(d.workloads)) throw new Error('workloads must be an array')

  const strategy = d.strategy ?? 'Spread'
  if (strategy !== 'Spread' && strategy !== 'Bin-pack')
    throw new Error("strategy must be 'Spread' or 'Bin-pack'")
  const cloud = {
    ...DEFAULT_CLOUD,
    provider: d.provider ?? DEFAULT_CLOUD.provider,
    region: d.region ?? DEFAULT_CLOUD.region,
    currency: d.currency ?? DEFAULT_CLOUD.currency,
  }
  const catalog = nodeShapeCatalog(cloud.provider, cloud.region)
  const validShapes = new Set(catalog.map((s) => s.sku))

  const nodePools: NodePool[] = d.nodePools.map((p, i) => {
    if (!p.name) throw new Error(`nodePools[${i}]: missing name`)
    if (!p.vm) throw new Error(`nodePools[${i}]: missing vm`)
    const entry = catalog.find((shape) => shape.sku === p.vm || shape.displayName === p.vm)
    if (!entry || !validShapes.has(entry.sku)) {
      throw new Error(
        `nodePools[${i}]: unknown vm '${p.vm}'. Valid: ${[...validShapes].join(', ')}`
      )
    }
    const patch = nodeShapePatch(entry, cloud.region)
    const base = {
      id: createId('pool'),
      name: p.name,
      ...patch,
      labels: p.labels ?? {},
      taints: (p.taints ?? []).map((t) => ({
        key: t.key,
        ...(t.value ? { value: t.value } : {}),
        effect: t.effect ?? 'NoSchedule',
      })),
      maxPods: 110,
    }
    const isAutoscale =
      p.mode === 'autoscale' ||
      (p.nodes === undefined && (p.min !== undefined || p.max !== undefined))
    if (isAutoscale) {
      return {
        ...base,
        mode: 'autoscale-to-fit' as const,
        initialNodes: p.min ?? 0,
        minNodes: p.min ?? 0,
        maxNodes: p.max ?? 10,
      }
    }
    return { ...base, mode: 'manual' as const, nodeCount: p.nodes ?? 1 }
  })

  const workloads: Workload[] = d.workloads.map((w, i) => {
    if (!w.name) throw new Error(`workloads[${i}]: missing name`)
    if (!w.cpu) throw new Error(`workloads[${i}]: missing cpu`)
    if (!w.memory) throw new Error(`workloads[${i}]: missing memory`)
    const kind = (w.kind ?? 'Deployment') as 'Deployment' | 'DaemonSet'
    if (!VALID_KINDS.has(kind)) throw new Error(`workloads[${i}]: invalid kind '${kind}'`)
    const cls = (w.class ?? 'application') as 'platform' | 'system' | 'application'
    if (!VALID_CLASSES.has(cls)) throw new Error(`workloads[${i}]: invalid class '${w.class}'`)
    return {
      id: createId('wl'),
      name: w.name,
      kind,
      team: w.team ?? '',
      classification: cls,
      color: w.color ?? CLASS_COLORS[cls] ?? '#0f766e',
      resources: {
        cpuMillis: cpuStrToMillis(w.cpu),
        memoryMiB: memStrToMiB(w.memory),
      },
      replicas: w.replicas ?? 1,
      nodeSelector: w.nodeSelector ?? {},
      tolerations: (w.tolerations ?? []).map((t) => ({
        ...(t.key !== undefined ? { key: t.key } : {}),
        operator: t.value !== undefined ? ('Equal' as const) : ('Exists' as const),
        ...(t.value ? { value: t.value } : {}),
        ...(t.effect ? { effect: t.effect } : {}),
      })),
      required: w.required ?? false,
    }
  })

  return {
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    id: createId('scenario'),
    name: d.name,
    description: d.description ?? '',
    cloud,
    schedulerStrategy: strategy,
    nodePools,
    workloads,
  }
}
