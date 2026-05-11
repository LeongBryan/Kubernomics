import { nodeShapeCatalog, nodeShapePatch, shapeOptionLabel } from '../../catalogs/providers'
import type { CurrencyCode, NodePool, Scenario, Taint } from '../../core/simulator'
import { useScenarioStore } from '../../store/scenarioStore'
import { useUiStore } from '../../store/uiStore'
import { money } from '../lib/format'
import { Field, parseArray, parseRecord, ReadonlyField, SelectField } from './fields'

export function NodePoolCard({ scenario, pool }: { scenario: Scenario; pool: NodePool }) {
  const updateNodePool = useScenarioStore((state) => state.updateNodePool)
  const deleteNodePool = useScenarioStore((state) => state.deleteNodePool)
  const currency = useUiStore((state) => state.currency)
  const isCustom = scenario.cloud.provider === 'custom'
  const shapes = nodeShapeCatalog(scenario.cloud.provider, scenario.cloud.region)
  const selectedSku = pool.shape.providerSku ?? pool.shape.sku ?? pool.shape.name

  const patch = (value: Partial<NodePool>) => updateNodePool(scenario.id, pool.id, value)
  const patchShape = (shape: Partial<NodePool['shape']>) => patch({ shape: { ...pool.shape, ...shape } })
  const totalReserved = pool.systemReserved.cpuMillis + pool.kubeReserved.cpuMillis
  const totalReservedMem = pool.systemReserved.memoryMiB + pool.kubeReserved.memoryMiB
  const observedDailyCost = pool.metadata?.observedDailyCost ? Number(pool.metadata.observedDailyCost) : undefined

  return (
    <details className="config-card">
      <summary>
        <span>
          <strong>{pool.name}</strong>
          <small>
            {pool.shape.name} - {money(pool.hourlyCost ?? pool.shape.hourlyCost ?? 0, currency)}/VM/hr
          </small>
        </span>
        <span className="badge neutral">
          {pool.mode === 'manual' ? `${pool.nodeCount ?? 0} nodes` : `${pool.minNodes ?? 0}-${pool.maxNodes ?? 0}`}
        </span>
      </summary>
      <div className="form-grid">
        <Field label="Name" value={pool.name} onChange={(v) => patch({ name: v })} />
        {isCustom ? (
          <Field label="Node shape" value={pool.shape.name} onChange={(v) => patchShape({ name: v, providerSku: v })} />
        ) : (
          <label className="field">
            <span>Node shape</span>
            <select
              value={selectedSku}
              onChange={(e) => {
                const entry = shapes.find((shape) => shape.sku === e.target.value)
                if (entry) patch(nodeShapePatch(entry, scenario.cloud.region))
              }}
            >
              {shapes.map((shape) => (
                <option key={shape.sku} value={shape.sku}>
                  {shapeOptionLabel(shape, currency)}
                </option>
              ))}
            </select>
          </label>
        )}
        {isCustom ? (
          <Field
            label="vCPU"
            type="number"
            value={pool.shape.vcpu ?? pool.shape.vCpu ?? 0}
            onChange={(v) => patchShape({ vcpu: Number(v) })}
          />
        ) : (
          <ReadonlyField label="vCPU" value={pool.shape.vcpu ?? pool.shape.vCpu ?? 0} />
        )}
        {isCustom ? (
          <Field
            label="Memory GiB"
            type="number"
            value={pool.shape.memoryMiB / 1024}
            onChange={(v) => patchShape({ memoryMiB: Number(v) * 1024 })}
          />
        ) : (
          <ReadonlyField label="Memory GiB" value={pool.shape.memoryMiB / 1024} />
        )}
        <Field
          label="VM compute/hr"
          type="number"
          value={pool.hourlyCost ?? pool.shape.hourlyCost ?? 0}
          onChange={(v) => {
            const hourlyCost = Number(v)
            patch({ hourlyCost, shape: { ...pool.shape, hourlyCost } })
          }}
        />
        {isCustom && (
          <SelectField
            label="Shape currency"
            value={(pool.shape.currency ?? scenario.cloud.currency) as CurrencyCode}
            options={['USD', 'EUR', 'SGD']}
            onChange={(v) => patchShape({ currency: v })}
          />
        )}
        <ReadonlyField
          label="Observed pool/day"
          value={observedDailyCost === undefined ? '-' : money(observedDailyCost, currency)}
        />
        <Field
          label="Max pods"
          type="number"
          value={pool.maxPods}
          onChange={(v) => patch({ maxPods: Number(v) })}
        />
        {isCustom ? (
          <Field
            label="Reserved CPU m"
            type="number"
            value={totalReserved}
            onChange={(v) =>
              patch({
                systemReserved: { ...pool.systemReserved, cpuMillis: Number(v) },
                kubeReserved: { ...pool.kubeReserved, cpuMillis: 0 },
              })
            }
          />
        ) : (
          <ReadonlyField label="Reserved CPU m" value={totalReserved} />
        )}
        {isCustom ? (
          <Field
            label="Reserved mem MiB"
            type="number"
            value={totalReservedMem}
            onChange={(v) =>
              patch({
                systemReserved: { ...pool.systemReserved, memoryMiB: Number(v) },
                kubeReserved: { ...pool.kubeReserved, memoryMiB: 0 },
              })
            }
          />
        ) : (
          <ReadonlyField label="Reserved mem MiB" value={totalReservedMem} />
        )}
        <SelectField
          label="Mode"
          value={pool.mode}
          options={['manual', 'autoscale-to-fit']}
          onChange={(v) => patch({ mode: v })}
        />
        {pool.mode === 'manual' ? (
          <Field
            label="Node count"
            type="number"
            value={pool.nodeCount ?? 0}
            onChange={(v) => patch({ nodeCount: Number(v) })}
          />
        ) : (
          <>
            <Field
              label="Min nodes"
              type="number"
              value={pool.minNodes ?? 0}
              onChange={(v) => patch({ minNodes: Number(v) })}
            />
            <Field
              label="Max nodes"
              type="number"
              value={pool.maxNodes ?? 0}
              onChange={(v) => patch({ maxNodes: Number(v) })}
            />
          </>
        )}
      </div>
      <label className="field wide">
        <span>Labels JSON</span>
        <textarea
          value={JSON.stringify(pool.labels, null, 2)}
          onChange={(e) => {
            const labels = parseRecord(e.target.value)
            if (labels) patch({ labels })
          }}
          spellCheck={false}
        />
      </label>
      <label className="field wide">
        <span>Taints JSON</span>
        <textarea
          value={JSON.stringify(pool.taints, null, 2)}
          onChange={(e) => {
            const taints = parseArray<Taint>(e.target.value)
            if (taints) patch({ taints })
          }}
          spellCheck={false}
        />
      </label>
      <button className="danger" onClick={() => deleteNodePool(scenario.id, pool.id)}>
        Delete pool
      </button>
    </details>
  )
}
