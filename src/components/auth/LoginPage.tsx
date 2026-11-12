import { useState } from 'react'
import type { FormEvent } from 'react'
import type { UserRole } from '../../types/ledger'
import { Brand } from '../common/Brand'
import { BankScene } from '../common/BankScene'

type LoginPageProps = {
  busy: boolean
  error: string
  onLogin: (role: UserRole, login: string, password: string) => Promise<unknown>
  onDemo: (role: UserRole) => void
}

export function LoginPage({ busy, error, onLogin, onDemo }: LoginPageProps) {
  const [role, setRole] = useState<UserRole>('ACCOUNT_HOLDER')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const success = await onLogin(role, login, password)
    if (success) setPassword('')
  }

  return <div className="auth-page has-scene"><BankScene /><div className="auth-decoration auth-decoration-one" /><div className="auth-decoration auth-decoration-two" />
    <section className="auth-card"><Brand />
      <div className="auth-heading"><div className="eyebrow">WELCOME BACK</div><h1>Sign in to your account</h1><p>Access your LedgerLine workspace securely.</p></div>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="auth-form">
        <label className="field-label" htmlFor="login-role">Sign in as</label>
        <select id="login-role" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
          <option value="ACCOUNT_HOLDER">Account holder</option><option value="ADMIN">Administrator</option><option value="AUDITOR">Auditor</option>
        </select>
        <label className="field-label" htmlFor="login-id">Email or phone number</label>
        <input id="login-id" autoComplete="username" value={login} onChange={(event) => setLogin(event.target.value)} placeholder="you@example.com" required />
        <label className="field-label" htmlFor="login-password">Password</label>
        <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
        <button className="submit-button auth-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <span>→</span></button>
      </form><div className="auth-secure">◈ Protected sign-in · Your account is encrypted</div>
      <div className="auth-divider"><span>OR</span></div>
      <button className="demo-entry" onClick={() => onDemo(role)} type="button">Preview with sample data <span>→</span></button>
      <p className="demo-caption">Demo actions stay in this browser and never reach the backend.</p>
    </section><footer className="auth-footer">© 2026 LedgerLine Financial</footer>
  </div>
}
