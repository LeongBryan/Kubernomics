import { nodeHourlyCost, observedPoolDailyCost, type Scenario, type SimulationResult } from '../../core/simulator'
import { useUiStore } from '../../store/uiStore'
import { money } from '../lib/format'

const HOURS_PER_MONTH = 24 * 30

export function CostBreakdown({ scenario, result }: { scenario: Scenario; result?: SimulationResult }) {
  const currency = useUiStore((state) => state.currency)

  const rows = scenario.nodePools.map((pool) => {
    const resultNodes = result?.nodes.filter((n) => n.nodePoolId === pool.id).length
    const nodes = resultNodes ?? (pool.mode === 'manual' ? pool.nodeCount ?? 0 : pool.initialNodes ?? pool.minNodes ?? 0)
    const hourly = nodeHourlyCost(pool) * nodes
    const observedDaily = observedPoolDailyCost(pool)
    const estimatedDaily = hourly * 24
    const monthly = hourly * HOURS_PER_MONTH

    return { pool, nodes, hourly, monthly, observedDaily, estimatedDaily }
  })

  const totalMonthly = rows.reduce((s, r) => s + r.monthly, 0)

  return (
    <details className="cost-breakdown" open>
      <summary className="cost-heading">
        <h2>Node Pool Cost</h2>
        <strong>{money(totalMonthly, currency)}/mo</strong>
      </summary>
      <div className="cost-list">
        {rows.map((row) => (
          <div key={row.pool.id} className="cost-row">
            <div className="cost-row-main">
              <strong>{row.pool.name}</strong>
              <span>
                {row.pool.shape.name} · {row.nodes} node{row.nodes === 1 ? '' : 's'}
              </span>
            </div>
            <div className="cost-row-metrics">
              <span>
                <small>VM/hr</small>
                {money(row.pool.hourlyCost ?? row.pool.shape.hourlyCost ?? 0, currency)}
              </span>
              <span title={row.observedDaily === undefined ? 'Estimated from VM/hr and node count' : 'Observed billing run-rate'}>
                <small>VMSS/day</small>
                {money(row.observedDaily ?? row.estimatedDaily, currency)}
              </span>
              <span>
                <small>Pool/mo</small>
                {money(row.monthly, currency)}
              </span>
            </div>
          </div>
        ))}
        <div className="cost-total">
          <span>VMSS total</span>
          <strong>{money(totalMonthly, currency)}</strong>
        </div>
      </div>
    </details>
  )
}
