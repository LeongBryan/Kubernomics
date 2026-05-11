import { useState } from 'react'

export type Segment = {
  key: string
  label: string
  value: number
  color: string
  className?: string
  tooltip: string
  podCount?: number
}

export function NodeSegment({
  segment,
  total,
  showSeparator,
}: {
  segment: Segment
  total: number
  showSeparator?: boolean
}) {
  const width = total === 0 ? 0 : (segment.value / total) * 100
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  return (
    <>
      <div
        className={`node-segment ${segment.className ?? ''} ${showSeparator && segment.className !== 'unused' ? 'pod-separated' : ''}`}
        style={{ width: `${width}%`, background: segment.color }}
        aria-label={segment.tooltip}
        onMouseEnter={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setPos(null)}
        tabIndex={0}
        onFocus={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setPos({ x: r.left + r.width / 2, y: r.top })
        }}
        onBlur={() => setPos(null)}
      >
        {width > 8 && <span>{segment.label}</span>}
      </div>
      {pos && (
        <div className="segment-tooltip" style={{ left: pos.x + 12, top: pos.y + 12 }}>
          {segment.tooltip}
        </div>
      )}
    </>
  )
}
