import type { LedgerEntry } from '../../types/ledger'
import { formatAccountNumber, formatMoney } from '../../types/ledger'
import { Panel } from './Panel'

export function LedgerEntriesCard({ entries, title = 'Ledger entries', loading = false }: { entries: LedgerEntry[]; title?: string; loading?: boolean }) {
  return <Panel className="data-table-card">
    <div className="activity-heading"><div><div className="eyebrow">APPEND-ONLY MONEY RECORD</div><h2>{title}</h2></div><span className="created-count">{loading ? 'Loading…' : `${entries.length} entries`}</span></div>
    <div className="audit-table-wrap"><table className="audit-table"><thead><tr><th>Transaction</th><th>Account</th><th>Type</th><th>Entry</th><th>Time</th></tr></thead><tbody>
      {entries.map((entry) => <tr key={entry.id}><td>{entry.transactionId}</td><td>{entry.accountHolder}<small>{formatAccountNumber(entry.accountId)}</small></td><td>{entry.type}</td><td className={entry.amount >= 0 ? 'positive' : 'negative'}>{entry.amount >= 0 ? '+' : '−'}{formatMoney(Math.abs(entry.amount))}</td><td>{new Date(entry.createdAt).toLocaleString()}</td></tr>)}
      {!entries.length && <tr><td colSpan={5}>{loading ? 'Loading ledger entries…' : 'No ledger entries found.'}</td></tr>}
    </tbody></table></div>
  </Panel>
}
