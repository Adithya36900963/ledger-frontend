import { useMemo, useState } from 'react'
import type { LedgerEntry, TransactionResult } from '../../types/ledger'
import { formatMoney } from '../../types/ledger'
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
}

type Filter = 'ALL' | 'IN' | 'OUT'

const dateLabel = (value: string) => new Date(value).toLocaleDateString(undefined, {
  month: 'long', day: 'numeric', year: 'numeric',
})

const timeLabel = (value: string) => new Date(value).toLocaleTimeString(undefined, {
  hour: 'numeric', minute: '2-digit',
})

export function ActivityCard({ transactions, entries, demo, loading }: {
  transactions: TransactionResult[]
  entries: LedgerEntry[]
  demo: boolean
  loading: boolean
}) {
  const [filter, setFilter] = useState<Filter>('ALL')
  const [selected, setSelected] = useState<string | null>(null)

  const activities = useMemo<Activity[]>(() => {
    const rows: Activity[] = demo
      ? transactions.map((transaction) => ({
        id: transaction.transactionId,
        transactionId: transaction.transactionId,
        type: transaction.type,
        amount: transaction.amount,
        createdAt: transaction.createdAt,
        direction: transaction.type === 'DEPOSIT' ? 'IN' : 'OUT',
        counterparty: transaction.type === 'DEPOSIT'
          ? 'Received into your account'
          : transaction.type === 'WITHDRAWAL'
            ? 'Cash withdrawal'
            : `To account LL-${String(transaction.toAccountId).padStart(8, '0')}`,
      }))
      : entries.map((entry) => ({
        id: String(entry.id),
        transactionId: entry.transactionId,
        type: entry.type,
        amount: Math.abs(entry.amount),
        createdAt: entry.createdAt,
        direction: entry.amount >= 0 ? 'IN' : 'OUT',
        counterparty: entry.type === 'DEPOSIT'
          ? 'Deposit received'
          : entry.type === 'WITHDRAWAL'
            ? 'Cash withdrawal'
            : entry.amount >= 0 ? 'Transfer received' : 'Transfer sent',
      }))
    return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }, [demo, entries, transactions])

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

  return <Panel className="activity-panel" id="activity">
    <div className="activity-heading">
      <div><div className="eyebrow">{demo ? 'DEMO SESSION' : 'ACCOUNT LEDGER'}</div><h2>Transaction chat</h2></div>
      <span className="created-count">{loading ? 'Loading…' : `${activities.length} records`}</span>
    </div>
    <p className="activity-intro">A clear timeline of money in and money out.</p>

    <div className="activity-totals" aria-label="Transaction totals">
      <div><span>Money in</span><b className="activity-in-total">+{formatMoney(incoming)}</b></div>
      <div><span>Money out</span><b className="activity-out-total">−{formatMoney(outgoing)}</b></div>
    </div>

    <div className="activity-filters" role="group" aria-label="Filter transactions">
      {([['ALL', 'All'], ['IN', 'Money in'], ['OUT', 'Money out']] as const).map(([value, label]) =>
        <button className={filter === value ? 'activity-filter active' : 'activity-filter'} key={value} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>,
      )}
    </div>

    {grouped.length ? <div className="transaction-chat" aria-live="polite">
      {grouped.map((group) => <section className="transaction-day" key={group.date}>
        <div className="transaction-date"><span>{group.date}</span></div>
        {group.items.map((activity) => {
          const isIn = activity.direction === 'IN'
          const isSelected = selected === activity.id
          return <div className={`transaction-line ${isIn ? 'incoming' : 'outgoing'}`} key={activity.id}>
            <button className="transaction-bubble" aria-expanded={isSelected} onClick={() => setSelected(isSelected ? null : activity.id)}>
              <span className="transaction-amount">{isIn ? '+' : '−'}{formatMoney(activity.amount)}</span>
              <span className="transaction-status"><i>{isIn ? '↓' : '↑'}</i>{isIn ? 'Received' : 'Sent'} · Posted</span>
              <span className="transaction-counterparty">{activity.counterparty}</span>
              <span className="transaction-time">{timeLabel(activity.createdAt)} <span aria-hidden="true">›</span></span>
            </button>
            {isSelected && <div className="transaction-detail">
              <div><span>Type</span><b>{activity.type.toLowerCase().replace('_', ' ')}</b></div>
              <div><span>Status</span><b className="detail-posted">Posted to ledger</b></div>
              <div><span>Transaction ID</span><b className="transaction-id">{activity.transactionId}</b></div>
              <div><span>Exact time</span><b>{new Date(activity.createdAt).toLocaleString()}</b></div>
            </div>}
          </div>
        })}
      </section>)}
    </div> : <div className="empty-activity"><div className="empty-icon">↕</div><b>{loading ? 'Loading ledger activity' : 'No transactions found'}</b><span>{loading ? 'Your transaction history will appear here.' : 'Try another filter or check again after your next transaction.'}</span></div>}

    <div className="activity-foot"><span className="foot-check">✓</span><span>Every posted transaction is recorded in your account ledger.</span></div>
  </Panel>
}
