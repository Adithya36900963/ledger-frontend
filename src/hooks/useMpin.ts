import { useCallback, useEffect, useState } from 'react'
import { mpinService } from '../services/mpinService'

export function useMpin(demo: boolean) {
  const [configured, setConfigured] = useState(demo)
  const [loading, setLoading] = useState(!demo)
  const [error, setError] = useState('')

  useEffect(() => {
    if (demo) return
    let active = true
    mpinService.status().then((result) => {
      if (active) { setConfigured(result.configured); setError('') }
    }).catch((err: unknown) => {
      if (active) setError(err instanceof Error ? err.message : 'Could not check MPIN setup.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [demo])

  const setup = useCallback(async (mpin: string) => {
    setError('')
    if (!/^\d{6}$/.test(mpin)) { setError('MPIN must be exactly 6 digits.'); return false }
    if (demo) { setConfigured(true); return true }
    try {
      await mpinService.setup(mpin)
      setConfigured(true)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not configure your MPIN.')
      return false
    }
  }, [demo])

  return { configured, loading, error, setup }
}
