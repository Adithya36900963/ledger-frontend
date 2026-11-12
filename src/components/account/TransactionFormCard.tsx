import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TransactionType } from '../../types/ledger'
import { Feedback } from '../common/Feedback'
import { Panel } from '../common/Panel'

type TransactionFormCardProps = {
  busy: boolean
  error: string
  notice: string
  onSubmit: (type: TransactionType, amount: number, recipient?: number, mpin?: string) => Promise<unknown>
  mpinConfigured: boolean
  mpinLoading: boolean
  mpinError: string
  setupMpin: (mpin: string) => Promise<boolean>
}

export function TransactionFormCard({ busy, error, notice, onSubmit, mpinConfigured, mpinLoading, mpinError, setupMpin }: TransactionFormCardProps) {
  const [type, setType] = useState<TransactionType>('TRANSFER')
  const [amount, setAmount] = useState('25.00')
  const [recipient, setRecipient] = useState('')
  const [mpin, setMpin] = useState('')
  const [newMpin, setNewMpin] = useState('')
  const [confirmMpin, setConfirmMpin] = useState('')
  const [mpinMessage, setMpinMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedRecipient = recipient.trim().toUpperCase().replace(/^LL-/, '')
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || Number(numericAmount.toFixed(2)) !== numericAmount) {
      setMpinMessage('Enter a positive amount with no more than two decimal places.')
      return
    }
    if (type === 'TRANSFER' && (!/^\d+$/.test(normalizedRecipient) || !/^\d{6}$/.test(mpin))) {
      setMpinMessage('Enter a valid recipient account number and your 6-digit MPIN.')
      return
    }
    const result = await onSubmit(type, numericAmount, type === 'TRANSFER' ? Number(normalizedRecipient) : undefined, type === 'TRANSFER' ? mpin : undefined)
    if (result) { setRecipient(''); setAmount('25.00'); setMpin(''); setMpinMessage('') }
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
      <div className="amount-input"><span>₹</span><input id="transaction-amount" type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /><span className="currency">INR</span></div>
      {type === 'TRANSFER' && <><label className="field-label recipient-label" htmlFor="recipient-account">Recipient account ID</label><div className="recipient-input"><span>⌕</span><input id="recipient-account" type="text" inputMode="numeric" placeholder="e.g. LL-00000002" value={recipient} onChange={(event) => setRecipient(event.target.value)} required /></div>
        {mpinLoading ? <p className="form-helper">Checking MPIN setup…</p> : !mpinConfigured ? <div className="mpin-setup transfer-card-mpin"><b>Set up your 6-digit MPIN</b><p>This PIN is required to authorize transfers.</p><input aria-label="Create 6-digit MPIN" type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="new-password" placeholder="Create MPIN" value={newMpin} onChange={(event) => setNewMpin(event.target.value.replace(/\D/g, '').slice(0, 6))} /><input aria-label="Confirm 6-digit MPIN" type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="new-password" placeholder="Confirm MPIN" value={confirmMpin} onChange={(event) => setConfirmMpin(event.target.value.replace(/\D/g, '').slice(0, 6))} /><button type="button" disabled={newMpin.length !== 6 || confirmMpin.length !== 6} onClick={async () => { if (newMpin !== confirmMpin) { setMpinMessage('The MPIN values do not match.'); return }; const ready = await setupMpin(newMpin); setMpinMessage(ready ? 'MPIN configured. Enter it below to authorize your transfer.' : mpinError || 'Could not set up MPIN.'); if (ready) { setNewMpin(''); setConfirmMpin('') } }}>Set MPIN</button></div> : <><label className="field-label recipient-label" htmlFor="transfer-mpin">6-digit MPIN</label><div className="recipient-input"><span>◈</span><input id="transfer-mpin" type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="current-password" placeholder="Enter MPIN" value={mpin} onChange={(event) => setMpin(event.target.value.replace(/\D/g, '').slice(0, 6))} required /></div></>}
      </>}
      {type === 'DEPOSIT' && <p className="form-helper">A teller deposit will be added to your account balance.</p>}
      {type === 'WITHDRAWAL' && <p className="form-helper">Withdrawals are limited to your available balance.</p>}
      {error && <Feedback kind="error">{error}</Feedback>}{mpinMessage && <Feedback kind="error">{mpinMessage}</Feedback>}{notice && <Feedback kind="success">{notice}</Feedback>}
      <button className="submit-button" type="submit" disabled={busy || (type === 'TRANSFER' && (mpinLoading || !mpinConfigured))}>{busy ? <><span className="button-loader" /> Processing…</> : <>{type === 'TRANSFER' ? 'Continue transfer' : type === 'DEPOSIT' ? 'Make deposit' : 'Withdraw funds'} <span>→</span></>}</button>
      <div className="form-security"><span>◈</span> Transactions are protected and recorded in your ledger.</div>
    </form>
  </Panel>
}
