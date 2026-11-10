import type { AuthUser } from '../../types/ledger'
import { Sidebar } from '../common/Sidebar'
import { DemoBadge } from '../common/DemoBadge'
import { useAuditOverview } from '../../hooks/useAuditOverview'
import { StatCard } from '../common/StatCard'
import { AuditEventsCard } from '../common/AuditEventsCard'
import { LedgerEntriesCard } from '../common/LedgerEntriesCard'
import { LedgerIntegrityCard } from '../common/LedgerIntegrityCard'

export function AuditorDashboard({ user, onSignOut }: { user: AuthUser; onSignOut: () => void }) {
  const audit = useAuditOverview(Boolean(user.demo))
  return <div className="admin-shell">
    <Sidebar section="AUDIT WORKSPACE" user={user} onSignOut={onSignOut} navLabel="Audit overview" navIcon="◷" />
    <main className="main-content admin-main" id="workspace">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Audit overview</b></div><div className="topbar-right">{user.demo && <DemoBadge />}<span className="readonly-badge">◉ Read only</span></div></header>
      <div className="content-wrap"><div className="welcome-row"><div><div className="eyebrow">READ-ONLY WORKSPACE</div><h1>Audit overview</h1><p>You are signed in with auditor access.</p></div></div>
        <section className="summary-grid audit-summary"><StatCard label="Ledger entries" value={String(audit.entries.length)} detail="Recent posted entries" icon="↕" /><StatCard label="Audit events" value={String(audit.events.length)} detail="Successes and failed attempts" icon="◷" tone="purple" /></section>
        {audit.error && <div className="inline-error history-error" role="alert">Audit data could not be loaded: {audit.error}</div>}
        <LedgerIntegrityCard integrity={audit.integrity} />
        <LedgerEntriesCard entries={audit.entries} title="Ledger entries · read only" loading={audit.loading} />
        <AuditEventsCard events={audit.events} title="Audit trail · read only" loading={audit.loading} />
      </div>
    </main>
  </div>
}
