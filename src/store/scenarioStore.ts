import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEFAULT_CLOUD,
  defaultRegionForProvider,
  defaultShapeForProvider,
  findCatalogShape,
  nodeShapePatch,
} from '../catalogs/providers'
import { clusterBaselineScenarios } from '../data/clusterBaseline'
import type { CloudProvider, CurrencyCode, NodePool, Scenario, ScenarioCloudSettings, Workload } from '../core/simulator'
import { createId } from '../utils/ids'

type ScenarioStore = {
  scenarios: Scenario[]
  activeScenarioId: string
  setActiveScenario: (id: string) => void
  setScenarios: (scenarios: Scenario[]) => void
  updateScenario: (id: string, patch: Partial<Scenario>) => void
  updateCloud: (scenarioId: string, cloud: Partial<ScenarioCloudSettings>) => void
  changeProvider: (scenarioId: string, provider: CloudProvider) => void
  changeRegion: (scenarioId: string, region: string) => void
  changeCurrency: (scenarioId: string, currency: CurrencyCode) => void
  updateNodePool: (scenarioId: string, poolId: string, patch: Partial<NodePool>) => void
  updateWorkload: (scenarioId: string, workloadId: string, patch: Partial<Workload>) => void
  addNodePool: (scenarioId: string) => void
  addWorkload: (scenarioId: string) => void
  deleteNodePool: (scenarioId: string, poolId: string) => void
  deleteWorkload: (scenarioId: string, workloadId: string) => void
  createVariant: () => void
  addScenario: (scenario: Scenario) => void
  replaceActiveScenario: (scenario: Scenario) => void
  deleteScenario: (id: string) => void
}

const defaultPool = (): NodePool => ({
  id: createId('pool'),
  name: 'new-pool',
  mode: 'manual',
  nodeCount: 1,
  labels: {},
  taints: [],
  ...nodeShapePatch(defaultShapeForProvider(DEFAULT_CLOUD.provider, DEFAULT_CLOUD.region), DEFAULT_CLOUD.region),
})

const defaultWorkload = (): Workload => ({
  id: createId('wl'),
  name: 'new-workload',
  kind: 'Deployment',
  team: 'application',
  classification: 'application',
  color: '#0f766e',
  replicas: 1,
  resources: { cpuMillis: 250, memoryMiB: 256 },
  nodeSelector: {},
  tolerations: [],
})

function normalizePool(pool: NodePool, cloud: ScenarioCloudSettings): NodePool {
  const provider = (pool.shape.provider?.toLowerCase() as CloudProvider | undefined) ?? cloud.provider
  const providerSku = pool.shape.providerSku ?? pool.shape.sku ?? pool.shape.name
  const vcpu = pool.shape.vcpu ?? pool.shape.vCpu ?? 0
  return {
    ...pool,
    maxPods: pool.maxPods ?? 110,
    shape: {
      ...pool.shape,
      provider,
      providerSku,
      region: pool.shape.region ?? cloud.region,
      vcpu,
      memoryMiB: pool.shape.memoryMiB,
      hourlyCost: pool.shape.hourlyCost ?? pool.hourlyCost,
      currency: pool.shape.currency ?? cloud.currency,
    },
  }
}

function normalizeScenario(scenario: Scenario): Scenario {
  const cloud = { ...DEFAULT_CLOUD, ...(scenario.cloud ?? {}) }
  return {
    ...scenario,
    cloud,
    nodePools: scenario.nodePools.map((pool) => normalizePool(pool, cloud)),
  }
}

function resetPoolsForProvider(pools: NodePool[], provider: CloudProvider, region: string): NodePool[] {
  const fallback = defaultShapeForProvider(provider, region)
  return pools.map((pool) => {
    const previousSku = pool.shape.providerSku ?? pool.shape.sku ?? pool.shape.name
    const entry = findCatalogShape(provider, previousSku, region) ?? fallback
    const metadata = { ...(pool.metadata ?? {}) }
    delete metadata.observedDailyCost
    delete metadata.observedNodeCount
    return {
      ...pool,
      metadata,
      ...nodeShapePatch(entry, region),
    }
  })
}

function repricePoolsForRegion(pools: NodePool[], provider: CloudProvider, region: string): NodePool[] {
  return pools.map((pool) => {
    const sku = pool.shape.providerSku ?? pool.shape.sku ?? pool.shape.name
    const entry = findCatalogShape(provider, sku, region)
    // TODO: plug in region-specific pricing. Until then, retain manual/observed cost if catalog lookup is absent.
    if (!entry) return { ...pool, shape: { ...pool.shape, region } }
    return { ...pool, ...nodeShapePatch(entry, region) }
  })
}

const initialScenarios = clusterBaselineScenarios.map(normalizeScenario)

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      scenarios: initialScenarios,
      activeScenarioId: initialScenarios[0].id,
      setActiveScenario: (id) => set({ activeScenarioId: id }),
      setScenarios: (scenarios) => set({ scenarios, activeScenarioId: scenarios[0]?.id ?? '' }),
      updateScenario: (id, patch) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) => (s.id === id ? normalizeScenario({ ...s, ...patch }) : s)),
        })),
      updateCloud: (scenarioId, cloud) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenarioId ? normalizeScenario({ ...s, cloud: { ...s.cloud, ...cloud } }) : s
          ),
        })),
      changeProvider: (scenarioId, provider) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) => {
            if (s.id !== scenarioId) return s
            const region = defaultRegionForProvider(provider)
            const cloud = { ...s.cloud, provider, region }
            return normalizeScenario({ ...s, cloud, nodePools: resetPoolsForProvider(s.nodePools, provider, region) })
          }),
        })),
      changeRegion: (scenarioId, region) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) => {
            if (s.id !== scenarioId) return s
            const cloud = { ...s.cloud, region }
            return normalizeScenario({ ...s, cloud, nodePools: repricePoolsForRegion(s.nodePools, cloud.provider, region) })
          }),
        })),
      changeCurrency: (scenarioId, currency) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenarioId ? normalizeScenario({ ...s, cloud: { ...s.cloud, currency } }) : s
          ),
        })),
      updateNodePool: (scenarioId, poolId, patch) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenarioId
              ? { ...s, nodePools: s.nodePools.map((p) => (p.id === poolId ? { ...p, ...patch } : p)) }
              : s
          ),
        })),
      updateWorkload: (scenarioId, workloadId, patch) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenarioId
              ? { ...s, workloads: s.workloads.map((w) => (w.id === workloadId ? { ...w, ...patch } : w)) }
              : s
          ),
        })),
      addNodePool: (scenarioId) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenarioId ? { ...s, nodePools: [...s.nodePools, defaultPool()] } : s
          ),
        })),
      addWorkload: (scenarioId) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenarioId ? { ...s, workloads: [...s.workloads, defaultWorkload()] } : s
          ),
        })),
      deleteNodePool: (scenarioId, poolId) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenarioId ? { ...s, nodePools: s.nodePools.filter((p) => p.id !== poolId) } : s
          ),
        })),
      deleteWorkload: (scenarioId, workloadId) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenarioId ? { ...s, workloads: s.workloads.filter((w) => w.id !== workloadId) } : s
          ),
        })),
      addScenario: (scenario) =>
        set((state) => {
          const normalized = normalizeScenario(scenario)
          return { scenarios: [...state.scenarios, normalized], activeScenarioId: normalized.id }
        }),
      replaceActiveScenario: (scenario) =>
        set((state) => {
          const normalized = normalizeScenario(scenario)
          const idx = state.scenarios.findIndex((s) => s.id === state.activeScenarioId)
          const next = idx === -1
            ? [...state.scenarios, normalized]
            : state.scenarios.map((s, i) => (i === idx ? normalized : s))
          return { scenarios: next, activeScenarioId: normalized.id }
        }),
      deleteScenario: (id) =>
        set((state) => {
          if (state.scenarios.length <= 1) return state
          const next = state.scenarios.filter((s) => s.id !== id)
          const activeStillExists = next.some((s) => s.id === state.activeScenarioId)
          const newActive = activeStillExists
            ? state.activeScenarioId
            : (next[Math.max(0, state.scenarios.findIndex((s) => s.id === id) - 1)]?.id ?? next[0].id)
          return { scenarios: next, activeScenarioId: newActive }
        }),
      createVariant: () => {
        const source =
          get().scenarios.find((s) => s.id === get().activeScenarioId) ??
          get().scenarios[0]
        if (!source) return
        const variant: Scenario = {
          ...structuredClone(source),
          id: createId('variant'),
          name: `${source.name} variant`,
          baselineId: source.id,
        }
        set((state) => ({ scenarios: [...state.scenarios, variant], activeScenarioId: variant.id }))
      },
    }),
    {
      name: 'kubernomics-scenarios-v1',
      partialize: (state) => ({ scenarios: state.scenarios, activeScenarioId: state.activeScenarioId }),
      merge: (persisted, current) => {
        const state = persisted as Partial<ScenarioStore>
        const scenarios = state.scenarios?.map(normalizeScenario) ?? current.scenarios
        return {
          ...current,
          ...state,
          scenarios,
          activeScenarioId: state.activeScenarioId ?? scenarios[0]?.id ?? '',
        }
      },
    }
  )
)
