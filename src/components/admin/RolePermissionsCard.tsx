import { Panel } from '../common/Panel'

export function RolePermissionsCard() {
  return <Panel className="provision-panel">
    <div className="eyebrow">ACCESS OVERVIEW</div><h2>Role permissions</h2>
    <div className="role-card"><span className="role-avatar holder">A</span><div><b>Account holder</b><span>Personal account and money movement</span></div><span className="role-check">✓</span></div>
    <div className="role-card"><span className="role-avatar auditor">R</span><div><b>Auditor</b><span>Read-only review access</span></div><span className="role-check">✓</span></div>
    <div className="role-card"><span className="role-avatar admin">A</span><div><b>Administrator</b><span>User and account administration</span></div><span className="role-check">✓</span></div>
    <div className="admin-note">New account holders receive a ledger account when account provisioning succeeds. Auditors can sign in with the credentials you create.</div>
  </Panel>
}
