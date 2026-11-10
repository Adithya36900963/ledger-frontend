import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ManagedRole } from '../../types/ledger'
import { Feedback } from '../common/Feedback'
import { Panel } from '../common/Panel'

type UserPayload = { userName: string; email: string; number: string; password: string; role: ManagedRole }
type UserProvisionCardProps = { busy: boolean; error: string; notice: string; onCreate: (payload: UserPayload) => Promise<boolean> }

export function UserProvisionCard({ busy, error, notice, onCreate }: UserProvisionCardProps) {
  const [role, setRole] = useState<ManagedRole>('ACCOUNT_HOLDER')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [number, setNumber] = useState('')
  const [password, setPassword] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const created = await onCreate({ userName: name, email, number, password, role })
    if (created) { setName(''); setEmail(''); setNumber(''); setPassword('') }
  }

  return <Panel className="admin-form-panel">
    <div className="panel-heading"><div><div className="eyebrow">NEW USER</div><h2>Create a user</h2></div><span className="heading-spark">＋</span></div>
    <form onSubmit={submit} className="admin-form">
      <label className="field-label" htmlFor="new-role">Role</label><select id="new-role" value={role} onChange={(event) => setRole(event.target.value as ManagedRole)}><option value="ACCOUNT_HOLDER">Account holder</option><option value="AUDITOR">Auditor</option></select>
      <label className="field-label" htmlFor="new-name">Full name</label><input id="new-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
      <label className="field-label" htmlFor="new-email">Email address</label><input id="new-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
      <label className="field-label" htmlFor="new-number">Phone number</label><input id="new-number" type="tel" value={number} onChange={(event) => setNumber(event.target.value)} autoComplete="tel" required />
      <label className="field-label" htmlFor="new-password">Temporary password</label><input id="new-password" type="password" minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
      {error && <Feedback kind="error">{error}</Feedback>}{notice && <Feedback kind="success">{notice}</Feedback>}
      <button className="submit-button" disabled={busy}>{busy ? 'Creating user…' : 'Create user'} <span>→</span></button>
      <div className="form-security"><span>◈</span> Registration is available to administrators only.</div>
    </form>
  </Panel>
}
