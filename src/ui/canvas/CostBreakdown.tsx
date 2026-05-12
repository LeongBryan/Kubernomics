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
      <table>
        <thead>
          <tr>
            <th>Pool</th>
            <th>Shape</th>
            <th>Nodes</th>
            <th>VM/hr</th>
            <th>VMSS/day</th>
            <th>Pool/mo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.pool.id}>
              <td>{row.pool.name}</td>
              <td>{row.pool.shape.name}</td>
              <td>{row.nodes}</td>
              <td>{money(row.pool.hourlyCost ?? row.pool.shape.hourlyCost ?? 0, currency)}</td>
              <td title={row.observedDaily === undefined ? 'Estimated from VM/hr and node count' : 'Observed billing run-rate'}>
                {money(row.observedDaily ?? row.estimatedDaily, currency)}
              </td>
              <td>{money(row.monthly, currency)}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan={5}>VMSS total</td>
            <td>{money(totalMonthly, currency)}</td>
          </tr>
        </tbody>
      </table>
    </details>
  )
}
