import { useEffect, useRef, useState } from 'react'
import { useScenarioStore } from '../../store/scenarioStore'
import { useUiStore } from '../../store/uiStore'
import { NodePoolList } from './NodePoolList'
import { WorkloadList } from './WorkloadList'

type Tab = 'pools' | 'workloads'

export function ConfigPanel() {
  const scenarios = useScenarioStore((state) => state.scenarios)
  const activeScenarioId = useScenarioStore((state) => state.activeScenarioId)
  const updateScenario = useScenarioStore((state) => state.updateScenario)
  const scenario = scenarios.find((s) => s.id === activeScenarioId) ?? scenarios[0]
  const [tab, setTab] = useState<Tab>('pools')
  const [width, setWidth] = useState(380)
  const dragging = useRef(false)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const next = Math.max(240, Math.min(720, e.clientX))
      setWidth(next)
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  if (!scenario) return <aside className="config-panel" style={{ width }}>No scenario loaded.</aside>

  return (
    <aside className="config-panel" style={{ width }}>
      <div className="panel-tabs">
        <div className="segmented">
          <button className={tab === 'pools' ? 'panel-tab active' : 'panel-tab'} onClick={() => setTab('pools')}>
            Node Pools
          </button>
          <button className={tab === 'workloads' ? 'panel-tab active' : 'panel-tab'} onClick={() => setTab('workloads')}>
            Workloads
          </button>
        </div>
        <div className="panel-tab-strategy">
          <select
            value={scenario.schedulerStrategy}
            onChange={(e) =>
              updateScenario(scenario.id, {
                schedulerStrategy: e.target.value as 'Spread' | 'Bin-pack',
              })
            }
          >
            <option value="Spread">Spread</option>
            <option value="Bin-pack">Bin-pack</option>
          </select>
        </div>
      </div>

      <div className="panel-content">
        {tab === 'pools' && <NodePoolList scenario={scenario} />}
        {tab === 'workloads' && <WorkloadList scenario={scenario} />}
      </div>

      <div
        className="resize-handle"
        onPointerDown={() => { dragging.current = true }}
      />
    </aside>
  )
}
