import { lazy, Suspense, useCallback } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import type { AuthUser, UserRole } from './types/ledger'
import './App.css'
import './ledger3d.css'
import './admin-flow.css'

const LoginPage = lazy(() => import('./components/auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const VerificationPage = lazy(() => import('./components/auth/VerificationPage').then((module) => ({ default: module.VerificationPage })))
const AccountWorkspace = lazy(() => import('./components/account/AccountWorkspace').then((module) => ({ default: module.AccountWorkspace })))
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard })))
const AuditorDashboard = lazy(() => import('./components/auditor/AuditorDashboard').then((module) => ({ default: module.AuditorDashboard })))

const rolePath: Record<UserRole, string> = {
  ADMIN: '/admin',
  AUDITOR: '/auditor',
  ACCOUNT_HOLDER: '/account',
}

function LoadingPage({ message = 'Loading LedgerLine…' }: { message?: string }) {
  return <div className="auth-page"><div className="loading-line"><span className="loader" /> {message}</div></div>
}

function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}

function AppRoutes() {
  const auth = useAuth()

  if (auth.restoring) return <LoadingPage message="Restoring your secure session…" />

  return <Suspense fallback={<LoadingPage />}>
    <Routes>
      <Route path="/login" element={<LoginRoute auth={auth} />} />
      <Route element={<RequireSession user={auth.user} />}>
        <Route path="/verify" element={<VerificationRoute user={auth.user} onCheck={auth.refreshCurrent} onSignOut={auth.logout} />} />
        <Route element={<RequireVerified user={auth.user} />}>
          <Route path="/account" element={<RoleRoute user={auth.user} role="ACCOUNT_HOLDER"><AccountWorkspace user={auth.user!} onSignOut={auth.logout} /></RoleRoute>} />
          <Route path="/account/contacts" element={<RoleRoute user={auth.user} role="ACCOUNT_HOLDER"><AccountWorkspace user={auth.user!} onSignOut={auth.logout} /></RoleRoute>} />
          <Route path="/account/contacts/:accountId" element={<RoleRoute user={auth.user} role="ACCOUNT_HOLDER"><AccountWorkspace user={auth.user!} onSignOut={auth.logout} /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute user={auth.user} role="ADMIN"><AdminDashboard user={auth.user!} onSignOut={auth.logout} /></RoleRoute>} />
          <Route path="/auditor" element={<RoleRoute user={auth.user} role="AUDITOR"><AuditorDashboard user={auth.user!} onSignOut={auth.logout} /></RoleRoute>} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to={auth.user ? rolePath[auth.user.role] : '/login'} replace />} />
      <Route path="*" element={<Navigate to={auth.user ? rolePath[auth.user.role] : '/login'} replace />} />
    </Routes>
  </Suspense>
}

function LoginRoute({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const navigate = useNavigate()
  const { login, enterDemo, user } = auth
  const onLogin = useCallback(async (role: UserRole, identifier: string, password: string) => {
    const signedIn = await login(role, identifier, password)
    if (signedIn) navigate(rolePath[signedIn.role], { replace: true })
    return signedIn
  }, [login, navigate])
  const onDemo = useCallback((role: UserRole) => {
    const demoUser = enterDemo(role)
    navigate(rolePath[demoUser.role], { replace: true })
  }, [enterDemo, navigate])

  if (user) return <Navigate to={rolePath[user.role]} replace />
  return <LoginPage busy={auth.busy} error={auth.error} onLogin={onLogin} onDemo={onDemo} />
}

function RequireSession({ user }: { user: AuthUser | null }) {
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function RequireVerified({ user }: { user: AuthUser | null }) {
  if (!user) return <Navigate to="/login" replace />
  if (!user.demo && (!user.emailVerified || !user.mobileVerified)) return <Navigate to="/verify" replace />
  return <Outlet />
}

function RoleRoute({ user, role, children }: { user: AuthUser | null; role: UserRole; children: ReactNode }) {
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={rolePath[user.role]} replace />
  return children
}

function VerificationRoute({ user, onCheck, onSignOut }: { user: AuthUser | null; onCheck: () => Promise<AuthUser | null>; onSignOut: () => Promise<void> }) {
  if (!user) return <Navigate to="/login" replace />
  if (user.demo || (user.emailVerified && user.mobileVerified)) return <Navigate to={rolePath[user.role]} replace />
  return <VerificationPage user={user} onCheck={onCheck} onSignOut={onSignOut} />
}

export default App
