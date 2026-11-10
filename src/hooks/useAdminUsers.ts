import { useState } from 'react'
import { accountService } from '../services/accountService'
import { authService } from '../services/authService'
import type { CreatedUser, ManagedRole } from '../types/ledger'
import { demoUsers } from '../mocks/demoData'

export function useAdminUsers(demo = false) {
  const [users, setUsers] = useState<CreatedUser[]>(() => demo ? [...demoUsers] : [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function create(payload: { userName: string; email: string; number: string; password: string; role: ManagedRole }) {
    setBusy(true); setError(''); setNotice('')
    try {
      let result
      if (demo) {
        result = {
          success: true,
          message: 'Demo user created',
          userId: 400 + users.length + 1,
          ...(payload.role === 'ACCOUNT_HOLDER' ? { accountHolderId: 400 + users.length + 1 } : {}),
          role: payload.role,
        }
      } else {
        result = await authService.createUser(payload)
      }
      if (!result.success) throw new Error(result.message || 'The user could not be created.')

      let accountNote = ''
      if (payload.role === 'ACCOUNT_HOLDER' && demo) {
        accountNote = ` Demo ledger account ${400 + users.length + 1} is ready.`
      } else if (payload.role === 'ACCOUNT_HOLDER') {
        if (!result.accountHolderId) {
          accountNote = ' Ledger account setup is pending because the backend response did not include the holder ID.'
        } else {
          try {
            const account = await accountService.open(result.accountHolderId)
            accountNote = ` Ledger account ${account.accountId} is ready.`
          } catch (err) {
            accountNote = ` The user was created, but account setup needs attention: ${err instanceof Error ? err.message : 'unknown error'}`
          }
        }
      }

      const created = { ...result, role: payload.role, displayName: payload.userName }
      setUsers((current) => [created, ...current])
      setNotice(`${payload.role === 'AUDITOR' ? 'Auditor' : 'Account holder'} ${payload.userName} created.${accountNote}`)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'User creation failed.')
      return false
    } finally { setBusy(false) }
  }

  return { users, busy, error, notice, create }
}
