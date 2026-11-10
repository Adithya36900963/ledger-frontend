import { useCallback, useEffect, useState } from 'react'
import { accountService } from '../services/accountService'
import type { Account, AuthUser } from '../types/ledger'
import { demoAccount } from '../mocks/demoData'

export function useAccount(user: AuthUser | null) {
  const [account, setAccount] = useState<Account | null>(() => user?.demo ? { ...demoAccount } : null)
  const [loading, setLoading] = useState(() => Boolean(user && !user.demo))
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (user?.role !== 'ACCOUNT_HOLDER') return
    if (user.demo) return
    setLoading(true); setError('')
    try { setAccount(await accountService.current()) }
    catch (err) { setAccount(null); setError(err instanceof Error ? err.message : 'Could not load the account.') }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => {
    if (user?.role !== 'ACCOUNT_HOLDER' || user.demo) return
    let active = true
    accountService.current()
      .then((nextAccount) => { if (active) { setAccount(nextAccount); setError('') } })
      .catch((err: unknown) => { if (active) { setAccount(null); setError(err instanceof Error ? err.message : 'Could not load the account.') } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])
  return { account, setAccount, loading, error, refresh }
}
