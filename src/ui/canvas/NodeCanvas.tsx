import { useMemo } from 'react'
import { adviseRepack } from '../../core/advisor'
import { nodeHourlyCost } from '../../core/simulator'
import { useScenarioStore } from '../../store/scenarioStore'
import { useSimulationStore } from '../../store/simulationStore'
import { useUiStore } from '../../store/uiStore'
import { money } from '../lib/format'
import { CanvasControls } from './CanvasControls'
import { CostBreakdown } from './CostBreakdown'
import { PoolGroup } from './PoolGroup'
import { RepackAdvisorPanel } from '../components/RepackAdvisorPanel'

export function NodeCanvas() {
  const scenarios = useScenarioStore((state) => state.scenarios)
  const activeScenarioId = useScenarioStore((state) => state.activeScenarioId)
  const results = useSimulationStore((state) => state.results)
  const currency = useUiStore((state) => state.currency)
  const pendingOpen = useUiStore((state) => state.pendingOpen)
  const openPending = useUiStore((state) => state.openPending)
  const closePending = useUiStore((state) => state.closePending)

  const scenario = scenarios.find((s) => s.id === activeScenarioId) ?? scenarios[0]
  const result = scenario ? results[scenario.id] : undefined
  const advisor = useMemo(() => (scenario && result ? adviseRepack(scenario, result) : undefined), [scenario, result])

  if (!scenario) return <section className="canvas-panel">No scenario.</section>

  const nodeCount = result?.nodes.length ?? scenario.nodePools.reduce((s, p) => s + (p.nodeCount ?? p.initialNodes ?? p.minNodes ?? 0), 0)
  const unhealthyCount = result?.workloadHealth.filter((h) => h.state !== 'Healthy').length ?? 0
  const pendingCount = result?.pendingPods.length ?? 0
  const strategyLabel = (result?.schedulerStrategy ?? scenario.schedulerStrategy) === 'Spread' ? 'Spread' : 'Bin-pack'

  const effectiveMonthly = result?.costSummary.monthly ?? scenario.nodePools.reduce((sum, pool) => {
    const nodes = pool.nodeCount ?? pool.initialNodes ?? pool.minNodes ?? 0
    return sum + nodeHourlyCost(pool) * nodes * 24 * 30
  }, 0)
  const effectiveDaily = effectiveMonthly / 30
  return (
    <section className="canvas-panel">
      <div className="canvas-sticky-header">
        <div className="canvas-header">
          <div>
            <h1>{scenario.name}</h1>
            <p>
              {nodeCount} nodes
              {` · ${money(effectiveDaily, currency)}/day · ${money(effectiveMonthly, currency)}/mo`}
              {' · '}{unhealthyCount} unhealthy{' · '}{strategyLabel}
            </p>
          </div>
          <div className="canvas-header-actions">
            <button
              className={pendingOpen ? 'pending-action active' : 'pending-action'}
              disabled={pendingCount === 0}
              onClick={() => pendingOpen ? closePending() : openPending()}
            >
              Pending <span className={pendingCount > 0 ? 'badge warn' : 'badge neutral'}>{pendingCount}</span>
            </button>
            <CanvasControls />
          </div>
        </div>
      </div>

      <div className="canvas-body">
        {advisor && <RepackAdvisorPanel advisor={advisor} />}
        <CostBreakdown scenario={scenario} result={result} />
        <div className="pool-list">
          {scenario.nodePools.map((pool) => (
            <PoolGroup
              key={pool.id}
              pool={pool}
              nodes={result?.nodes.filter((n) => n.nodePoolId === pool.id) ?? []}
              result={result}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
