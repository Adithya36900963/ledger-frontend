import { useCallback, useState } from 'react'
import { transactionService } from '../services/transactionService'
import type { Account, TransactionRequest, TransactionResult, TransactionType } from '../types/ledger'
import { demoTransactions } from '../mocks/demoData'

export function useTransactions(
  currentAccount: Account | null,
  setAccount: (updater: (current: Account | null) => Account | null) => void,
  demo: boolean,
) {
  const [items, setItems] = useState<TransactionResult[]>(() => demo ? [...demoTransactions] : [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const submit = useCallback(async (type: TransactionType, payload: TransactionRequest) => {
    setBusy(true); setError(''); setNotice('')
    try {
      let result: TransactionResult
      if (demo) {
        if (!currentAccount) throw new Error('Demo account is still loading.')
        if (type !== 'DEPOSIT' && currentAccount.balance < payload.amount) throw new Error('Insufficient funds in the demo account.')
        if (type === 'TRANSFER' && payload.destinationAccountId === currentAccount.accountId) throw new Error('Choose a different recipient account.')
        const nextBalance = type === 'DEPOSIT' ? currentAccount.balance + payload.amount : currentAccount.balance - payload.amount
        result = {
          transactionId: `DEMO-TX-${Date.now()}`,
          type,
          fromAccountId: type === 'DEPOSIT' ? null : currentAccount.accountId,
          toAccountId: type === 'WITHDRAWAL' ? null : type === 'DEPOSIT' ? currentAccount.accountId : payload.destinationAccountId ?? null,
          amount: payload.amount,
          balance: nextBalance,
          createdAt: new Date().toISOString(),
        }
      } else {
        result = await transactionService.submit(type, payload)
      }
      setItems((current) => [result, ...current.filter((item) => item.transactionId !== result.transactionId)].slice(0, 8))
      setAccount((current) => current ? { ...current, balance: result.balance } : current)
      setNotice(`${type.charAt(0)}${type.slice(1).toLowerCase()} completed successfully.`)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The transaction could not be completed.')
      return null
    } finally { setBusy(false) }
  }, [currentAccount, demo, setAccount])

  const clear = useCallback(() => { setItems(demo ? [...demoTransactions] : []); setError(''); setNotice('') }, [demo])
  return { items, busy, error, notice, submit, clear, setError, setNotice }
}
