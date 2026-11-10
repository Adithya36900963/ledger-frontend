import { useEffect, useState } from 'react'
import { adminService } from '../services/adminService'
import type { AdminUser, AuditEvent, LedgerEntry, LedgerIntegrity } from '../types/ledger'
import { demoAdminUsers, demoAuditRecords, demoLedgerEntries } from '../mocks/demoData'

export function useAdminOverview(demo: boolean) {
  const [users, setUsers] = useState<AdminUser[]>(() => demo ? [...demoAdminUsers] : [])
  const [events, setEvents] = useState<AuditEvent[]>(() => demo ? [...demoAuditRecords] : [])
  const [entries, setEntries] = useState<LedgerEntry[]>(() => demo ? [...demoLedgerEntries] : [])
  const [integrity, setIntegrity] = useState<LedgerIntegrity>(() => ({ balanced: true, ledgerTotal: 0, customerAccountCount: 2, negativeBalanceCount: 0 }))
  const [loading, setLoading] = useState(!demo)
  const [error, setError] = useState('')

  useEffect(() => {
    if (demo) return
    let active = true
    Promise.all([adminService.users(), adminService.auditEvents(), adminService.ledgerEntries(), adminService.integrity()])
      .then(([nextUsers, nextEvents, nextEntries, nextIntegrity]) => {
        if (!active) return
        setUsers(nextUsers); setEvents(nextEvents); setEntries(nextEntries); setIntegrity(nextIntegrity); setError('')
      })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Could not load admin records.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [demo])

  async function refresh() {
    if (demo) return
    setLoading(true); setError('')
    try {
      const [nextUsers, nextEvents, nextEntries, nextIntegrity] = await Promise.all([
        adminService.users(), adminService.auditEvents(), adminService.ledgerEntries(), adminService.integrity(),
      ])
      setUsers(nextUsers); setEvents(nextEvents); setEntries(nextEntries); setIntegrity(nextIntegrity)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load admin records.') }
    finally { setLoading(false) }
  }

  return { users, events, entries, integrity, loading, error, refresh }
}
