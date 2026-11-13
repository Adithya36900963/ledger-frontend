import { Brand } from './Brand'
import { NavLink } from 'react-router-dom'
import type { AuthUser } from '../../types/ledger'

type SidebarProps = {
  section: string
  user: AuthUser
  onSignOut: () => void
  navLabel: string
  navIcon: string
  navTo: string
  extraNav?: Array<{ label: string; icon: string; to: string; end?: boolean }>
}

export function Sidebar({ section, user, onSignOut, navLabel, navIcon, navTo, extraNav = [] }: SidebarProps) {
  return <aside className="sidebar">
    <Brand />
    <div className="workspace-label">{section}</div>
    <nav className="nav-list" aria-label="Main navigation">
      <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to={navTo} end>
        <span className="nav-icon">{navIcon}</span>{navLabel}
      </NavLink>
      {extraNav.map((item) => <NavLink key={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to={item.to} end={item.end ?? true}>
        <span className="nav-icon">{item.icon}</span>{item.label}
      </NavLink>)}
    </nav>
    <div className="sidebar-bottom">
      <div className="secure-note"><span className="secure-icon">◈</span><div><b>{user.role === 'AUDITOR' ? 'Read-only access' : 'Secure banking'}</b><span>{user.role === 'AUDITOR' ? 'Changes are disabled' : 'Protected account access'}</span></div></div>
      <div className="profile"><div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div><div className="profile-copy"><b>{user.name}</b><span>{user.role === 'ACCOUNT_HOLDER' ? 'Account holder' : user.role === 'ADMIN' ? 'Administrator' : 'Auditor'}</span></div><button className="profile-signout" onClick={onSignOut}>Sign out</button></div>
    </div>
  </aside>
}
