import type { Account } from '../../types/ledger'
import { tiltHandlers } from '../common/tilt'
import { formatMoney } from '../../types/ledger'

export function BalanceCard({ account }: { account: Account }) {
  return <article className="balance-card tilt-card" {...tiltHandlers(10)}><div className="balance-chip" /><div className="balance-shine" />
    <div className="balance-top"><span>Total balance</span><span className="balance-eye">◉</span></div>
    <div className="balance-amount">{formatMoney(account.balance)}</div>
    <div className="account-meta"><span className="account-chip">●</span><span>LedgerLine Account</span><span className="meta-divider">·</span><span>•••• {String(account.accountId).slice(-4).padStart(4, '0')}</span></div>
    <div className="balance-decoration decor-one" /><div className="balance-decoration decor-two" />
  </article>
}
