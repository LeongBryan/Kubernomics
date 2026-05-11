import { create } from 'zustand'
import type { CurrencyCode } from '../utils/currency'

type UiStore = {
  resourceView: 'cpu' | 'memory'
  colorBy: 'team' | 'type'
  segmentMode: 'compact' | 'pods'
  pendingOpen: boolean
  pendingWorkloadId: string | null
  currency: CurrencyCode
  setResourceView: (view: UiStore['resourceView']) => void
  setColorBy: (mode: UiStore['colorBy']) => void
  setSegmentMode: (mode: UiStore['segmentMode']) => void
  openPending: (workloadId?: string | null) => void
  closePending: () => void
  setCurrency: (currency: CurrencyCode) => void
}

export const useUiStore = create<UiStore>((set) => ({
  resourceView: 'cpu',
  colorBy: 'team',
  segmentMode: 'compact',
  pendingOpen: false,
  pendingWorkloadId: null,
  currency: 'USD',
  setResourceView: (resourceView) => set({ resourceView }),
  setColorBy: (colorBy) => set({ colorBy }),
  setSegmentMode: (segmentMode) => set({ segmentMode }),
  openPending: (pendingWorkloadId = null) => set({ pendingOpen: true, pendingWorkloadId }),
  closePending: () => set({ pendingOpen: false, pendingWorkloadId: null }),
  setCurrency: (currency) => set({ currency }),
}))
