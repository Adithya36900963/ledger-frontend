import { useAdminUsers } from '../../hooks/useAdminUsers'
import { useAdminOverview } from '../../hooks/useAdminOverview'
import type { AuthUser } from '../../types/ledger'
import { Sidebar } from '../common/Sidebar'
import { CreatedUsersCard } from './CreatedUsersCard'
import { RolePermissionsCard } from './RolePermissionsCard'
import { UserProvisionCard } from './UserProvisionCard'
import { DemoBadge } from '../common/DemoBadge'
import { AdminUsersCard } from './AdminUsersCard'
import { AuditEventsCard } from '../common/AuditEventsCard'
import { LedgerEntriesCard } from '../common/LedgerEntriesCard'
import { LedgerIntegrityCard } from '../common/LedgerIntegrityCard'

export function AdminDashboard({ user, onSignOut }: { user: AuthUser; onSignOut: () => void }) {
  const users = useAdminUsers(Boolean(user.demo))
  const overview = useAdminOverview(Boolean(user.demo))
  async function createUser(payload: Parameters<typeof users.create>[0]) {
    const created = await users.create(payload)
    if (created && !user.demo) await overview.refresh()
    return created
  }
  return <div className="admin-shell">
    <Sidebar section="ADMINISTRATION" user={user} onSignOut={onSignOut} navLabel="User management" navIcon="♙" />
    <main className="main-content admin-main" id="workspace">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>User management</b></div><div className="topbar-right">{user.demo && <DemoBadge />}<span className="admin-badge">♙ Administrator</span></div></header>
      <div className="content-wrap">
        <div className="welcome-row"><div><div className="eyebrow">ADMINISTRATION</div><h1>Manage users</h1><p>Create account holder and auditor access.</p></div></div>
        <div className="admin-layout">
          <UserProvisionCard busy={users.busy} error={users.error} notice={users.notice} onCreate={createUser} />
          <RolePermissionsCard />
        </div>
        <LedgerIntegrityCard integrity={overview.integrity} />
        <CreatedUsersCard users={users.users} />
        {overview.error && <div className="inline-error history-error" role="alert">Some admin records could not be loaded: {overview.error}</div>}
        <AdminUsersCard users={overview.users} loading={overview.loading} />
        <LedgerEntriesCard entries={overview.entries} title="All ledger entries" loading={overview.loading} />
        <AuditEventsCard events={overview.events} title="Full audit trail" loading={overview.loading} />
      </div>
    </main>
  </div>
}
