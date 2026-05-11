import type { NodePool, NodeResult, SimulationResult } from '../../core/simulator'
import { useUiStore } from '../../store/uiStore'
import { money } from '../lib/format'
import { NodeBar } from './NodeBar'

export function PoolGroup({
  pool,
  nodes,
  result,
}: {
  pool: NodePool
  nodes: NodeResult[]
  result?: SimulationResult
}) {
  const currency = useUiStore((state) => state.currency)
  const autoscaleRecord = result?.autoscalingSummary.find((r) => r.nodePoolId === pool.id)
  const addedNodes = autoscaleRecord?.addedNodes ?? 0

  return (
    <details className="pool-group" open>
      <summary className="pool-heading">
        <div>
          <h2>{pool.name}</h2>
          <span>
            {pool.shape.name} · {nodes.length} nodes · {money(pool.hourlyCost ?? pool.shape.hourlyCost ?? 0, currency)}/VM/hr
          </span>
        </div>
        {addedNodes > 0 && <span className="badge good">+{addedNodes} autoscaled</span>}
      </summary>
      <div className="node-list">
        {nodes.length === 0 ? (
          <div className="empty">No nodes in this pool.</div>
        ) : (
          nodes.map((node) => <NodeBar key={node.id} pool={pool} node={node} />)
        )}
      </div>
    </details>
  )
}
