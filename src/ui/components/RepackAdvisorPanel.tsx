import type { NodePoolRecommendation, RepackAdvisorResult } from '../../core/advisor'
import { useUiStore } from '../../store/uiStore'
import { money } from '../lib/format'

function severityClass(severity: string): string {
  if (severity === 'critical') return 'badge bad'
  if (severity === 'warning') return 'badge warn'
  return 'badge neutral'
}

function safetyClass(status: NodePoolRecommendation['safetyStatus']): string {
  if (status === 'safe') return 'badge good'
  if (status === 'blocked') return 'badge bad'
  return 'badge warn'
}

function safetyLabel(status: NodePoolRecommendation['safetyStatus']): string {
  if (status === 'safe') return 'safe to reclaim'
  if (status === 'blocked') return 'blocked'
  return 'investigate first'
}

function categoryLabel(category: string): string {
  if (category === 'unsupported-constraint') return 'unsupported'
  if (category === 'not-analyzed') return 'not analyzed'
  return category.replace(/-/g, ' ')
}

export function RepackAdvisorPanel({ advisor }: { advisor: RepackAdvisorResult }) {
  const currency = useUiStore((state) => state.currency)
  const visibleRecommendations = advisor.recommendations.filter(
    (recommendation) => recommendation.reclaimableNodes > 0 || recommendation.blockers.length > 0
  )

  return (
    <details className="advisor-panel" open>
      <summary className="advisor-heading">
        <div>
          <h2>Repack Advisor</h2>
          <p>
            {advisor.totalReclaimableNodes} reclaimable nodes · {money(advisor.estimatedMonthlySavings, currency)}/mo potential savings
          </p>
        </div>
      </summary>

      <div className="advisor-grid">
        {visibleRecommendations.length === 0 ? (
          <div className="advisor-card">
            <h3>No reclaimable nodes found</h3>
            <p>Bin-pack simulation did not produce empty nodes in any pool.</p>
          </div>
        ) : (
          visibleRecommendations.map((recommendation) => (
            <article key={recommendation.nodePoolId} className="advisor-card">
              <div className="advisor-card-heading">
                <h3>{recommendation.nodePoolName}</h3>
                <strong>{money(recommendation.estimatedMonthlySavings, currency)}/mo</strong>
              </div>

              <div className="advisor-safety">
                <span className={safetyClass(recommendation.safetyStatus)}>{safetyLabel(recommendation.safetyStatus)}</span>
                <span className="advisor-safety-text">{recommendation.safetyExplanation}</span>
              </div>

              {recommendation.disruptionPreview.length > 0 && (
                <details className="advisor-disruption">
                  <summary>
                    {recommendation.disruptionPreview.length} workload{recommendation.disruptionPreview.length === 1 ? '' : 's'} in this pool
                    {recommendation.affectedNamespaces.length > 0 &&
                      ` · ${recommendation.affectedNamespaces.length} namespace${recommendation.affectedNamespaces.length === 1 ? '' : 's'}`}
                  </summary>
                  <ul>
                    {recommendation.disruptionPreview.map((entry) => (
                      <li key={entry.workloadId}>
                        <span className="disruption-name">{entry.workloadName}</span>
                        <span className="disruption-meta">
                          {entry.namespace !== 'unknown' ? entry.namespace : ''}
                          {entry.namespace !== 'unknown' ? ' · ' : ''}
                          {entry.podCount} pod{entry.podCount === 1 ? '' : 's'}
                        </span>
                        {entry.hasCriticalBlocker && <span className="badge bad">blocked</span>}
                      </li>
                    ))}
                  </ul>
                  {recommendation.affectedNamespaces.length > 0 && (
                    <p className="advisor-namespaces">
                      Namespaces: {recommendation.affectedNamespaces.join(', ')}
                    </p>
                  )}
                </details>
              )}

              {recommendation.blockers.length > 0 && (
                <ul className="advisor-blockers">
                  {recommendation.blockers.map((blocker) => (
                    <li key={blocker.id}>
                      <span className={severityClass(blocker.severity)}>{blocker.severity}</span>
                      <span>{blocker.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))
        )}
      </div>

      {advisor.findings.length > 0 && (
        <div className="advisor-findings">
          {advisor.findings.map((finding) => (
            <div key={finding.id} className="advisor-finding">
              <span className={finding.category === 'unsupported-constraint' ? 'badge warn' : severityClass(finding.severity)}>
                {categoryLabel(finding.category) === finding.severity ? finding.severity : categoryLabel(finding.category)}
              </span>
              <div>
                <strong>{finding.title}</strong>
                <p>{finding.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <details className="advisor-coverage">
        <summary>Analysis coverage</summary>
        <div className="advisor-coverage-body">
          <div className="coverage-col">
            <strong>Checked</strong>
            <ul>
              {advisor.coverage.checked.map((item) => (
                <li key={item}>
                  <span className="coverage-check">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="coverage-col">
            <strong>Not checked</strong>
            <ul>
              {advisor.coverage.notChecked.map((item) => (
                <li key={item}>
                  <span className="coverage-dash">–</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {advisor.coverage.unsupportedConstraintWorkloads.length > 0 && (
          <div className="coverage-unsupported">
            <strong>
              Workloads with constraints the analyzer cannot inspect (
              {advisor.coverage.unsupportedConstraintWorkloads.length})
            </strong>
            <ul>
              {advisor.coverage.unsupportedConstraintWorkloads.map((w) => (
                <li key={w.workloadId}>
                  <span className="disruption-name">{w.workloadName}</span>
                  {w.namespace !== 'unknown' && <span className="disruption-meta">{w.namespace}</span>}
                  <span className="disruption-meta">— {w.unsupportedConstraints.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {advisor.notAnalyzed.map((finding) => (
          <div key={finding.id} className="advisor-finding muted" style={{ marginTop: '0.65rem' }}>
            <span className="badge neutral">not analyzed</span>
            <div>
              <strong>{finding.title}</strong>
              <p>{finding.detail}</p>
            </div>
          </div>
        ))}
      </details>
    </details>
  )
}
