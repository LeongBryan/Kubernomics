import type { Scenario } from '../../core/simulator'
import { useScenarioStore } from '../../store/scenarioStore'
import { NodePoolCard } from './NodePoolCard'

export function NodePoolList({ scenario }: { scenario: Scenario }) {
  const addNodePool = useScenarioStore((state) => state.addNodePool)

  return (
    <section className="panel-section">
      <div className="section-heading">
        <h2>Node Pools</h2>
        <button onClick={() => addNodePool(scenario.id)}>Add pool</button>
      </div>
      <div className="accordion-list">
        {scenario.nodePools.map((pool) => (
          <NodePoolCard key={pool.id} scenario={scenario} pool={pool} />
        ))}
      </div>
    </section>
  )
}
