import type { Scenario, Toleration, Workload, WorkloadClassification, WorkloadHealth } from '../../core/simulator'
import { useScenarioStore } from '../../store/scenarioStore'
import { useUiStore } from '../../store/uiStore'
import { cpu, memory } from '../lib/format'
import { Field, parseArray, parseRecord, SelectField } from './fields'

export function WorkloadCard({
  scenario,
  workload,
  workloadHealth,
}: {
  scenario: Scenario
  workload: Workload
  workloadHealth?: WorkloadHealth
}) {
  const updateWorkload = useScenarioStore((state) => state.updateWorkload)
  const deleteWorkload = useScenarioStore((state) => state.deleteWorkload)
  const openPending = useUiStore((state) => state.openPending)
  const patch = (value: Partial<Workload>) => updateWorkload(scenario.id, workload.id, value)

  const healthClass =
    workloadHealth?.state === 'Healthy' ? 'good' : workloadHealth?.state === 'Degraded' ? 'warn' : 'bad'

  return (
    <details className="config-card">
      <summary>
        <span>
          <strong>
            <i style={{ background: workload.color }} />
            {workload.name}
          </strong>
          <small>
            {workload.kind} · {workload.team} · {cpu(workload.resources.cpuMillis)} / {memory(workload.resources.memoryMiB)}
          </small>
        </span>
        {workloadHealth && (
          <button
            className={`badge ${healthClass}`}
            onClick={(e) => {
              e.preventDefault()
              openPending(workload.id)
            }}
          >
            {workloadHealth.scheduledPods}/{workloadHealth.desiredPods}
          </button>
        )}
      </summary>
      <div className="form-grid">
        <Field label="Name" value={workload.name} onChange={(v) => patch({ name: v })} />
        <SelectField
          label="Kind"
          value={workload.kind}
          options={['DaemonSet', 'Deployment']}
          onChange={(v) => patch({ kind: v })}
        />
        <Field label="Team" value={workload.team} onChange={(v) => patch({ team: v })} />
        <Field label="Color" type="color" value={workload.color} onChange={(v) => patch({ color: v })} />
        <SelectField
          label="Classification"
          value={workload.classification}
          options={['platform', 'system', 'application'] as WorkloadClassification[]}
          onChange={(v) => patch({ classification: v })}
        />
        <Field
          label="Replicas"
          type="number"
          value={workload.replicas ?? 0}
          onChange={(v) => patch({ replicas: Number(v) })}
        />
        <Field
          label="CPU m"
          type="number"
          value={workload.resources.cpuMillis}
          onChange={(v) => patch({ resources: { ...workload.resources, cpuMillis: Number(v) } })}
        />
        <Field
          label="Memory MiB"
          type="number"
          value={workload.resources.memoryMiB}
          onChange={(v) => patch({ resources: { ...workload.resources, memoryMiB: Number(v) } })}
        />
      </div>
      <label className="field wide">
        <span>Node selector JSON</span>
        <textarea
          value={JSON.stringify(workload.nodeSelector, null, 2)}
          onChange={(e) => {
            const nodeSelector = parseRecord(e.target.value)
            if (nodeSelector) patch({ nodeSelector })
          }}
          spellCheck={false}
        />
      </label>
      <label className="field wide">
        <span>Tolerations JSON</span>
        <textarea
          value={JSON.stringify(workload.tolerations, null, 2)}
          onChange={(e) => {
            const tolerations = parseArray<Toleration>(e.target.value)
            if (tolerations) patch({ tolerations })
          }}
          spellCheck={false}
        />
      </label>
      <button className="danger" onClick={() => deleteWorkload(scenario.id, workload.id)}>
        Delete workload
      </button>
    </details>
  )
}
