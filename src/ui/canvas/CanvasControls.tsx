import { useUiStore } from '../../store/uiStore'

export function CanvasControls() {
  const resourceView = useUiStore((state) => state.resourceView)
  const colorBy = useUiStore((state) => state.colorBy)
  const segmentMode = useUiStore((state) => state.segmentMode)
  const setResourceView = useUiStore((state) => state.setResourceView)
  const setColorBy = useUiStore((state) => state.setColorBy)
  const setSegmentMode = useUiStore((state) => state.setSegmentMode)

  return (
    <div className="canvas-controls">
      <div className="segmented">
        <button className={resourceView === 'cpu' ? 'active' : ''} onClick={() => setResourceView('cpu')}>CPU</button>
        <button className={resourceView === 'memory' ? 'active' : ''} onClick={() => setResourceView('memory')}>Memory</button>
      </div>
      <div className="segmented">
        <button className={colorBy === 'team' ? 'active' : ''} onClick={() => setColorBy('team')}>Team</button>
        <button className={colorBy === 'type' ? 'active' : ''} onClick={() => setColorBy('type')}>Type</button>
      </div>
      <div className="segmented">
        <button className={segmentMode === 'compact' ? 'active' : ''} onClick={() => setSegmentMode('compact')}>Compact</button>
        <button className={segmentMode === 'pods' ? 'active' : ''} onClick={() => setSegmentMode('pods')}>Pods</button>
      </div>
    </div>
  )
}
