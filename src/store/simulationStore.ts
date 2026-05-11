import { create } from 'zustand'
import type { SimulationResult } from '../core/simulator'

type SimulationStore = {
  results: Record<string, SimulationResult>
  lastRunHashes: Record<string, string>
  setResult: (scenarioId: string, result: SimulationResult, hash: string) => void
  clearResults: () => void
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  results: {},
  lastRunHashes: {},
  setResult: (scenarioId, result, hash) =>
    set((state) => ({
      results: { ...state.results, [scenarioId]: result },
      lastRunHashes: { ...state.lastRunHashes, [scenarioId]: hash },
    })),
  clearResults: () => set({ results: {}, lastRunHashes: {} }),
}))
