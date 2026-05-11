import type { NodePool, NodeResult } from '../../core/simulator'
import { useUiStore } from '../../store/uiStore'
import { cpu, memory, pct } from '../lib/format'
import { NodeSegment, type Segment } from './NodeSegment'

function compactSegments(segments: Segment[]): Segment[] {
  const out: Segment[] = []
  for (const seg of segments) {
    const prev = out[out.length - 1]
    if (prev && prev.color === seg.color && prev.className === seg.className && prev.label === seg.label) {
      const count = (prev.podCount ?? 1) + 1
      prev.value += seg.value
      prev.key = `${prev.key}+${seg.key}`
      prev.podCount = count
      prev.tooltip = [
        prev.className === 'daemonset' ? 'DaemonSet tax' : 'Deployment workload',
        prev.label,
        `${count} pods`,
      ].join('\n')
    } else {
      out.push({ ...seg, podCount: 1 })
    }
  }
  return out
}

export function NodeBar({ pool, node }: { pool: NodePool; node: NodeResult }) {
  const resourceView = useUiStore((state) => state.resourceView)
  const colorBy = useUiStore((state) => state.colorBy)
  const segmentMode = useUiStore((state) => state.segmentMode)

  const total = resourceView === 'cpu' ? (pool.shape.vcpu ?? pool.shape.vCpu ?? 0) * 1000 : pool.shape.memoryMiB
  const reservedVal =
    resourceView === 'cpu'
      ? pool.systemReserved.cpuMillis + pool.kubeReserved.cpuMillis
      : pool.systemReserved.memoryMiB + pool.kubeReserved.memoryMiB

  const segments: Segment[] = [
    {
      key: 'reserved',
      label: 'reserved',
      value: reservedVal,
      color: '#4b5563',
      className: 'reserved',
      tooltip: [
        'System reserved',
        `${pool.name} node #${node.ordinal}`,
        resourceView === 'cpu' ? cpu(reservedVal) : memory(reservedVal),
        'AKS/kubelet/system reservation before pods',
      ].join('\n'),
    },
  ]

  for (const placement of node.placements) {
    const value = resourceView === 'cpu' ? placement.cpuMillis : placement.memoryMiB
    const color =
      colorBy === 'team'
        ? placement.color
        : placement.kind === 'DaemonSet'
          ? '#0891b2'
          : '#ca8a04'

    segments.push({
      key: `${placement.podId}`,
      label: placement.workloadName,
      value,
      color,
      className: placement.kind === 'DaemonSet' ? 'daemonset' : 'deployment',
      tooltip: [
        placement.kind === 'DaemonSet' ? 'DaemonSet tax' : 'Deployment workload',
        placement.workloadName,
        `Team: ${placement.team}`,
        `${resourceView === 'cpu' ? 'CPU' : 'Memory'}: ${resourceView === 'cpu' ? cpu(value) : memory(value)}`,
        placement.score !== null ? `Score: ${placement.score}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  const displaySegments = segmentMode === 'compact' ? compactSegments(segments) : segments

  const used = segments.reduce((sum, s) => sum + s.value, 0)
  const unused = Math.max(0, total - used)
  displaySegments.push({
    key: 'unused',
    label: 'unused',
    value: unused,
    color: '#e5e7eb',
    className: 'unused',
    tooltip: [
      'Unused capacity',
      `${pool.name} node #${node.ordinal}`,
      resourceView === 'cpu' ? cpu(unused) : memory(unused),
    ].join('\n'),
  })

  const utilisation = total === 0 ? 0 : ((total - unused) / total) * 100

  return (
    <div className={node.addedByAutoscaler ? 'node-row autoscaled' : 'node-row'}>
      <div className="node-label">
        {node.addedByAutoscaler && <span className="plus">+</span>}
        <span>#{node.ordinal}</span>
        <small>{pct(utilisation)}</small>
      </div>
      <div className="stacked-bar" aria-label={`${pool.name} node ${node.ordinal}`}>
        {displaySegments
          .filter((s) => s.value > 0)
          .map((s) => (
            <NodeSegment key={s.key} segment={s} total={total} showSeparator={segmentMode === 'pods'} />
          ))}
      </div>
    </div>
  )
}
