import type { NodeResult, Placement, Scenario, SimulationResult } from '../../core/simulator'
import { cpu, memory, percent } from '../lib/format'

type ResourceView = 'cpu' | 'memory'

type Segment = {
  key: string
  label: string
  value: number
  color: string
}

function valueFor(resources: { cpuMillis: number; memoryMiB: number }, view: ResourceView): number {
  return view === 'cpu' ? resources.cpuMillis : resources.memoryMiB
}

function formatValue(value: number, view: ResourceView): string {
  return view === 'cpu' ? cpu(value) : memory(value)
}

function placementCategory(placement: Placement): string {
  if (placement.kind === 'DaemonSet') return 'DaemonSet tax'
  if (placement.classification === 'application') return placement.team
  return 'Platform workloads'
}

function colorFor(placement: Placement): string {
  if (placement.kind === 'DaemonSet') return '#0891b2'
  if (placement.classification === 'platform') return '#0f766e'
  if (placement.classification === 'system') return '#2563eb'
  return placement.color
}

function compactSegments(node: NodeResult, view: ResourceView): Segment[] {
  const groups = new Map<string, Segment>()
  const reserved = valueFor(node.reserved, view)
  if (reserved > 0) groups.set('reserved', { key: 'reserved', label: 'reserved', value: reserved, color: '#475569' })

  for (const placement of node.placements) {
    const key = placementCategory(placement)
    const current = groups.get(key) ?? { key, label: key, value: 0, color: colorFor(placement) }
    current.value += view === 'cpu' ? placement.cpuMillis : placement.memoryMiB
    groups.set(key, current)
  }

  const unused = valueFor(node.unused, view)
  if (unused > 0) groups.set('unused', { key: 'unused', label: 'unused', value: unused, color: '#e2e8f0' })
  return [...groups.values()].filter((segment) => segment.value > 0)
}

function NodeBar({ node, view }: { node: NodeResult; view: ResourceView }) {
  const total = valueFor(node.capacity, view)
  const used = valueFor(node.used, view) + valueFor(node.reserved, view)
  const utilization = total <= 0 ? 0 : used / total
  const segments = compactSegments(node, view)

  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)_6rem] items-center gap-3 border-b border-slate-100 py-2 last:border-b-0">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-800">
          {node.addedByAutoscaler ? '+ ' : ''}
          {node.name}
        </div>
        <div className="text-xs text-slate-500">{node.shapeName}</div>
      </div>
      <div className="h-8 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex h-full w-full">
          {segments.map((segment) => (
            <div
              key={segment.key}
              title={`${segment.label}: ${formatValue(segment.value, view)}`}
              className="h-full min-w-[2px]"
              style={{ width: `${Math.max(0, (segment.value / total) * 100)}%`, backgroundColor: segment.color }}
            />
          ))}
        </div>
      </div>
      <div className="text-right text-sm">
        <div className="font-semibold text-slate-800">{percent(utilization)}</div>
        <div className="text-xs text-slate-500">{node.podCount}/{node.maxPods} pods</div>
      </div>
    </div>
  )
}

export function NodeAllocationView({
  scenario,
  result,
  resourceView,
  setResourceView
}: {
  scenario: Scenario
  result: SimulationResult
  resourceView: ResourceView
  setResourceView: (view: ResourceView) => void
}) {
  return (
    <section className="border-b border-slate-200 bg-white px-5 py-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">Node Allocation</h2>
          <p className="mt-1 text-sm text-slate-600">Reserved capacity, DaemonSet tax, app requests, and unused capacity by node.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setResourceView('cpu')}
            className={
              resourceView === 'cpu'
                ? 'h-9 rounded-md border border-slate-900 bg-slate-900 px-3 text-sm font-semibold text-white'
                : 'h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700'
            }
          >
            CPU
          </button>
          <button
            type="button"
            onClick={() => setResourceView('memory')}
            className={
              resourceView === 'memory'
                ? 'h-9 rounded-md border border-slate-900 bg-slate-900 px-3 text-sm font-semibold text-white'
                : 'h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700'
            }
          >
            Memory
          </button>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
        {[
          ['reserved', '#475569'],
          ['DaemonSet tax', '#0891b2'],
          ['Platform workloads', '#0f766e'],
          ['Team Atlas', '#dc2626'],
          ['Team Borealis', '#16a34a'],
          ['Team Cygnus', '#9333ea'],
          ['unused', '#e2e8f0']
        ].map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {scenario.nodePools.map((pool) => {
          const nodes = result.nodes.filter((node) => node.nodePoolId === pool.id)
          const autoscale = result.autoscalingSummary.find((item) => item.nodePoolId === pool.id)
          return (
            <div key={pool.id} className="rounded-md border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{pool.name}</h3>
                  <span className="text-xs font-semibold text-slate-600">
                    {nodes.length} nodes - {pool.shape.name} - {autoscale?.mode ?? pool.mode}
                  </span>
                </div>
              </div>
              <div className="px-3">
                {nodes.map((node) => (
                  <NodeBar key={node.id} node={node} view={resourceView} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
