import { memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { AuthUser } from '../../types/ledger'
import { Sidebar } from '../common/Sidebar'
import { DemoBadge } from '../common/DemoBadge'
import { useAuditOverview } from '../../hooks/useAuditOverview'
import { StatCard } from '../common/StatCard'
import { AuditEventsCard } from '../common/AuditEventsCard'
import { LedgerEntriesCard } from '../common/LedgerEntriesCard'
import { LedgerIntegrityCard } from '../common/LedgerIntegrityCard'

type View = 'home' | 'ledger' | 'audit'

const auditorNav = [
  { label: 'Ledger entries', icon: '↕', to: '/auditor/ledger' },
  { label: 'Audit trail', icon: '◈', to: '/auditor/audit' },
]

export const AuditorDashboard = memo(function AuditorDashboard({ user, onSignOut }: { user: AuthUser; onSignOut: () => void }) {
  const audit = useAuditOverview(Boolean(user.demo))
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const view: View = pathname.startsWith('/auditor/ledger') ? 'ledger' : pathname.startsWith('/auditor/audit') ? 'audit' : 'home'
  const crumb = view === 'ledger' ? 'Ledger entries' : view === 'audit' ? 'Audit trail' : 'Audit overview'
  const open = (to: string) => { navigate(to); window.scrollTo({ top: 0 }) }

  return <div className="admin-shell">
    <Sidebar section="AUDIT WORKSPACE" user={user} onSignOut={onSignOut} navLabel="Audit overview" navIcon="◷" navTo="/auditor" extraNav={auditorNav} />
    <main className="main-content admin-main" id="workspace">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{crumb}</b></div><div className="topbar-right">{user.demo && <DemoBadge />}<span className="readonly-badge">◉ Read only</span></div></header>
      <div className="content-wrap">
        {view === 'home' && <>
          <div className="welcome-row"><div><div className="eyebrow">READ-ONLY WORKSPACE</div><h1>Audit overview</h1><p>You are signed in with auditor access.</p></div></div>
          <section className="summary-grid audit-summary"><StatCard label="Ledger entries" value={String(audit.entries.length)} detail="Recent posted entries" icon="↕" /><StatCard label="Audit events" value={String(audit.events.length)} detail="Successes and failed attempts" icon="◷" tone="purple" /></section>
          {audit.error && <div className="inline-error history-error" role="alert">Audit data could not be loaded: {audit.error}</div>}
          <LedgerIntegrityCard integrity={audit.integrity} />
          <div className="tile-grid" style={{ marginTop: 15 }}>
            <button type="button" className="tile" onClick={() => open('/auditor/ledger')}>
              <span className="tile-icon">↕</span><b>Ledger entries · read only</b><span className="tile-text">Append-only money record of every posted entry.</span><span className="tile-stat">{audit.loading ? 'Loading…' : `${audit.entries.length} entries`} <i>→</i></span>
            </button>
            <button type="button" className="tile" onClick={() => open('/auditor/audit')}>
              <span className="tile-icon">◈</span><b>Audit trail · read only</b><span className="tile-text">Accountability log of successes and failed attempts.</span><span className="tile-stat">{audit.loading ? 'Loading…' : `${audit.events.length} events`} <i>→</i></span>
            </button>
          </div>
        </>}
        {view !== 'home' && <div className="flow-page">
          <div className="flow-bar"><button type="button" className="ghost-button" onClick={() => open('/auditor')}>← Back to audit overview</button></div>
          {audit.error && <div className="inline-error history-error" role="alert">Audit data could not be loaded: {audit.error}</div>}
          {view === 'ledger' && <LedgerEntriesCard entries={audit.entries} title="Ledger entries · read only" loading={audit.loading} />}
          {view === 'audit' && <AuditEventsCard events={audit.events} title="Audit trail · read only" loading={audit.loading} />}
        </div>}
      </div>
    </main>
  </div>
})
