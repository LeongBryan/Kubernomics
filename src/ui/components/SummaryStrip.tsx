import type { SimulationResult } from '../../core/simulator'
import { useUiStore } from '../../store/uiStore'
import { cpu, memory, money } from '../lib/format'

export function SummaryStrip({ result }: { result: SimulationResult }) {
  const currency = useUiStore((state) => state.currency)
  const unhealthy = result.workloadHealth.filter((workload) => workload.state !== 'Healthy').length
  const addedNodes = result.autoscalingSummary.reduce((sum, item) => sum + item.addedNodes, 0)

  const items = [
    { label: 'Hourly cost', value: money(result.costSummary.hourly, currency) },
    { label: 'Monthly run-rate', value: money(result.costSummary.monthly, currency) },
    { label: 'Nodes', value: `${result.nodes.length}` },
    { label: 'Added nodes', value: `${addedNodes}` },
    { label: 'Unhealthy workloads', value: `${unhealthy}` },
    { label: 'System tax', value: money(result.costSummary.systemTaxHourly, currency) },
    { label: 'Unused cost', value: money(result.costSummary.unusedCapacityHourly, currency) },
    { label: 'Unused capacity', value: `${cpu(result.capacitySummary.unused.cpuMillis)} / ${memory(result.capacitySummary.unused.memoryMiB)}` }
  ]

  return (
    <section className="border-b border-slate-200 bg-slate-50 px-5 py-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {items.map((item) => (
          <div key={item.label} className="min-h-20 rounded-md border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</div>
            <div className="mt-2 break-words text-lg font-bold text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
