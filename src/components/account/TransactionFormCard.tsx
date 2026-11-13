import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TransactionType } from '../../types/ledger'
import { parseAccountNumber } from '../../types/ledger'
import { Feedback } from '../common/Feedback'
import { Panel } from '../common/Panel'

type TransactionFormCardProps = {
  busy: boolean
  error: string
  notice: string
  onSubmit: (type: TransactionType, amount: number, recipient?: number, mpin?: string) => Promise<unknown>
  onOpenContact: (accountId: number) => void
}

export function TransactionFormCard({ busy, error, notice, onSubmit, onOpenContact }: TransactionFormCardProps) {
  const [type, setType] = useState<TransactionType>('TRANSFER')
  const [amount, setAmount] = useState('25.00')
  const [recipient, setRecipient] = useState('')
  const [formMessage, setFormMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (type === 'TRANSFER') {
      const recipientId = parseAccountNumber(recipient)
      if (recipientId === null) {
        setFormMessage('Enter a valid recipient account number.')
        return
      }
      onOpenContact(recipientId)
      return
    }
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || Number(numericAmount.toFixed(2)) !== numericAmount) {
      setFormMessage('Enter a positive amount with no more than two decimal places.')
      return
    }
    const result = await onSubmit(type, numericAmount)
    if (result) { setRecipient(''); setAmount('25.00'); setFormMessage('') }
  }

  return <Panel className="transfer-panel">
    <div className="panel-heading"><div><div className="eyebrow">MONEY MOVEMENT</div><h2>Make a transaction</h2></div><span className="heading-spark">✳</span></div>
    <div className="action-tabs" role="tablist" aria-label="Transaction type">
      {(['TRANSFER', 'DEPOSIT', 'WITHDRAWAL'] as TransactionType[]).map((item) => <button key={item} role="tab" aria-selected={type === item} className={`action-tab ${type === item ? 'selected' : ''}`} onClick={() => setType(item)}>
        {item === 'TRANSFER' ? '↗' : item === 'DEPOSIT' ? '↓' : '↑'} <span>{item.charAt(0) + item.slice(1).toLowerCase()}</span>
      </button>)}
    </div>
    <form onSubmit={submit}>
      {type === 'TRANSFER' ? <><label className="field-label recipient-label" htmlFor="recipient-account">Recipient account number</label><div className="recipient-input"><span>⌕</span><input id="recipient-account" type="text" inputMode="numeric" placeholder="e.g. LL-00000002" value={recipient} onChange={(event) => { setRecipient(event.target.value); setFormMessage('') }} required /></div><p className="form-helper">Enter an account number to open its transfer chat. Add the amount and authorize it there.</p></> : <><label className="field-label" htmlFor="transaction-amount">Amount</label><div className="amount-input"><span>₹</span><input id="transaction-amount" type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /><span className="currency">INR</span></div></>}
      {type === 'DEPOSIT' && <p className="form-helper">A teller deposit will be added to your account balance.</p>}
      {type === 'WITHDRAWAL' && <p className="form-helper">Withdrawals are limited to your available balance.</p>}
      {error && <Feedback kind="error">{error}</Feedback>}{formMessage && <Feedback kind="error">{formMessage}</Feedback>}{notice && <Feedback kind="success">{notice}</Feedback>}
      <button className="submit-button" type="submit" disabled={busy}>{busy ? <><span className="button-loader" /> Processing…</> : <>{type === 'TRANSFER' ? 'Open transfer chat' : type === 'DEPOSIT' ? 'Make deposit' : 'Withdraw funds'} <span>→</span></>}</button>
      <div className="form-security"><span>◈</span> Transactions are protected and recorded in your ledger.</div>
    </form>
  </Panel>
}
