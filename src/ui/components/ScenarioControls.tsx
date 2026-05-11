import type { CapacityMode, NodeProfile } from '../../data/demoScenario'
import type { SchedulerStrategy } from '../../core/simulator'

type ScenarioSource = 'demo' | 'cluster-baseline'

function SegmentedButton<T extends string>({
  value,
  current,
  onClick,
  children
}: {
  value: T
  current: T
  onClick: (value: T) => void
  children: React.ReactNode
}) {
  const active = value === current
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={
        active
          ? 'h-9 rounded-md border border-teal-700 bg-teal-700 px-3 text-sm font-semibold text-white'
          : 'h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-slate-500'
      }
    >
      {children}
    </button>
  )
}

export function ScenarioControls({
  source,
  strategy,
  capacityMode,
  nodeProfile,
  setSource,
  setStrategy,
  setCapacityMode,
  setNodeProfile
}: {
  source: ScenarioSource
  strategy: SchedulerStrategy
  capacityMode: CapacityMode
  nodeProfile: NodeProfile
  setSource: (source: ScenarioSource) => void
  setStrategy: (strategy: SchedulerStrategy) => void
  setCapacityMode: (mode: CapacityMode) => void
  setNodeProfile: (profile: NodeProfile) => void
}) {
  return (
    <section className="border-b border-slate-200 bg-white px-5 py-4">
      <div className="flex flex-wrap gap-6">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Scenario</div>
          <div className="flex flex-wrap gap-2">
            <SegmentedButton value="demo" current={source} onClick={setSource}>
              Demo
            </SegmentedButton>
            <SegmentedButton value="cluster-baseline" current={source} onClick={setSource}>
              Cluster baseline
            </SegmentedButton>
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Scheduler strategy</div>
          <div className="flex flex-wrap gap-2">
            <SegmentedButton value="Spread" current={strategy} onClick={setStrategy}>
              Spread
            </SegmentedButton>
            <SegmentedButton value="Bin-pack" current={strategy} onClick={setStrategy}>
              Bin-pack
            </SegmentedButton>
          </div>
        </div>
        {source === 'demo' && (
          <>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Node mode</div>
              <div className="flex flex-wrap gap-2">
                <SegmentedButton value="manual" current={capacityMode} onClick={setCapacityMode}>
                  Manual
                </SegmentedButton>
                <SegmentedButton value="autoscale-to-fit" current={capacityMode} onClick={setCapacityMode}>
                  Autoscale-to-fit
                </SegmentedButton>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Node profile</div>
              <div className="flex flex-wrap gap-2">
                <SegmentedButton value="small-aks" current={nodeProfile} onClick={setNodeProfile}>
                  Small AKS
                </SegmentedButton>
                <SegmentedButton value="consolidated" current={nodeProfile} onClick={setNodeProfile}>
                  Consolidated
                </SegmentedButton>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
