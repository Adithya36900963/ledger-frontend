import { memo, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { AuthUser, Account, AuditEvent, LedgerEntry, TransferHistory, TransactionResult, TransactionType } from '../../types/ledger'
import { formatMoney } from '../../types/ledger'
import { Sidebar } from '../common/Sidebar'
import { StatCard } from '../common/StatCard'
import { BalanceCard } from './BalanceCard'
import { TransactionFormCard } from './TransactionFormCard'
import { ActivityCard } from './ActivityCard'
import { DemoBadge } from '../common/DemoBadge'
import { AuditEventsCard } from '../common/AuditEventsCard'
import { demoAdminUsers } from '../../mocks/demoData'
import { accountService } from '../../services/accountService'
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
  submit: (type: TransactionType, amount: number, recipient?: number, mpin?: string, idempotencyKey?: string) => Promise<unknown>
  demo: boolean
  ledgerEntries: LedgerEntry[]
  transfers: TransferHistory[]
  auditEvents: AuditEvent[]
  historyLoading: boolean
  historyError: string
  mpinConfigured: boolean
  mpinLoading: boolean
  mpinError: string
  setupMpin: (mpin: string) => Promise<boolean>
}

export const AccountDashboard = memo(function AccountDashboard(props: AccountDashboardProps) {
  const [transferAmount, setTransferAmount] = useState('')
  const [transferPin, setTransferPin] = useState('')
  const [newMpin, setNewMpin] = useState('')
  const [confirmMpin, setConfirmMpin] = useState('')
  const [mpinMessage, setMpinMessage] = useState('')
  const [securePayOpen, setSecurePayOpen] = useState(false)
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [resolvedContact, setResolvedContact] = useState<{ id: number; name: string } | null>(null)
  const [contactLookupError, setContactLookupError] = useState<{ id: number; message: string } | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { accountId: contactRouteId } = useParams()
  const isContactsPage = location.pathname === '/account/contacts'
  const contacts = useMemo(() => {
    const transfers = props.transactions.filter((item) => item.type === 'TRANSFER')
    const ids = new Set<number>()
    props.transfers.forEach((item) => ids.add(item.counterpartyAccountId))
    transfers.forEach((item) => {
      if (item.fromAccountId && item.fromAccountId !== props.account?.accountId) ids.add(item.fromAccountId)
      if (item.toAccountId && item.toAccountId !== props.account?.accountId) ids.add(item.toAccountId)
    })
    return [...ids].map((id) => {
      const demoContact = demoAdminUsers.find((person) => person.accountId === id)
      const historyContact = props.transfers.find((item) => item.counterpartyAccountId === id)
      return { id, name: historyContact?.counterpartyName ?? demoContact?.name ?? `Account ${String(id).padStart(8, '0')}` }
    })
  }, [props.transactions, props.transfers, props.account?.accountId])
  const requestedAccountId = Number(contactRouteId)
  const knownDemoRecipient = props.demo ? demoAdminUsers.find((item) => item.accountId === requestedAccountId) : undefined
  const selectedContact = contacts.find((contact) => String(contact.id) === contactRouteId)
    ?? (resolvedContact?.id === requestedAccountId ? resolvedContact : null)
    ?? (knownDemoRecipient ? { id: requestedAccountId, name: knownDemoRecipient.name } : null)
    ?? (Number.isSafeInteger(requestedAccountId) && requestedAccountId > 0
      ? { id: requestedAccountId, name: `Account ${String(requestedAccountId).padStart(8, '0')}` }
      : undefined)
  const recipientResolved = contacts.some((contact) => contact.id === requestedAccountId)
    || resolvedContact?.id === requestedAccountId || Boolean(knownDemoRecipient)
  useEffect(() => {
    if (!contactRouteId || !Number.isSafeInteger(requestedAccountId) || requestedAccountId <= 0
        || contacts.some((contact) => contact.id === requestedAccountId)) return
    if (props.demo) return
    let active = true
    accountService.recipient(requestedAccountId)
      .then((recipient) => { if (active) setResolvedContact({ id: recipient.accountId, name: recipient.holderName }) })
      .catch((error: unknown) => { if (active) setContactLookupError({ id: requestedAccountId, message: error instanceof Error ? error.message : 'Could not find that recipient account.' }) })
    return () => { active = false }
  }, [contactRouteId, requestedAccountId, contacts, props.demo])
  const contactTransactions = useMemo(() => {
    const history = props.transfers.filter((item) => item.counterpartyAccountId === selectedContact?.id)
    const combined = new Map<string, Pick<TransactionResult, 'transactionId' | 'fromAccountId' | 'toAccountId' | 'amount' | 'createdAt'>>()
    history.forEach((item) => combined.set(item.transactionId, item))
    props.transactions.filter((item) => item.type === 'TRANSFER' &&
      (item.fromAccountId === selectedContact?.id || item.toAccountId === selectedContact?.id))
      .forEach((item) => combined.set(item.transactionId, item))
    return [...combined.values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
  }, [props.transfers, props.transactions, selectedContact?.id])

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
              {!recipientResolved && !contactLookupError && <p className="recipient-resolving">Looking up recipient account…</p>}
              {contactLookupError?.id === requestedAccountId && <div className="contact-transfer-message error" role="alert">{contactLookupError.message}</div>}
              {contactTransactions.length ? <div className="contact-messages">{contactTransactions.map((transaction) => {
                const received = transaction.toAccountId === props.account?.accountId
                return <article className={`contact-message ${received ? 'received' : 'sent'}`} key={transaction.transactionId}>
                  <b>{received ? '+' : '−'}{formatMoney(transaction.amount)}</b><span>{received ? 'Received' : 'Sent'} · Posted</span><small>{new Date(transaction.createdAt).toLocaleString()}</small><code>{transaction.transactionId}</code>
                </article>
              })}</div> : <div className="contact-empty">No transfers with this contact yet.</div>}
              <form className="contact-transfer" onSubmit={(event) => {
                event.preventDefault()
                const amount = Number(transferAmount)
                if (!Number.isFinite(amount) || amount <= 0 || Number(amount.toFixed(2)) !== amount) { setMpinMessage('Enter a positive amount with no more than two decimal places.'); return }
                if (props.mpinLoading || !props.mpinConfigured) return
                setTransferPin('')
                setIdempotencyKey(globalThis.crypto?.randomUUID?.() ?? `pay-${Date.now()}-${Math.random().toString(36).slice(2)}`)
                setSecurePayOpen(true)
              }}>
                <label className="sr-only" htmlFor="contact-transfer-amount">Transfer amount</label>
                {props.mpinLoading ? <p className="mpin-loading">Checking transfer security…</p> : !props.mpinConfigured ? <div className="mpin-setup">
                  <b>Set up your 6-digit MPIN</b><p>Use this PIN to authorize transfers. It is stored securely as a hash.</p>
                  <input aria-label="Create 6-digit MPIN" type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="new-password" placeholder="Create MPIN" value={newMpin} onChange={(event) => setNewMpin(event.target.value.replace(/\D/g, '').slice(0, 6))} />
                  <input aria-label="Confirm 6-digit MPIN" type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="new-password" placeholder="Confirm MPIN" value={confirmMpin} onChange={(event) => setConfirmMpin(event.target.value.replace(/\D/g, '').slice(0, 6))} />
                  <button type="button" disabled={newMpin.length !== 6 || confirmMpin.length !== 6} onClick={async () => {
                    if (newMpin !== confirmMpin) { setMpinMessage('The MPIN values do not match.'); return }
                    const ready = await props.setupMpin(newMpin)
                    setMpinMessage(ready ? 'MPIN is ready. Enter an amount and MPIN to send.' : props.mpinError || 'Could not set up MPIN.')
                    if (ready) { setNewMpin(''); setConfirmMpin('') }
                  }}>Set MPIN</button>
                </div> : <>
                  <span aria-hidden="true">₹</span><input id="contact-transfer-amount" type="number" min="0.01" step="0.01" placeholder="Enter amount" value={transferAmount} onChange={(event) => { setTransferAmount(event.target.value); setMpinMessage('') }} disabled={props.busy} />
                  <button type="submit" disabled={props.busy || props.mpinLoading || !recipientResolved || contactLookupError?.id === requestedAccountId || !transferAmount || Number(transferAmount) <= 0}>{props.busy ? 'Processing…' : 'Pay'}</button>
                </>}
              </form>
              {securePayOpen && <div className="secure-pay-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !props.busy) setSecurePayOpen(false) }}>
                <form className="secure-pay-dialog" role="dialog" aria-modal="true" aria-labelledby="secure-pay-title" onSubmit={async (event) => {
                  event.preventDefault()
                  if (!/^\d{6}$/.test(transferPin) || !idempotencyKey) { setMpinMessage('Enter your 6-digit MPIN to authorize this payment.'); return }
                  const posted = await props.submit('TRANSFER', Number(transferAmount), selectedContact.id, transferPin, idempotencyKey)
                  if (posted) { setTransferAmount(''); setTransferPin(''); setMpinMessage(''); setSecurePayOpen(false); setIdempotencyKey('') }
                }}>
                  <button className="secure-pay-close" type="button" aria-label="Close payment confirmation" disabled={props.busy} onClick={() => setSecurePayOpen(false)}>×</button>
                  <span className="secure-pay-icon">◈</span><div className="eyebrow">SECURE PAYMENT</div><h2 id="secure-pay-title">Confirm transfer</h2>
                  <p>Pay <b>{formatMoney(Number(transferAmount))}</b> to {selectedContact.name}</p>
                  <label htmlFor="secure-pay-mpin">Enter your 6-digit MPIN</label>
                  <input id="secure-pay-mpin" autoFocus type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="current-password" value={transferPin} onChange={(event) => { setTransferPin(event.target.value.replace(/\D/g, '').slice(0, 6)); setMpinMessage('') }} required />
                  {props.error && <div className="contact-transfer-message error" role="alert">{props.error}</div>}
                  {mpinMessage && <div className="contact-transfer-message error" role="alert">{mpinMessage}</div>}
                  <button className="secure-pay-button" type="submit" disabled={props.busy || transferPin.length !== 6}>{props.busy ? 'Securing payment…' : 'Pay securely'}</button>
                  <small>One payment reference is used for this attempt to prevent duplicate transfers.</small>
                </form>
              </div>}
              {props.error && <div className="contact-transfer-message error" role="alert">{props.error}</div>}
              {mpinMessage && <div className="contact-transfer-message error" role="alert">{mpinMessage}</div>}
              {props.notice && <div className="contact-transfer-message success" role="status">{props.notice}</div>}
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
            <TransactionFormCard busy={props.busy} error={props.error} notice={props.notice} onSubmit={props.submit} onOpenContact={(accountId) => navigate(`/account/contacts/${accountId}`)} />
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
