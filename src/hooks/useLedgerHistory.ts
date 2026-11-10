import { useEffect, useState } from 'react'
import { ledgerService } from '../services/ledgerService'
import type { AuditEvent, LedgerEntry } from '../types/ledger'
import { demoAuditRecords, demoLedgerEntries } from '../mocks/demoData'

export function useLedgerHistory(demo: boolean) {
  const [entries, setEntries] = useState<LedgerEntry[]>(() => demo ? demoLedgerEntries.filter((entry) => entry.accountId === 101) : [])
  const [events, setEvents] = useState<AuditEvent[]>(() => demo ? demoAuditRecords.filter((event) => event.actorName === 'Alice Morgan') : [])
  const [loading, setLoading] = useState(!demo)
  const [error, setError] = useState('')

  useEffect(() => {
    if (demo) return
    let active = true
    Promise.all([ledgerService.myEntries(), ledgerService.myAuditEvents()])
      .then(([nextEntries, nextEvents]) => {
        if (!active) return
        setEntries(nextEntries); setEvents(nextEvents); setError('')
      })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Could not load account history.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [demo])

  async function refresh() {
    if (demo) return
    setLoading(true); setError('')
    try {
      const [nextEntries, nextEvents] = await Promise.all([ledgerService.myEntries(), ledgerService.myAuditEvents()])
      setEntries(nextEntries); setEvents(nextEvents)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load account history.') }
    finally { setLoading(false) }
  }

  return { entries, events, loading, error, refresh }
}
