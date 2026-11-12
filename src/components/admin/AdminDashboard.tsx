import { memo, useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { useAdminUsers } from '../../hooks/useAdminUsers'
import { useAdminOverview } from '../../hooks/useAdminOverview'
import type { AuthUser, ManagedRole } from '../../types/ledger'
import { Sidebar } from '../common/Sidebar'
import { ThemeToggle } from '../common/ThemeToggle'
import { UserProvisionCard } from './UserProvisionCard'
import { applyTheme, getTheme } from '../../theme'
import type { Theme } from '../../theme'
import { CreatedUsersCard } from './CreatedUsersCard'
import { RolePermissionsCard } from './RolePermissionsCard'
import { CreateUserFlow } from './CreateUserFlow'
import { DemoBadge } from '../common/DemoBadge'
import { AdminUsersCard } from './AdminUsersCard'
import { AuditEventsCard } from '../common/AuditEventsCard'
import { LedgerEntriesCard } from '../common/LedgerEntriesCard'
import { LedgerIntegrityCard } from '../common/LedgerIntegrityCard'

type View = 'home' | 'create' | 'permissions' | 'integrity' | 'created' | 'users' | 'ledger' | 'audit'
type CreateUserPayload = { userName: string; email: string; number: string; password: string; role: ManagedRole }

export const AdminDashboard = memo(function AdminDashboard({ user, onSignOut }: { user: AuthUser; onSignOut: () => void }) {
  const [view, setView] = useState<View>('home')
  const [theme, setTheme] = useState<Theme>(getTheme)
  const toggleTheme = useCallback(() => {
    const next: Theme = theme === '3d' ? 'classic' : '3d'
    applyTheme(next); setTheme(next); setView('home'); window.scrollTo({ top: 0 })
  }, [theme])
  const users = useAdminUsers(Boolean(user.demo))
  const overview = useAdminOverview(Boolean(user.demo))
  const { create: createAdminUser } = users
  const { refresh: refreshOverview } = overview
  const createUser = useCallback(async (payload: CreateUserPayload) => {
    const created = await createAdminUser(payload)
    if (created && !user.demo) await refreshOverview()
    return created
  }, [createAdminUser, refreshOverview, user.demo])
  const go = useCallback((next: View) => { setView(next); window.scrollTo({ top: 0 }) }, [])
  const items: { view: View; icon: string; title: string; text: string; stat: string; primary?: boolean }[] = [
    { view: 'create', icon: '＋', title: 'Create user', text: 'Add an account holder or auditor', stat: 'New', primary: true },
    { view: 'integrity', icon: '✓', title: 'Ledger integrity', text: 'Double-entry balance check', stat: overview.integrity.balanced ? 'Balanced' : 'Review' },
    { view: 'users', icon: '♙', title: 'User directory', text: 'Everyone with access', stat: `${overview.users.length} users` },
    { view: 'ledger', icon: '▤', title: 'Ledger entries', text: 'All debits and credits', stat: `${overview.entries.length} entries` },
    { view: 'audit', icon: '◈', title: 'Audit trail', text: 'Full security event log', stat: `${overview.events.length} events` },
    { view: 'created', icon: '★', title: 'Created this session', text: 'Users you just added', stat: `${users.users.length} created` },
    { view: 'permissions', icon: '⚿', title: 'Role permissions', text: 'What each role can do', stat: '3 roles' },
  ]
  return <div className="admin-shell">
    <Sidebar section="ADMINISTRATION" user={user} onSignOut={onSignOut} navLabel="User management" navIcon="♙" navTo="/admin" />
    <main className="main-content admin-main" id="workspace">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>User management</b></div><div className="topbar-right">{user.demo && <DemoBadge />}<span className="admin-badge">♙ Administrator</span><ThemeToggle theme={theme} onToggle={toggleTheme} /></div></header>
      <div className="content-wrap">
        {theme === 'classic' ? <>
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
        </> : <>
        {view === 'create' && <CreateUserFlow busy={users.busy} error={users.error} notice={users.notice} latest={users.users[0]} onCreate={createUser} onClose={() => go('home')} />}
        {view === 'home' && <div className="flow-page">
          <div className="welcome-row"><div><div className="eyebrow">ADMINISTRATION</div><h1>Manage users</h1><p>Choose what you want to work on.</p></div></div>
          {overview.error && <div className="inline-error history-error" role="alert">Some admin records could not be loaded: {overview.error}</div>}
          <div className="tile-grid">
            {items.map((item) => <Tile key={item.view} {...item} onClick={() => go(item.view)} />)}
          </div>
        </div>}
        {view !== 'home' && view !== 'create' && <div className="flow-page">
          <div className="flow-bar"><button type="button" className="ghost-button" onClick={() => go('home')}>← Back to admin home</button></div>
          {view === 'integrity' && <LedgerIntegrityCard integrity={overview.integrity} />}
          {view === 'permissions' && <RolePermissionsCard />}
          {view === 'created' && <CreatedUsersCard users={users.users} />}
          {view === 'users' && <AdminUsersCard users={overview.users} loading={overview.loading} />}
          {view === 'ledger' && <LedgerEntriesCard entries={overview.entries} title="All ledger entries" loading={overview.loading} />}
          {view === 'audit' && <AuditEventsCard events={overview.events} title="Full audit trail" loading={overview.loading} />}
        </div>}
        </>}
      </div>
    </main>
  </div>
})

function Tile({ icon, title, text, stat, primary, onClick }: { icon: ReactNode; title: string; text: string; stat: string; primary?: boolean; onClick: () => void }) {
  return <button type="button" className={`tile ${primary ? 'tile-primary' : ''}`} onClick={onClick}>
    <span className="tile-icon">{icon}</span><b>{title}</b><span className="tile-text">{text}</span><span className="tile-stat">{stat} <i>→</i></span>
  </button>
}
