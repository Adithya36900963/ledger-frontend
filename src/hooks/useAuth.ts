import { useCallback, useEffect, useState } from 'react'
import { authService, authStorage } from '../services/authService'
import type { AuthUser, UserRole } from '../types/ledger'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => authStorage.read())
  const [restoring, setRestoring] = useState(() => {
    const persisted = authStorage.read()
    return Boolean(persisted && !persisted.demo)
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const persisted = authStorage.read()
    if (!persisted || persisted.demo) return
    let active = true
    authService.current()
      .then((session) => {
        if (!active) return
        const restored: AuthUser = { role: session.role, name: session.name, email: session.email,
          emailVerified: session.isEmailVerified, mobileVerified: session.isNumberVerified }
        authStorage.write(restored)
        setUser(restored)
      })
      .catch(() => { if (active) { authStorage.clear(); setUser(null) } })
      .finally(() => { if (active) setRestoring(false) })
    return () => { active = false }
  }, [])

  const login = useCallback(async (role: UserRole, identifier: string, password: string) => {
    setBusy(true); setError('')
    try {
      const signedIn = await authService.login(role, identifier, password)
      authStorage.write(signedIn)
      setUser(signedIn)
      return signedIn
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
      return null
    } finally { setBusy(false) }
  }, [])

  const enterDemo = useCallback((role: UserRole) => {
    const demoUser: AuthUser = {
      role,
      name: role === 'ADMIN' ? 'Demo Admin' : role === 'AUDITOR' ? 'Demo Auditor' : 'Alice Morgan',
      email: `${role.toLowerCase()}@ledgerline.demo`,
      demo: true,
      emailVerified: true,
      mobileVerified: true,
    }
    authStorage.write(demoUser)
    setUser(demoUser)
    setError('')
    return demoUser
  }, [])

  const logout = useCallback(async () => {
    setBusy(true)
    if (!user?.demo) {
      try { await authService.logout() } catch { /* Always clear local role state if the API is unavailable. */ }
    }
    authStorage.clear(); setUser(null); setError(''); setBusy(false)
  }, [user])

  const refreshCurrent = useCallback(async () => {
    if (!user || user.demo) return user
    try {
      const session = await authService.current()
      const refreshed: AuthUser = { role: session.role, name: session.name, email: session.email,
        emailVerified: session.isEmailVerified, mobileVerified: session.isNumberVerified }
      authStorage.write(refreshed); setUser(refreshed)
      return refreshed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh your session.')
      return null
    }
  }, [user])

  return { user, login, enterDemo, logout, refreshCurrent, restoring, busy, error }
}
