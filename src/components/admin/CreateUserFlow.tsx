import { useEffect, useState } from 'react'
import type { CreatedUser, ManagedRole } from '../../types/ledger'
import { RolePermissionsCard } from './RolePermissionsCard'
import { UserProvisionCard } from './UserProvisionCard'

type Payload = { userName: string; email: string; number: string; password: string; role: ManagedRole }
type Props = {
  busy: boolean
  error: string
  notice: string
  latest?: CreatedUser
  onCreate: (payload: Payload) => Promise<boolean>
  onClose: () => void
}
type Stage = 'form' | 'success' | 'result'
const steps: Stage[] = ['form', 'success', 'result']
const stepLabels = ['User details', 'Created', 'Next step']

export function CreateUserFlow({ busy, error, notice, latest, onCreate, onClose }: Props) {
  const [stage, setStage] = useState<Stage>('form')

  useEffect(() => {
    if (stage !== 'success') return
    const timer = window.setTimeout(() => setStage('result'), 1700)
    return () => window.clearTimeout(timer)
  }, [stage])

  async function create(payload: Payload) {
    const created = await onCreate(payload)
    if (created) setStage('success')
    return created
  }

  const isAuditor = latest?.role === 'AUDITOR'

  return <div className="create-flow">
    <div className="flow-bar">
      <button type="button" className="ghost-button" onClick={onClose}>← Back to users</button>
      <ol className="flow-steps" aria-label="Progress">
        {steps.map((s, i) => <li key={s} className={i < steps.indexOf(stage) ? 'done' : i === steps.indexOf(stage) ? 'current' : ''}><span>{i < steps.indexOf(stage) ? '✓' : i + 1}</span>{stepLabels[i]}</li>)}
      </ol>
    </div>

    {stage === 'form' && <div key="form" className="flow-page admin-layout">
      <UserProvisionCard busy={busy} error={error} notice="" onCreate={create} />
      <RolePermissionsCard />
    </div>}

    {stage === 'success' && <div key="success" className="flow-page flow-center">
      <div className="success-burst" role="status">
        <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M14 27l8 8 16-17" /></svg>
      </div>
      <h2>User created successfully</h2>
      <p>Setting things up…</p>
    </div>}

    {stage === 'result' && latest && <div key="result" className="flow-page flow-center">
      <article className="result-card">
        <div className="result-head"><span className="success-pill">✓ SUCCESS</span><span className={`role-avatar ${latest.role.toLowerCase()}`}>{isAuditor ? 'R' : 'A'}</span></div>
        <h2>{latest.displayName}</h2>
        <div className="result-rows">
          <div><span>Role</span><b>{isAuditor ? 'Auditor' : 'Account holder'}</b></div>
          <div><span>User ID</span><b>{latest.userId}</b></div>
          {latest.accountHolderId ? <div><span>Account holder ID</span><b>{latest.accountHolderId}</b></div> : null}
        </div>
        {notice && <p className="result-note">{notice}</p>}
        <div className="result-ask">Do you want to add another user?</div>
        <div className="flow-actions">
          <button type="button" className="submit-button" onClick={() => setStage('form')}>＋ Yes, add another</button>
          <button type="button" className="ghost-button" onClick={onClose}>No, I'm done</button>
        </div>
      </article>
    </div>}
  </div>
}
