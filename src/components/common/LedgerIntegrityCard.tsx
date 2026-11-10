import type { LedgerIntegrity } from '../../types/ledger'
import { formatMoney } from '../../types/ledger'

export function LedgerIntegrityCard({ integrity }: { integrity: LedgerIntegrity }) {
  return <article className="integrity-card">
    <div className="integrity-header"><span className={`integrity-icon ${integrity.balanced ? 'good' : 'bad'}`}>{integrity.balanced ? '✓' : '!'}</span><div><div className="eyebrow">DOUBLE-ENTRY CHECK</div><b>{integrity.balanced ? 'Ledger is balanced' : 'Integrity issue detected'}</b></div><span className={`integrity-pill ${integrity.balanced ? 'good' : 'bad'}`}>{integrity.balanced ? 'BALANCED' : 'REVIEW'}</span></div>
    <div className="integrity-stats"><div><span>Net ledger total</span><b>{formatMoney(integrity.ledgerTotal)}</b></div><div><span>Customer accounts</span><b>{integrity.customerAccountCount}</b></div><div><span>Negative balances</span><b>{integrity.negativeBalanceCount}</b></div></div>
  </article>
}
