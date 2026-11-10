import type { AuditEvent } from '../../types/ledger'
import { Panel } from './Panel'

export function AuditEventsCard({ events, title = 'Audit trail', loading = false }: { events: AuditEvent[]; title?: string; loading?: boolean }) {
  return <Panel className="data-table-card">
    <div className="activity-heading"><div><div className="eyebrow">ACCOUNTABILITY</div><h2>{title}</h2></div><span className="created-count">{loading ? 'Loading…' : `${events.length} events`}</span></div>
    <div className="audit-table-wrap"><table className="audit-table"><thead><tr><th>Actor</th><th>Action</th><th>Outcome</th><th>Details</th><th>Time</th></tr></thead><tbody>
      {events.map((event) => <tr key={event.id}><td>{event.actorName}<small>{event.actorRole}</small></td><td>{event.action}</td><td><span className={`audit-result ${event.outcome === 'SUCCESS' || event.outcome === 'POSTED' ? 'success' : 'declined'}`}>{event.outcome}</span></td><td>{event.details}</td><td>{new Date(event.createdAt).toLocaleString()}</td></tr>)}
      {!events.length && <tr><td colSpan={5}>{loading ? 'Loading audit events…' : 'No audit events found.'}</td></tr>}
    </tbody></table></div>
  </Panel>
}
