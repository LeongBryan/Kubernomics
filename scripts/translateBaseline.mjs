// One-time script: translates a local seed.ts schema into Kubernomics types.ts schema.
// Run: node scripts/translateBaseline.mjs <path-to-seed.ts>
import { readFileSync, writeFileSync } from 'fs'

const seedPath = process.argv[2]
if (!seedPath) {
  throw new Error('Usage: node scripts/translateBaseline.mjs <path-to-seed.ts>')
}

const raw = readFileSync(seedPath, 'utf8')

// Strip everything before the JSON array (TypeScript imports, comments, export statement)
const match = raw.match(/=\s*(\[[\s\S]*)/m)
const jsonText = match[1].trimEnd().replace(/;$/, '')

const seedScenarios = JSON.parse(jsonText)

function translatePool(pool) {
  const memoryMiB = Math.round(pool.memoryGiB * 1024)
  return {
    id: pool.id,
    name: pool.name,
    mode: pool.mode,
    ...(pool.mode === 'manual' ? { nodeCount: pool.nodeCount } : {
      initialNodes: pool.initialNodes ?? pool.nodeCount,
      minNodes: pool.minNodes ?? pool.nodeCount,
      maxNodes: pool.maxNodes ?? pool.nodeCount,
    }),
    shape: {
      id: pool.nodeShape.toLowerCase().replace(/_/g, '-'),
      name: pool.nodeShape,
      provider: 'azure',
      region: pool.labels['topology.kubernetes.io/region'] ?? 'southeastasia',
      providerSku: pool.nodeShape,
      vcpu: pool.vcpu,
      memoryMiB,
      hourlyCost: pool.hourlyCost,
    },
    hourlyCost: pool.hourlyCost,
    labels: pool.labels,
    taints: pool.taints.map(t => ({
      key: t.key,
      ...(t.value !== undefined ? { value: t.value } : {}),
      effect: t.effect,
    })),
    maxPods: pool.maxPodsPerNode,
    // Playground stores total reserved as a single field; put it all in systemReserved.
    systemReserved: {
      cpuMillis: pool.reservedCPUm,
      memoryMiB: pool.reservedMemoryMiB,
    },
    kubeReserved: { cpuMillis: 0, memoryMiB: 0 },
    ...(pool.observedDailyCost !== undefined ? {
      metadata: {
        observedDailyCost: String(pool.observedDailyCost),
        observedNodeCount: String(pool.nodeCount ?? pool.initialNodes ?? pool.minNodes ?? pool.maxNodes ?? 0),
      },
    } : {}),
  }
}

function translateToleration(t) {
  const out = { operator: t.operator }
  if (t.key !== undefined && t.key !== '') out.key = t.key
  if (t.value !== undefined) out.value = t.value
  if (t.effect !== undefined) out.effect = t.effect
  return out
}

function translateWorkload(wl) {
  const base = {
    id: wl.id,
    name: wl.name,
    kind: wl.kind,
    team: wl.team,
    classification: wl.priority, // "platform" | "system" | "application" — same values
    color: wl.color,
    resources: {
      cpuMillis: wl.cpuRequestm,
      memoryMiB: wl.memoryRequestMiB,
    },
    nodeSelector: wl.nodeSelector ?? {},
    tolerations: (wl.tolerations ?? []).map(translateToleration),
  }
  if (wl.kind === 'Deployment') {
    base.replicas = wl.replicas ?? 0
  }
  if (wl.kind === 'DaemonSet') {
    base.required = true
  }
  return base
}

function translateScenario(s) {
  return {
    schemaVersion: '0.1',
    id: s.id,
    name: s.name,
    description: s.description ?? 'Imported from cluster baseline.',
    cloud: { provider: 'azure', region: 'southeastasia', currency: 'USD' },
    schedulerStrategy: s.schedulingMode === 'spread' ? 'Spread' : 'Bin-pack',
    nodePools: s.nodePools.map(translatePool),
    workloads: s.workloads.map(translateWorkload),
    ...(s.isBaseline ? { metadata: { isBaseline: 'true' } } : {}),
  }
}

const translated = seedScenarios.map(translateScenario)

const output = `import type { Scenario } from '../core/simulator'

// Anonymized sample cluster baseline.
// hourlyCost: Azure Retail Prices API, Linux pay-as-you-go, southeastasia.
// observedDailyCost (in pool metadata): sample cloud cost management daily run-rate.
export const clusterBaselineScenarios: Scenario[] = ${JSON.stringify(translated, null, 2)}
`

writeFileSync(
  new URL('../src/data/clusterBaseline.ts', import.meta.url).pathname,
  output
)
console.log(`Wrote ${translated.length} scenario(s) with ${translated[0].nodePools.length} node pools and ${translated[0].workloads.length} workloads.`)
