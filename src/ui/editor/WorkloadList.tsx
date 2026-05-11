import { useMemo, useState } from 'react'
import type { Scenario } from '../../core/simulator'
import { useScenarioStore } from '../../store/scenarioStore'
import { useSimulationStore } from '../../store/simulationStore'
import { WorkloadCard } from './WorkloadCard'

type KindFilter = 'all' | 'DaemonSet' | 'Deployment'
type HealthFilter = 'all' | 'needs-space' | 'Healthy' | 'Degraded' | 'Unhealthy'
type WorkloadSort = 'namespace' | 'name' | 'kind' | 'health' | 'pending' | 'cpu' | 'memory' | 'replicas'
type SortDir = 'asc' | 'desc'

function namespaceOf(name: string) {
  const [ns] = name.split('/')
  return name.includes('/') && ns ? ns : '(none)'
}

function healthRank(state?: string) {
  if (state === 'Unhealthy') return 0
  if (state === 'Degraded') return 1
  if (state === 'Healthy') return 2
  return 3
}

export function WorkloadList({ scenario }: { scenario: Scenario }) {
  const addWorkload = useScenarioStore((state) => state.addWorkload)
  const result = useSimulationStore((state) => state.results[scenario.id])
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [nsFilter, setNsFilter] = useState('all')
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all')
  const [sortBy, setSortBy] = useState<WorkloadSort>('namespace')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const healthByWorkload = useMemo(
    () => new Map(result?.workloadHealth.map((h) => [h.workloadId, h]) ?? []),
    [result?.workloadHealth]
  )

  const namespaces = useMemo(
    () => [...new Set(scenario.workloads.map((w) => namespaceOf(w.name)))].sort((a, b) => a.localeCompare(b)),
    [scenario.workloads]
  )

  const visibleWorkloads = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return scenario.workloads
      .filter((w) => {
        const h = healthByWorkload.get(w.id)
        if (kindFilter !== 'all' && w.kind !== kindFilter) return false
        if (nsFilter !== 'all' && namespaceOf(w.name) !== nsFilter) return false
        if (healthFilter === 'needs-space') return (h?.pendingPods ?? 0) > 0
        if (healthFilter !== 'all' && h?.state !== healthFilter) return false
        return true
      })
      .sort((a, b) => {
        const ah = healthByWorkload.get(a.id)
        const bh = healthByWorkload.get(b.id)
        let val = 0
        if (sortBy === 'namespace') val = namespaceOf(a.name).localeCompare(namespaceOf(b.name)) || a.name.localeCompare(b.name)
        if (sortBy === 'name') val = a.name.localeCompare(b.name)
        if (sortBy === 'kind') val = a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name)
        if (sortBy === 'health') val = healthRank(ah?.state) - healthRank(bh?.state) || a.name.localeCompare(b.name)
        if (sortBy === 'pending') val = (ah?.pendingPods ?? 0) - (bh?.pendingPods ?? 0) || a.name.localeCompare(b.name)
        if (sortBy === 'cpu') val = a.resources.cpuMillis - b.resources.cpuMillis || a.name.localeCompare(b.name)
        if (sortBy === 'memory') val = a.resources.memoryMiB - b.resources.memoryMiB || a.name.localeCompare(b.name)
        if (sortBy === 'replicas') val = (a.replicas ?? 0) - (b.replicas ?? 0) || a.name.localeCompare(b.name)
        return val * dir
      })
  }, [healthFilter, kindFilter, nsFilter, healthByWorkload, scenario.workloads, sortBy, sortDir])

  const needsSpaceCount = scenario.workloads.filter((w) => (healthByWorkload.get(w.id)?.pendingPods ?? 0) > 0).length

  return (
    <section className="panel-section">
      <div className="section-heading">
        <h2>Workloads</h2>
        <button onClick={() => addWorkload(scenario.id)}>Add workload</button>
      </div>
      <div className="workload-controls">
        <label className="field">
          <span>Kind</span>
          <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as KindFilter)}>
            <option value="all">All kinds</option>
            <option value="Deployment">Deployment</option>
            <option value="DaemonSet">DaemonSet</option>
          </select>
        </label>
        <label className="field">
          <span>Namespace</span>
          <select value={nsFilter} onChange={(e) => setNsFilter(e.target.value)}>
            <option value="all">All namespaces</option>
            {namespaces.map((ns) => (
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Health</span>
          <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value as HealthFilter)}>
            <option value="all">All health</option>
            <option value="needs-space">Needs space ({needsSpaceCount})</option>
            <option value="Healthy">Healthy</option>
            <option value="Degraded">Degraded</option>
            <option value="Unhealthy">Unhealthy</option>
          </select>
        </label>
        <label className="field">
          <span>Sort</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as WorkloadSort)}>
            <option value="namespace">Namespace</option>
            <option value="name">Name</option>
            <option value="kind">Kind</option>
            <option value="health">Health</option>
            <option value="pending">Pods needing space</option>
            <option value="cpu">CPU request</option>
            <option value="memory">Memory request</option>
            <option value="replicas">Replicas</option>
          </select>
        </label>
        <button className="sort-direction" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>
          {sortDir === 'asc' ? 'Asc' : 'Desc'}
        </button>
      </div>
      <div className="workload-count">
        Showing {visibleWorkloads.length} of {scenario.workloads.length} workloads
      </div>
      <div className="accordion-list">
        {visibleWorkloads.map((w) => (
          <WorkloadCard key={w.id} scenario={scenario} workload={w} workloadHealth={healthByWorkload.get(w.id)} />
        ))}
        {visibleWorkloads.length === 0 && <div className="empty">No workloads match the current filters.</div>}
      </div>
    </section>
  )
}
