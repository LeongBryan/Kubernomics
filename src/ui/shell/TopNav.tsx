import { useEffect, useRef } from 'react'
import {
  currencyOptions,
  providerOptions,
  regionOptionsByProvider,
  type ProviderOption,
} from '../../catalogs/providers'
import type { CloudProvider } from '../../core/simulator'
import { useScenarioStore } from '../../store/scenarioStore'
import { useUiStore } from '../../store/uiStore'
import { importClusterSnapshot, isClusterSnapshot } from '../../utils/clusterSnapshotImport'
import { exportScenarioYaml, importScenarioYaml } from '../../utils/scenarioYaml'

export function TopNav() {
  const scenarios = useScenarioStore((state) => state.scenarios)
  const activeScenarioId = useScenarioStore((state) => state.activeScenarioId)
  const updateScenario = useScenarioStore((state) => state.updateScenario)
  const changeProvider = useScenarioStore((state) => state.changeProvider)
  const changeRegion = useScenarioStore((state) => state.changeRegion)
  const changeCurrency = useScenarioStore((state) => state.changeCurrency)
  const replaceActiveScenario = useScenarioStore((state) => state.replaceActiveScenario)
  const setCurrency = useUiStore((state) => state.setCurrency)
  const fileInput = useRef<HTMLInputElement>(null)

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) ?? scenarios[0]
  const cloud = activeScenario?.cloud

  useEffect(() => {
    if (cloud?.currency) setCurrency(cloud.currency)
  }, [cloud?.currency, setCurrency])

  function handleExport() {
    if (!activeScenario) return
    const text = exportScenarioYaml(activeScenario)
    const blob = new Blob([text], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeScenario.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.yaml`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const raw = evt.target?.result as string
        const parsed = file.name.endsWith('.json') || raw.trim().startsWith('{') ? JSON.parse(raw) : null
        const scenario = parsed && isClusterSnapshot(parsed) ? importClusterSnapshot(parsed) : importScenarioYaml(raw)
        replaceActiveScenario(scenario)
      } catch (err) {
        alert(`Import failed: ${(err as Error).message}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleProviderChange(provider: CloudProvider) {
    if (!activeScenario || provider === activeScenario.cloud.provider) return
    const ok = window.confirm(
      'Changing cloud provider will reset node pool shape settings because provider SKUs are not directly portable across clouds. Continue?'
    )
    if (!ok) return
    changeProvider(activeScenario.id, provider)
  }

  return (
    <header className="top-nav">
      <div className="brand">Kubernomics</div>
      {activeScenario && (
        <input
          className="scenario-name"
          value={activeScenario.name}
          onChange={(e) => updateScenario(activeScenario.id, { name: e.target.value })}
          aria-label="Scenario name"
        />
      )}
      <div className="nav-actions">
        {cloud && (
          <>
            <label className="nav-select">
              <span>Provider</span>
              <select value={cloud.provider} onChange={(e) => handleProviderChange(e.target.value as ProviderOption['id'])}>
                {providerOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="nav-select">
              <span>Region</span>
              <select value={cloud.region} onChange={(e) => changeRegion(activeScenario.id, e.target.value)}>
                {regionOptionsByProvider[cloud.provider].map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="nav-select">
              <span>Currency</span>
              <select value={cloud.currency} onChange={(e) => changeCurrency(activeScenario.id, e.target.value as typeof cloud.currency)}>
                {currencyOptions.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <div className="segmented">
          <button onClick={() => fileInput.current?.click()}>Import</button>
          <button onClick={handleExport}>Export</button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".yaml,.yml,.json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <span className="badge good">Live</span>
      </div>
    </header>
  )
}
