import type { SimulationResult } from '../../core/simulator'

function stateClass(state: string): string {
  if (state === 'Healthy') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (state === 'Degraded') return 'bg-amber-50 text-amber-800 ring-amber-200'
  return 'bg-rose-50 text-rose-700 ring-rose-200'
}

export function WorkloadHealthSummary({ result }: { result: SimulationResult }) {
  const rows = [...result.workloadHealth].sort((a, b) => {
    const rank = { Unhealthy: 0, Degraded: 1, Healthy: 2 }
    return rank[a.state] - rank[b.state] || a.workloadName.localeCompare(b.workloadName)
  })

  return (
    <section className="border-b border-slate-200 bg-white px-5 py-5">
      <h2 className="text-base font-bold text-slate-950">Workload Health</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="border-b border-slate-200 py-2 pr-3">Workload</th>
              <th className="border-b border-slate-200 py-2 pr-3">Kind</th>
              <th className="border-b border-slate-200 py-2 pr-3">Team</th>
              <th className="border-b border-slate-200 py-2 pr-3">Scheduled</th>
              <th className="border-b border-slate-200 py-2 pr-3">State</th>
              <th className="border-b border-slate-200 py-2 pr-3">Reasons</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.workloadId}>
                <td className="border-b border-slate-100 py-2 pr-3 font-semibold text-slate-900">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: row.color }} />
                  {row.workloadName}
                </td>
                <td className="border-b border-slate-100 py-2 pr-3 text-slate-700">{row.kind}</td>
                <td className="border-b border-slate-100 py-2 pr-3 text-slate-700">{row.team}</td>
                <td className="border-b border-slate-100 py-2 pr-3 text-slate-700">
                  {row.scheduledPods}/{row.desiredPods}
                </td>
                <td className="border-b border-slate-100 py-2 pr-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ring-1 ${stateClass(row.state)}`}>{row.state}</span>
                </td>
                <td className="border-b border-slate-100 py-2 pr-3 text-slate-600">
                  {row.unschedulableReasons.length > 0 ? row.unschedulableReasons.join(', ') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
