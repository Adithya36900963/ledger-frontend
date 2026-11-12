import { memo, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { AuthUser, Account, AuditEvent, LedgerEntry, TransactionResult, TransactionType } from '../../types/ledger'
import { formatMoney } from '../../types/ledger'
import { Sidebar } from '../common/Sidebar'
import { StatCard } from '../common/StatCard'
import { BalanceCard } from './BalanceCard'
import { TransactionFormCard } from './TransactionFormCard'
import { ActivityCard } from './ActivityCard'
import { DemoBadge } from '../common/DemoBadge'
import { AuditEventsCard } from '../common/AuditEventsCard'
import { demoAdminUsers } from '../../mocks/demoData'
import './Contacts.css'

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

export const AccountDashboard = memo(function AccountDashboard(props: AccountDashboardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { accountId: contactRouteId } = useParams()
  const isContactsPage = location.pathname === '/account/contacts'
  const contacts = useMemo(() => {
    const transfers = props.transactions.filter((item) => item.type === 'TRANSFER')
    const ids = new Set<number>()
    transfers.forEach((item) => {
      if (item.fromAccountId && item.fromAccountId !== props.account?.accountId) ids.add(item.fromAccountId)
      if (item.toAccountId && item.toAccountId !== props.account?.accountId) ids.add(item.toAccountId)
    })
    return [...ids].map((id) => {
      const demoContact = demoAdminUsers.find((person) => person.accountId === id)
      return { id, name: demoContact?.name ?? `Account ${String(id).padStart(8, '0')}` }
    })
  }, [props.transactions, props.account?.accountId])
  const selectedContact = contacts.find((contact) => String(contact.id) === contactRouteId)
  const contactTransactions = props.transactions.filter((item) => item.type === 'TRANSFER' &&
    (item.fromAccountId === selectedContact?.id || item.toAccountId === selectedContact?.id))

  return <div className="app-shell">
    <Sidebar section="PERSONAL BANKING" user={props.user} onSignOut={props.logout} navLabel="Overview" navIcon="▦" navTo="/account" />
    <main className="main-content" id="dashboard">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Overview</b></div><div className="topbar-right">{props.demo ? <DemoBadge /> : <><span className="live-dot" /> Secure account access</>}</div></header>
      <div className="content-wrap">
        {isContactsPage ? <section className="contact-page">
          <button className="contact-back" onClick={() => navigate('/account')}>← Back to overview</button>
          <div className="contact-history-heading"><div><div className="eyebrow">YOUR TRANSFER CONTACTS</div><h1>Choose a contact</h1><p className="contacts-description">Open a contact to see every transfer in your transaction chat.</p></div><span>{contacts.length} contacts</span></div>
          {contacts.length ? <div className="contact-list contact-directory">{contacts.map((contact) => <button className="contact-row" key={contact.id} onClick={() => navigate(`/account/contacts/${contact.id}`)}><span className="contact-avatar">{contact.name.slice(0, 1).toUpperCase()}</span><span className="contact-label"><b>{contact.name}</b><small>LL-{String(contact.id).padStart(8, '0')}</small></span><span className="contact-open-hint">View transaction chat</span><span className="contact-arrow">›</span></button>)}</div> : <div className="contact-empty">Your transfer contacts will appear here after your first transfer.</div>}
        </section> : contactRouteId ? <section className="contact-page">
          <button className="contact-back" onClick={() => navigate('/account')}>← Back to overview</button>
          {selectedContact ? <>
            <header className="contact-profile"><span className="contact-avatar">{selectedContact.name.slice(0, 1).toUpperCase()}</span><div><div className="eyebrow">TRANSFER CONTACT</div><h1>{selectedContact.name}</h1><p>LL-{String(selectedContact.id).padStart(8, '0')}</p></div></header>
            <section className="contact-history"><div className="contact-history-heading"><div><div className="eyebrow">ACCOUNT HISTORY</div><h2>Transactions with {selectedContact.name}</h2></div><span>{contactTransactions.length} transfers</span></div>
              {contactTransactions.length ? <div className="contact-messages">{contactTransactions.map((transaction) => {
                const received = transaction.toAccountId === props.account?.accountId
                return <article className={`contact-message ${received ? 'received' : 'sent'}`} key={transaction.transactionId}>
                  <b>{received ? '+' : '−'}{formatMoney(transaction.amount)}</b><span>{received ? 'Received' : 'Sent'} · Posted</span><small>{new Date(transaction.createdAt).toLocaleString()}</small><code>{transaction.transactionId}</code>
                </article>
              })}</div> : <div className="contact-empty">No transfers with this contact yet.</div>}
            </section>
          </> : <div className="contact-empty">This contact is not in your recent transfers.</div>}
        </section> : <>
        <section className="welcome-row"><div><div className="eyebrow">PERSONAL BANKING</div><h1>Good to see you{props.account?.holderName ? `, ${props.account.holderName}` : ''}.</h1><p>Here’s what’s happening with your money today.</p></div><button className="refresh-button" onClick={props.refresh} disabled={props.loading}><span className={props.loading ? 'refresh-spin' : ''}>⟳</span> Refresh</button></section>
        {props.loading && <div className="loading-line"><span className="loader" /> Loading your account…</div>}
        {props.loadError && !props.loading && <section className="load-error" role="alert"><div className="error-symbol">!</div><div><b>We couldn’t load your account</b><p>{props.loadError}</p><button className="text-button" onClick={props.refresh}>Try again</button></div></section>}
        {props.account && <>
          <section className="summary-grid" aria-label="Account summary"><BalanceCard account={props.account} /><StatCard label="Account status" value="Active" detail="Your account is ready to use" icon="↗" /><StatCard label="Account number" value={`LL-${String(props.account.accountId).padStart(8, '0')}`} detail="Use this number to receive money" icon="⌁" tone="purple" /></section>
          <section className="contact-section"><button className="contact-section-heading contact-heading-button" onClick={() => navigate('/account/contacts')}><div><div className="eyebrow">YOUR TRANSFER CONTACTS</div><h2>People you’ve sent money to</h2></div><span className="contact-see-all">See contacts <b>›</b></span></button>
            <button className="contact-preview" onClick={() => navigate('/account/contacts')}>Browse your transfer contacts and open a person’s transaction chat <span>→</span></button>
          </section>
          <section className="content-grid">
            <TransactionFormCard busy={props.busy} error={props.error} notice={props.notice} onSubmit={props.submit} />
            <ActivityCard transactions={props.transactions} entries={props.ledgerEntries} demo={props.demo} loading={props.historyLoading} />
          </section>
          {props.historyError && <div className="inline-error history-error" role="alert">Account history could not be loaded: {props.historyError}</div>}
          <AuditEventsCard events={props.auditEvents} title="Your audit activity" loading={props.historyLoading} />
          <footer className="page-footer"><span>© 2026 LedgerLine Financial</span><span><span className="footer-lock">◈</span> Current balance {formatMoney(props.account.balance)}</span></footer>
        </>}
        </>}
      </div>
    </main>
  </div>
})
