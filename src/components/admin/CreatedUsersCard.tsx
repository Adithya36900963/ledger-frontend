import type { CreatedUser } from '../../types/ledger'
import { Panel } from '../common/Panel'

export function CreatedUsersCard({ users }: { users: CreatedUser[] }) {
  return <Panel className="created-panel">
    <div className="activity-heading"><div><div className="eyebrow">THIS SESSION</div><h2>Recently created users</h2></div><span className="created-count">{users.length} created</span></div>
    {users.length ? <div className="created-list">{users.map((user, index) => <div className="created-row" key={`${user.userId}-${index}`}>
      <span className={`role-avatar ${user.role.toLowerCase()}`}>{user.role === 'AUDITOR' ? 'R' : 'A'}</span>
      <div><b>{user.displayName}</b><span>User ID {user.userId} · {user.role === 'AUDITOR' ? 'Auditor' : 'Account holder'}</span></div>
      <span className="role-check">✓</span>
    </div>)}</div> : <div className="admin-empty">Users you create will be listed here for this session.</div>}
  </Panel>
}
