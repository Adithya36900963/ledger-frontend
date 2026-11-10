import type { AuthUser } from '../../types/ledger'
import { useVerification } from '../../hooks/useVerification'
import { Brand } from '../common/Brand'

type VerificationPageProps = {
  user: AuthUser
  onCheck: () => Promise<AuthUser | null>
  onSignOut: () => void
}

export function VerificationPage({ user, onCheck, onSignOut }: VerificationPageProps) {
  const verification = useVerification()
  const emailVerified = Boolean(user.emailVerified)
  const mobileVerified = Boolean(user.mobileVerified)

  return <div className="auth-page"><section className="auth-card verification-card"><div className="verification-top"><Brand /><button className="text-button" onClick={onSignOut}>Sign out</button></div>
    <div className="auth-heading"><div className="eyebrow">ACCOUNT SETUP</div><h1>Verify your account</h1><p>Complete both checks before you can access protected account operations.</p></div>
    <div className="verification-step"><div className={`verification-mark ${emailVerified ? 'complete' : ''}`}>{emailVerified ? '✓' : '1'}</div><div className="verification-copy"><b>Email address</b><span>{user.email || 'Your registered email'}</span><small>{emailVerified ? 'Verified' : 'Verification required'}</small></div>{!emailVerified && <button className="verify-button" onClick={() => void verification.requestEmail()} disabled={verification.busy !== null}>{verification.busy === 'email' ? 'Sending…' : 'Send link'}</button>}</div>
    <div className="verification-step"><div className={`verification-mark ${mobileVerified ? 'complete' : ''}`}>{mobileVerified ? '✓' : '2'}</div><div className="verification-copy"><b>Mobile number</b><span>Registered phone</span><small>{mobileVerified ? 'Verified' : 'Verification required'}</small></div>{!mobileVerified && <button className="verify-button" onClick={() => void verification.requestMobile()} disabled={verification.busy !== null}>{verification.busy === 'mobile' ? 'Sending…' : 'Send link'}</button>}</div>
    {verification.error && <div className="auth-error" role="alert">{verification.error}</div>}{verification.message && <div className="verification-message" role="status">{verification.message}</div>}
    <button className="submit-button auth-submit" onClick={() => void onCheck()}>{emailVerified && mobileVerified ? 'Continue to your account' : 'I have verified — check status'} <span>→</span></button>
    <div className="auth-secure">The verification link opens a confirmation page. Return here and check your status.</div>
  </section><footer className="auth-footer">© 2026 LedgerLine Financial</footer></div>
}
