import type { SimulationResult } from '../../core/simulator'
import { money } from '../lib/format'

export function CostSummary({ result }: { result: SimulationResult }) {
  return (
    <section className="bg-white px-5 py-5">
      <h2 className="text-base font-bold text-slate-950">Cost Summary</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">By Node Pool</h3>
          <div className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200">
            {result.costSummary.byNodePool.map((bucket) => (
              <div key={bucket.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">{bucket.name}</span>
                <span className="text-slate-700">{money(bucket.hourly)}/hr</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">By Team Request Share</h3>
          <div className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200">
            {result.costSummary.byTeam.map((bucket) => (
              <div key={bucket.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">{bucket.name}</span>
                <span className="text-slate-700">{money(bucket.hourly)}/hr</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">System tax</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{money(result.costSummary.systemTaxHourly)}/hr</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unused capacity</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{money(result.costSummary.unusedCapacityHourly)}/hr</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Autoscale delta</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{money(result.costSummary.addedNodesHourly)}/hr</div>
        </div>
      </div>
    </section>
  )
}
