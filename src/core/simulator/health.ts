import type { PendingPod, Placement, UnschedulableReason, Workload, WorkloadHealth } from './types'

function uniqueReasons(pendingPods: PendingPod[]): UnschedulableReason[] {
  const reasons = new Set<UnschedulableReason>()
  for (const pod of pendingPods) {
    for (const reason of pod.reasons) reasons.add(reason)
  }
  return [...reasons].sort()
}

export function computeWorkloadHealth({
  workloads,
  placements,
  pendingPods,
  desiredPods
}: {
  workloads: Workload[]
  placements: Placement[]
  pendingPods: PendingPod[]
  desiredPods: Map<string, number>
}): WorkloadHealth[] {
  return workloads.map((workload) => {
    const scheduled = placements.filter((placement) => placement.workloadId === workload.id).length
    const pending = pendingPods.filter((pod) => pod.workloadId === workload.id)
    const desired = desiredPods.get(workload.id) ?? (workload.kind === 'Deployment' ? workload.replicas ?? 0 : scheduled + pending.length)
    const hasRequiredDaemonSetFailure =
      workload.kind === 'DaemonSet' && workload.required === true && pending.some((pod) => pod.reasons.includes('DaemonSetRequiredButUnschedulable'))
    const state = desired === scheduled && pending.length === 0 ? 'Healthy' : scheduled > 0 && !hasRequiredDaemonSetFailure ? 'Degraded' : 'Unhealthy'

    return {
      workloadId: workload.id,
      workloadName: workload.name,
      kind: workload.kind,
      team: workload.team,
      classification: workload.classification,
      color: workload.color,
      desiredPods: desired,
      scheduledPods: scheduled,
      pendingPods: pending.length,
      state,
      unschedulableReasons: uniqueReasons(pending)
    }
  })
}
