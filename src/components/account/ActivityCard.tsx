import type { LedgerEntry, TransactionResult } from '../../types/ledger'
import { formatMoney } from '../../types/ledger'
import { Panel } from '../common/Panel'

export function ActivityCard({ transactions, entries, demo, loading }: { transactions: TransactionResult[]; entries: LedgerEntry[]; demo: boolean; loading: boolean }) {
  const count = demo ? transactions.length : entries.length
  return <Panel className="activity-panel" id="activity">
    <div className="activity-heading"><div><div className="eyebrow">{demo ? 'DEMO SESSION' : 'ACCOUNT LEDGER'}</div><h2>Recent activity</h2></div><span className="created-count">{loading ? 'Loading…' : `${count} entries`}</span></div>
    {count ? <div className="activity-list">{demo ? transactions.map((tx) => <div className="activity-item" key={tx.transactionId}>
      <div className={`activity-icon ${tx.type.toLowerCase()}`}>{tx.type === 'DEPOSIT' ? '↓' : tx.type === 'WITHDRAWAL' ? '↑' : '↗'}</div>
      <div className="activity-copy"><b>{tx.type === 'DEPOSIT' ? 'Cash deposit' : tx.type === 'WITHDRAWAL' ? 'Cash withdrawal' : `Transfer to LL-${String(tx.toAccountId).padStart(8, '0')}`}</b><span>{new Date(tx.createdAt).toLocaleString()}</span></div>
      <div className="activity-amount"><b className={tx.type === 'DEPOSIT' ? 'positive' : ''}>{tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER' ? '−' : '+'}{formatMoney(tx.amount)}</b><span>Completed</span></div>
    </div>) : entries.slice(0, 8).map((entry) => <div className="activity-item" key={entry.id}>
      <div className={`activity-icon ${entry.type.toLowerCase()}`}>{entry.amount >= 0 ? '↓' : '↑'}</div>
      <div className="activity-copy"><b>{entry.type === 'DEPOSIT' ? 'Cash deposit' : entry.type === 'WITHDRAWAL' ? 'Cash withdrawal' : 'Account transfer'}</b><span>{new Date(entry.createdAt).toLocaleString()} · {entry.transactionId}</span></div>
      <div className="activity-amount"><b className={entry.amount >= 0 ? 'positive' : ''}>{entry.amount >= 0 ? '+' : '−'}{formatMoney(Math.abs(entry.amount))}</b><span>Posted</span></div>
    </div>)}</div> : <div className="empty-activity"><div className="empty-icon">↕</div><b>{loading ? 'Loading ledger activity' : 'No transactions yet'}</b><span>Deposits, withdrawals, and transfers appear here after they are posted.</span></div>}
    <div className="activity-foot"><span className="foot-check">✓</span><span>Transactions are securely recorded in your account ledger.</span></div>
  </Panel>
}
