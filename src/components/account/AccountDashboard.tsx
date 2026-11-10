import type { AuthUser, Account, AuditEvent, LedgerEntry, TransactionResult, TransactionType } from '../../types/ledger'
import { formatMoney } from '../../types/ledger'
import { Sidebar } from '../common/Sidebar'
import { StatCard } from '../common/StatCard'
import { BalanceCard } from './BalanceCard'
import { TransactionFormCard } from './TransactionFormCard'
import { ActivityCard } from './ActivityCard'
import { DemoBadge } from '../common/DemoBadge'
import { AuditEventsCard } from '../common/AuditEventsCard'

type AccountDashboardProps = {
  user: AuthUser
  account: Account | null
  loading: boolean
  loadError: string
  refresh: () => void
  logout: () => void
  transactions: TransactionResult[]
  busy: boolean
  error: string
  notice: string
  submit: (type: TransactionType, amount: number, recipient?: number) => Promise<unknown>
  demo: boolean
  ledgerEntries: LedgerEntry[]
  auditEvents: AuditEvent[]
  historyLoading: boolean
  historyError: string
}

export function AccountDashboard(props: AccountDashboardProps) {
  return <div className="app-shell">
    <Sidebar section="PERSONAL BANKING" user={props.user} onSignOut={props.logout} navLabel="Overview" navIcon="▦" />
    <main className="main-content" id="dashboard">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Overview</b></div><div className="topbar-right">{props.demo ? <DemoBadge /> : <><span className="live-dot" /> Secure account access</>}</div></header>
      <div className="content-wrap">
        <section className="welcome-row"><div><div className="eyebrow">PERSONAL BANKING</div><h1>Good to see you{props.account?.holderName ? `, ${props.account.holderName}` : ''}.</h1><p>Here’s what’s happening with your money today.</p></div><button className="refresh-button" onClick={props.refresh} disabled={props.loading}><span className={props.loading ? 'refresh-spin' : ''}>⟳</span> Refresh</button></section>
        {props.loading && <div className="loading-line"><span className="loader" /> Loading your account…</div>}
        {props.loadError && !props.loading && <section className="load-error" role="alert"><div className="error-symbol">!</div><div><b>We couldn’t load your account</b><p>{props.loadError}</p><button className="text-button" onClick={props.refresh}>Try again</button></div></section>}
        {props.account && <>
          <section className="summary-grid" aria-label="Account summary"><BalanceCard account={props.account} /><StatCard label="Account status" value="Active" detail="Your account is ready to use" icon="↗" /><StatCard label="Account number" value={`LL-${String(props.account.accountId).padStart(8, '0')}`} detail="Use this number to receive money" icon="⌁" tone="purple" /></section>
          <section className="content-grid">
            <TransactionFormCard busy={props.busy} error={props.error} notice={props.notice} onSubmit={props.submit} />
            <ActivityCard transactions={props.transactions} entries={props.ledgerEntries} demo={props.demo} loading={props.historyLoading} />
          </section>
          {props.historyError && <div className="inline-error history-error" role="alert">Account history could not be loaded: {props.historyError}</div>}
          <AuditEventsCard events={props.auditEvents} title="Your audit activity" loading={props.historyLoading} />
          <footer className="page-footer"><span>© 2026 LedgerLine Financial</span><span><span className="footer-lock">◈</span> Current balance {formatMoney(props.account.balance)}</span></footer>
        </>}
      </div>
    </main>
  </div>
}
