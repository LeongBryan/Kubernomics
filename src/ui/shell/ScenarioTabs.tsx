import { useScenarioStore } from '../../store/scenarioStore'
import { useSimulationStore } from '../../store/simulationStore'
import { useUiStore } from '../../store/uiStore'
import { money } from '../lib/format'

export function ScenarioTabs() {
  const scenarios = useScenarioStore((state) => state.scenarios)
  const activeScenarioId = useScenarioStore((state) => state.activeScenarioId)
  const setActiveScenario = useScenarioStore((state) => state.setActiveScenario)
  const createVariant = useScenarioStore((state) => state.createVariant)
  const deleteScenario = useScenarioStore((state) => state.deleteScenario)
  const results = useSimulationStore((state) => state.results)
  const currency = useUiStore((state) => state.currency)
  const canDelete = scenarios.length > 1

  return (
    <nav className="scenario-tabs">
      {scenarios.map((scenario) => {
        const baselineResult = results[scenario.baselineId ?? '']
        const thisResult = results[scenario.id]
        const delta =
          baselineResult && thisResult
            ? thisResult.costSummary.hourly - baselineResult.costSummary.hourly
            : null

        return (
          <button
            key={scenario.id}
            className={scenario.id === activeScenarioId ? 'tab active' : 'tab'}
            onClick={() => setActiveScenario(scenario.id)}
          >
            <span>{scenario.name}</span>
            {delta !== null && (
              <span className={delta <= 0 ? 'badge good' : 'badge bad'}>
                {delta <= 0 ? '↓' : '↑'} {money(Math.abs(delta), currency)}/hr
              </span>
            )}
            {canDelete && (
              <span
                className="tab-delete"
                role="button"
                aria-label={`Delete ${scenario.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteScenario(scenario.id)
                }}
              >
                ×
              </span>
            )}
          </button>
        )
      })}
      <button className="tab add" onClick={() => createVariant()}>
        + New Variant
      </button>
    </nav>
  )
}
