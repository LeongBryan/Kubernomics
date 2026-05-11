import { useEffect } from 'react'
import { simulateScenario } from './core/simulator'
import { useScenarioStore } from './store/scenarioStore'
import { useSimulationStore } from './store/simulationStore'
import { ConfigPanel } from './ui/editor/ConfigPanel'
import { NodeCanvas } from './ui/canvas/NodeCanvas'
import { TopNav } from './ui/shell/TopNav'
import { ScenarioTabs } from './ui/shell/ScenarioTabs'
import { PendingDrawer } from './ui/canvas/PendingDrawer'

function scenarioHash(scenario: Parameters<typeof simulateScenario>[0]): string {
  return JSON.stringify(scenario)
}

export default function App() {
  const scenarios = useScenarioStore((state) => state.scenarios)
  const setResult = useSimulationStore((state) => state.setResult)
  const lastRunHashes = useSimulationStore((state) => state.lastRunHashes)

  useEffect(() => {
    for (const scenario of scenarios) {
      const hash = scenarioHash(scenario)
      if (lastRunHashes[scenario.id] !== hash) {
        setResult(scenario.id, simulateScenario(scenario), hash)
      }
    }
  }, [scenarios, setResult, lastRunHashes])

  return (
    <div className="app-shell">
      <TopNav />
      <ScenarioTabs />
      <div className="editor-layout">
        <ConfigPanel />
        <NodeCanvas />
      </div>
      <PendingDrawer />
    </div>
  )
}
