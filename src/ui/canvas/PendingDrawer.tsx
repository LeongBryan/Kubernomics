import { useScenarioStore } from '../../store/scenarioStore'
import { useSimulationStore } from '../../store/simulationStore'
import { useUiStore } from '../../store/uiStore'

export function PendingDrawer() {
  const pendingOpen = useUiStore((state) => state.pendingOpen)
  const pendingWorkloadId = useUiStore((state) => state.pendingWorkloadId)
  const closePending = useUiStore((state) => state.closePending)
  const scenarios = useScenarioStore((state) => state.scenarios)
  const activeScenarioId = useScenarioStore((state) => state.activeScenarioId)
  const results = useSimulationStore((state) => state.results)

  if (!pendingOpen) return null

  const scenario = scenarios.find((s) => s.id === activeScenarioId) ?? scenarios[0]
  const result = scenario ? results[scenario.id] : undefined
  const pending = result?.pendingPods ?? []
  const filtered = pendingWorkloadId ? pending.filter((p) => p.workloadId === pendingWorkloadId) : pending

  const groups = new Map<string, typeof filtered>()
  for (const pod of filtered) {
    const list = groups.get(pod.workloadId) ?? []
    list.push(pod)
    groups.set(pod.workloadId, list)
  }

  return (
    <div className="pending-panel">
      <div className="pending-header">
        <h2>Pending pods {filtered.length > 0 ? `(${filtered.length})` : ''}</h2>
        <button onClick={closePending}>Close</button>
      </div>
      {filtered.length === 0 && <div className="empty">No pending pods.</div>}
      {[...groups.entries()].map(([workloadId, pods]) => {
        const workload = scenario?.workloads.find((w) => w.id === workloadId)
        const health = result?.workloadHealth.find((h) => h.workloadId === workloadId)
        return (
          <div key={workloadId} className="pending-group">
            <div className="pending-group-header">
              <div>
                <h3>{workload?.name ?? workloadId}</h3>
                <p>{workload?.kind} · {health?.scheduledPods}/{health?.desiredPods} scheduled</p>
              </div>
              <span className="badge bad">{pods.length} pending</span>
            </div>
            <div className="reason-summary">
              Reasons: {[...new Set(pods.flatMap((p) => p.reasons))].join(', ')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
