import type { SimulationResult } from '../../core/simulator'

export function PendingPanel({ result }: { result: SimulationResult }) {
  const pendingByWorkload = result.pendingPods.reduce<Record<string, typeof result.pendingPods>>((groups, pod) => {
    groups[pod.workloadName] = groups[pod.workloadName] ?? []
    groups[pod.workloadName].push(pod)
    return groups
  }, {})

  return (
    <section className="border-b border-slate-200 bg-slate-50 px-5 py-5">
      <h2 className="text-base font-bold text-slate-950">Pending / Unschedulable</h2>
      {result.pendingPods.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No pending pods in this scenario.</p>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {Object.entries(pendingByWorkload).map(([workloadName, pods]) => (
            <div key={workloadName} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-slate-900">{workloadName}</h3>
                <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">{pods.length} pending</span>
              </div>
              <div className="mt-3 grid gap-2">
                {pods.slice(0, 4).map((pod) => (
                  <div key={pod.podId} className="text-sm text-slate-700">
                    <div className="font-semibold">Pod {pod.ordinal + 1}</div>
                    <div className="text-slate-600">{pod.reasons.join(', ')}</div>
                    {pod.autoscaleAttempted && <div className="text-xs font-semibold text-amber-700">Autoscale-to-fit attempted</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
