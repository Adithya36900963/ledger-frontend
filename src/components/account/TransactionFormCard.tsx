import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TransactionType } from '../../types/ledger'
import { Feedback } from '../common/Feedback'
import { Panel } from '../common/Panel'

type TransactionFormCardProps = {
  busy: boolean
  error: string
  notice: string
  onSubmit: (type: TransactionType, amount: number, recipient?: number) => Promise<unknown>
}

export function TransactionFormCard({ busy, error, notice, onSubmit }: TransactionFormCardProps) {
  const [type, setType] = useState<TransactionType>('TRANSFER')
  const [amount, setAmount] = useState('25.00')
  const [recipient, setRecipient] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedRecipient = recipient.trim().toUpperCase().replace(/^LL-/, '')
    const result = await onSubmit(type, Number(amount), type === 'TRANSFER' ? Number(normalizedRecipient) : undefined)
    if (result) { setRecipient(''); setAmount('25.00') }
  }

  return <Panel className="transfer-panel">
    <div className="panel-heading"><div><div className="eyebrow">MONEY MOVEMENT</div><h2>Make a transaction</h2></div><span className="heading-spark">✳</span></div>
    <div className="action-tabs" role="tablist" aria-label="Transaction type">
      {(['TRANSFER', 'DEPOSIT', 'WITHDRAWAL'] as TransactionType[]).map((item) => <button key={item} role="tab" aria-selected={type === item} className={`action-tab ${type === item ? 'selected' : ''}`} onClick={() => setType(item)}>
        {item === 'TRANSFER' ? '↗' : item === 'DEPOSIT' ? '↓' : '↑'} <span>{item.charAt(0) + item.slice(1).toLowerCase()}</span>
      </button>)}
    </div>
    <form onSubmit={submit}>
      <label className="field-label" htmlFor="transaction-amount">Amount</label>
      <div className="amount-input"><span>$</span><input id="transaction-amount" type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /><span className="currency">USD</span></div>
      {type === 'TRANSFER' && <><label className="field-label recipient-label" htmlFor="recipient-account">Recipient account ID</label><div className="recipient-input"><span>⌕</span><input id="recipient-account" type="text" inputMode="numeric" placeholder="e.g. LL-00000002" value={recipient} onChange={(event) => setRecipient(event.target.value)} required /></div></>}
      {type === 'DEPOSIT' && <p className="form-helper">A teller deposit will be added to your account balance.</p>}
      {type === 'WITHDRAWAL' && <p className="form-helper">Withdrawals are limited to your available balance.</p>}
      {error && <Feedback kind="error">{error}</Feedback>}{notice && <Feedback kind="success">{notice}</Feedback>}
      <button className="submit-button" type="submit" disabled={busy}>{busy ? <><span className="button-loader" /> Processing…</> : <>{type === 'TRANSFER' ? 'Continue transfer' : type === 'DEPOSIT' ? 'Make deposit' : 'Withdraw funds'} <span>→</span></>}</button>
      <div className="form-security"><span>◈</span> Transactions are protected and recorded in your ledger.</div>
    </form>
  </Panel>
}
