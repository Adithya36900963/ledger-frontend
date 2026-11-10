import { useState } from 'react'
import { authService } from '../services/authService'

export function useVerification() {
  const [busy, setBusy] = useState<'email' | 'mobile' | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function request(kind: 'email' | 'mobile') {
    setBusy(kind); setError(''); setMessage('')
    try {
      const result = kind === 'email' ? await authService.requestEmailVerification() : await authService.requestMobileVerification()
      setMessage(result.message)
      return result.success
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not send ${kind} verification.`)
      return false
    } finally { setBusy(null) }
  }

  return { busy, message, error, requestEmail: () => request('email'), requestMobile: () => request('mobile') }
}
