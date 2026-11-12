import { useCallback, useEffect, useState } from 'react'
import { ledgerService } from '../services/ledgerService'
import type { AuditEvent, LedgerEntry, TransferHistory } from '../types/ledger'
import { demoAuditRecords, demoLedgerEntries, demoTransactions } from '../mocks/demoData'

export function useLedgerHistory(demo: boolean) {
  const [entries, setEntries] = useState<LedgerEntry[]>(() => demo ? demoLedgerEntries.filter((entry) => entry.accountId === 101) : [])
  const [events, setEvents] = useState<AuditEvent[]>(() => demo ? demoAuditRecords.filter((event) => event.actorName === 'Alice Morgan') : [])
  const [transfers, setTransfers] = useState<TransferHistory[]>(() => demo ? demoTransactions.filter((item) => item.type === 'TRANSFER').map((item) => ({
    transactionId: item.transactionId,
    fromAccountId: item.fromAccountId!,
    toAccountId: item.toAccountId!,
    counterpartyAccountId: item.toAccountId!,
    counterpartyName: 'Bob Chen',
    amount: item.amount,
    createdAt: item.createdAt,
  })) : [])
  const [loading, setLoading] = useState(!demo)
  const [error, setError] = useState('')

  useEffect(() => {
    if (demo) return
    let active = true
    Promise.all([ledgerService.myEntries(), ledgerService.myAuditEvents(), ledgerService.myTransfers()])
      .then(([nextEntries, nextEvents, nextTransfers]) => {
        if (!active) return
        setEntries(nextEntries); setEvents(nextEvents); setTransfers(nextTransfers); setError('')
      })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Could not load account history.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [demo])

  const refresh = useCallback(async () => {
    if (demo) return
    setLoading(true); setError('')
    try {
      const [nextEntries, nextEvents, nextTransfers] = await Promise.all([ledgerService.myEntries(), ledgerService.myAuditEvents(), ledgerService.myTransfers()])
      setEntries(nextEntries); setEvents(nextEvents); setTransfers(nextTransfers)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load account history.') }
    finally { setLoading(false) }
  }, [demo])

  return { entries, events, transfers, loading, error, refresh }
}
