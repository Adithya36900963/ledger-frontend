import { useMemo, useState } from 'react'
import type { LedgerEntry, TransactionResult, TransferHistory } from '../../types/ledger'
import { formatAccountNumber, formatMoney } from '../../types/ledger'
import { Panel } from '../common/Panel'
import './ActivityCard.css'

type Activity = {
  id: string
  transactionId: string
  type: LedgerEntry['type']
  amount: number
  createdAt: string
  direction: 'IN' | 'OUT'
  counterparty: string
  contactId: number | null
  contactName: string | null
}

type Filter = 'ALL' | 'IN' | 'OUT'
type View = 'chat' | 'list'

const dateLabel = (value: string) => new Date(value).toLocaleDateString(undefined, {
  month: 'long', day: 'numeric', year: 'numeric',
})

const timeLabel = (value: string) => new Date(value).toLocaleTimeString(undefined, {
  hour: 'numeric', minute: '2-digit',
})

const transferLabel = (incoming: boolean, name: string | null, accountId: number | null) => accountId === null
  ? (incoming ? 'Transfer received' : 'Transfer sent')
  : `${incoming ? 'From' : 'To'} ${name ? `${name} · ` : ''}${formatAccountNumber(accountId)}`

const timeAgo = (value: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return days < 30 ? `${days} day${days === 1 ? '' : 's'} ago` : dateLabel(value)
}

const listTitle = (activity: Activity) => {
  const who = activity.contactName ?? (activity.contactId !== null ? formatAccountNumber(activity.contactId) : '')
  if (activity.type === 'DEPOSIT') return 'Deposit received'
  if (activity.type === 'WITHDRAWAL') return 'Cash withdrawal'
  return `${activity.direction === 'IN' ? 'Received from' : 'Paid to'}${who ? ` ${who}` : ''}`
}

export function ActivityCard({ transactions, entries, transfers, accountId, demo, loading, onOpenContact, page = false, onOpenPage }: {
  transactions: TransactionResult[]
  entries: LedgerEntry[]
  transfers: TransferHistory[]
  accountId: number
  demo: boolean
  loading: boolean
  onOpenContact: (accountId: number) => void
  page?: boolean
  onOpenPage?: () => void
}) {
  const [filter, setFilter] = useState<Filter>('ALL')
  const [selected, setSelected] = useState<string | null>(null)
  const [view, setView] = useState<View>('chat')
  const activeView: View = page ? view : 'chat'

  const activities = useMemo<Activity[]>(() => {
    const transferById = new Map(transfers.map((item) => [item.transactionId, item]))
    const rows: Activity[] = demo
      ? transactions.map((transaction) => {
        const isTransfer = transaction.type === 'TRANSFER'
        const incoming = transaction.type === 'DEPOSIT' || (isTransfer && transaction.toAccountId === accountId)
        const contactId = isTransfer ? (incoming ? transaction.fromAccountId : transaction.toAccountId) : null
        const contactName = isTransfer ? transferById.get(transaction.transactionId)?.counterpartyName ?? null : null
        return {
          id: transaction.transactionId,
          transactionId: transaction.transactionId,
          type: transaction.type,
          amount: transaction.amount,
          createdAt: transaction.createdAt,
          direction: incoming ? 'IN' as const : 'OUT' as const,
          counterparty: isTransfer
            ? transferLabel(incoming, contactName, contactId)
            : transaction.type === 'DEPOSIT' ? 'Received into your account' : 'Cash withdrawal',
          contactId,
          contactName,
        }
      })
      : entries.map((entry) => {
        const incoming = entry.amount >= 0
        const transfer = entry.type === 'TRANSFER' ? transferById.get(entry.transactionId) : undefined
        const contactId = transfer?.counterpartyAccountId ?? null
        const contactName = transfer?.counterpartyName ?? null
        return {
          id: String(entry.id),
          transactionId: entry.transactionId,
          type: entry.type,
          amount: Math.abs(entry.amount),
          createdAt: entry.createdAt,
          direction: incoming ? 'IN' as const : 'OUT' as const,
          counterparty: entry.type === 'DEPOSIT'
            ? 'Deposit received'
            : entry.type === 'WITHDRAWAL' ? 'Cash withdrawal' : transferLabel(incoming, contactName, contactId),
          contactId,
          contactName,
        }
      })
    return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }, [accountId, demo, entries, transactions, transfers])

  const visible = activities.filter((activity) => filter === 'ALL' || activity.direction === filter)
  const grouped = visible.reduce<Array<{ date: string; items: Activity[] }>>((groups, activity) => {
    const date = dateLabel(activity.createdAt)
    const existing = groups.find((group) => group.date === date)
    if (existing) existing.items.push(activity)
    else groups.push({ date, items: [activity] })
    return groups
  }, [])
  const incoming = activities.filter((activity) => activity.direction === 'IN').reduce((sum, item) => sum + item.amount, 0)
  const outgoing = activities.filter((activity) => activity.direction === 'OUT').reduce((sum, item) => sum + item.amount, 0)

  const renderDetail = (activity: Activity) => <div className="transaction-detail">
    <div><span>Type</span><b>{activity.type.toLowerCase().replace('_', ' ')}</b></div>
    <div><span>Status</span><b className="detail-posted">Posted to ledger</b></div>
    <div><span>Transaction ID</span><b className="transaction-id">{activity.transactionId}</b></div>
    <div><span>Exact time</span><b>{new Date(activity.createdAt).toLocaleString()}</b></div>
    {activity.contactId !== null && <button className="transaction-open-chat" type="button" onClick={() => onOpenContact(activity.contactId!)}>Open chat with {activity.contactName ?? formatAccountNumber(activity.contactId)} <span aria-hidden="true">›</span></button>}
  </div>

  return <Panel className={page ? 'activity-panel activity-page' : 'activity-panel'} id="activity">
    <div className="activity-heading">
      <div><div className="eyebrow">{demo ? 'DEMO SESSION' : 'ACCOUNT LEDGER'}</div><h2>{page ? 'Transactions' : 'Transaction chat'}</h2></div>
      <div className="activity-heading-right">
        <span className="created-count">{loading ? 'Loading…' : `${activities.length} records`}</span>
        {page
          ? <div className="view-switch" role="group" aria-label="Change transaction view">
            <button type="button" className={view === 'chat' ? 'view-switch-btn active' : 'view-switch-btn'} aria-pressed={view === 'chat'} onClick={() => setView('chat')}><span aria-hidden="true">💬</span> Chat</button>
            <button type="button" className={view === 'list' ? 'view-switch-btn active' : 'view-switch-btn'} aria-pressed={view === 'list'} onClick={() => setView('list')}><span aria-hidden="true">☰</span> List</button>
          </div>
          : onOpenPage && <button type="button" className="activity-open-page" onClick={onOpenPage}>Transactions <span aria-hidden="true">›</span></button>}
      </div>
    </div>
    <p className="activity-intro">A clear timeline of money in and money out.</p>

    <div className="activity-totals" aria-label="Transaction totals">
      <div><span>Money out</span><b className="activity-out-total">{formatMoney(outgoing)}</b></div>
      <div><span>Money in</span><b className="activity-in-total">{formatMoney(incoming)}</b></div>
    </div>

    <div className="activity-filters" role="group" aria-label="Filter transactions">
      {([['ALL', 'All'], ['IN', 'Money in'], ['OUT', 'Money out']] as const).map(([value, label]) =>
        <button className={filter === value ? 'activity-filter active' : 'activity-filter'} key={value} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>,
      )}
    </div>

    {!visible.length ? null : activeView === 'list' ? <div className="transaction-list" aria-live="polite">
      {visible.map((activity) => {
        const isIn = activity.direction === 'IN'
        const isSelected = selected === activity.id
        return <div className="tx-row-wrap" key={activity.id}>
          <button type="button" className="tx-row" aria-expanded={isSelected} onClick={() => setSelected(isSelected ? null : activity.id)}>
            <span className={`tx-icon ${isIn ? 'in' : 'out'}`} aria-hidden="true">{isIn ? '↙' : '↗'}</span>
            <span className="tx-main">
              <span className="tx-top"><span className="tx-title">{listTitle(activity)}</span><span className="tx-amount">{formatMoney(activity.amount)}</span></span>
              <span className="tx-bottom"><span className="tx-ago">{timeAgo(activity.createdAt)}</span><span className="tx-flow">{isIn ? 'Credited to' : 'Debited from'} <i className="tx-bank" aria-label="your LedgerLine account">L</i></span></span>
            </span>
          </button>
          {isSelected && renderDetail(activity)}
        </div>
      })}
    </div> : grouped.length ? <div className="transaction-chat" aria-live="polite">
      {grouped.map((group) => <section className="transaction-day" key={group.date}>
        <div className="transaction-date"><span>{group.date}</span></div>
        {group.items.map((activity) => {
          const isIn = activity.direction === 'IN'
          const isSelected = selected === activity.id
          return <div className={`transaction-line ${isIn ? 'incoming' : 'outgoing'}`} key={activity.id}>
            <button className="transaction-bubble" aria-expanded={isSelected} onClick={() => setSelected(isSelected ? null : activity.id)}>
              <span className="transaction-amount">{formatMoney(activity.amount)}</span>
              <span className="transaction-status"><i>{isIn ? '↓' : '↑'}</i>{isIn ? 'Received' : 'Paid'} · Posted</span>
              <span className="transaction-counterparty">{activity.counterparty}</span>
              <span className="transaction-time">{timeLabel(activity.createdAt)} <span aria-hidden="true">›</span></span>
            </button>
            {isSelected && renderDetail(activity)}
          </div>
        })}
      </section>)}
    </div> : null}
    {!visible.length && <div className="empty-activity"><div className="empty-icon">↕</div><b>{loading ? 'Loading ledger activity' : 'No transactions found'}</b><span>{loading ? 'Your transaction history will appear here.' : 'Try another filter or check again after your next transaction.'}</span></div>}

    <div className="activity-foot"><span className="foot-check">✓</span><span>Every posted transaction is recorded in your account ledger.</span></div>
  </Panel>
}
