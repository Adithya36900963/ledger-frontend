import type { AdminUser } from '../../types/ledger'
import { formatAccountNumber, formatMoney, formatRole } from '../../types/ledger'
import { Panel } from '../common/Panel'

export function AdminUsersCard({ users, loading = false }: { users: AdminUser[]; loading?: boolean }) {
  return <Panel className="data-table-card">
    <div className="activity-heading"><div><div className="eyebrow">USER DIRECTORY</div><h2>Managed users</h2></div><span className="created-count">{loading ? 'Loading…' : `${users.length} users`}</span></div>
    <div className="audit-table-wrap"><table className="audit-table"><thead><tr><th>User</th><th>Role</th><th>Verification</th><th>Account</th><th>Balance</th></tr></thead><tbody>
      {users.map((user) => <tr key={user.userId}><td>{user.name}<small>{user.email}</small></td><td>{formatRole(user.role)}</td><td><span className={`audit-result ${user.emailVerified && user.mobileVerified ? 'success' : 'declined'}`}>{user.emailVerified && user.mobileVerified ? 'VERIFIED' : 'PENDING'}</span></td><td>{user.accountId ? formatAccountNumber(user.accountId) : '—'}<small>{user.accountHolderStatus || ''}</small></td><td>{user.balance === null ? '—' : formatMoney(user.balance)}</td></tr>)}
      {!users.length && <tr><td colSpan={5}>{loading ? 'Loading user records…' : 'No users found.'}</td></tr>}
    </tbody></table></div>
  </Panel>
}
