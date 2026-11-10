import { useAccount } from './hooks/useAccount'
import { useAuth } from './hooks/useAuth'
import { useTransactions } from './hooks/useTransactions'
import { useLedgerHistory } from './hooks/useLedgerHistory'
import { AccountDashboard } from './components/account/AccountDashboard'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { AuditorDashboard } from './components/auditor/AuditorDashboard'
import { LoginPage } from './components/auth/LoginPage'
import { VerificationPage } from './components/auth/VerificationPage'
import type { TransactionType, UserRole } from './types/ledger'
import './App.css'

function App() {
  const auth = useAuth()

  if (auth.restoring) return <div className="auth-page"><div className="loading-line"><span className="loader" /> Restoring your secure session…</div></div>
  if (!auth.user) {
    return <LoginPage busy={auth.busy} error={auth.error} onLogin={(role: UserRole, login: string, password: string) => auth.login(role, login, password)} onDemo={auth.enterDemo} />
  }

  if (!auth.user.demo && (!auth.user.emailVerified || !auth.user.mobileVerified)) {
    return <VerificationPage user={auth.user} onCheck={auth.refreshCurrent} onSignOut={auth.logout} />
  }

  if (auth.user.role === 'ADMIN') return <AdminDashboard user={auth.user} onSignOut={auth.logout} />
  if (auth.user.role === 'AUDITOR') return <AuditorDashboard user={auth.user} onSignOut={auth.logout} />
  return <AccountWorkspace key={`${auth.user.email ?? auth.user.name}-${auth.user.demo ? 'demo' : 'live'}`} user={auth.user} onSignOut={auth.logout} />
}

function AccountWorkspace({ user, onSignOut }: { user: NonNullable<ReturnType<typeof useAuth>['user']>; onSignOut: () => Promise<void> }) {
  const accountState = useAccount(user)
  const transactionState = useTransactions(accountState.account, accountState.setAccount, Boolean(user.demo))
  const historyState = useLedgerHistory(Boolean(user.demo))

  async function submitTransaction(type: TransactionType, amount: number, recipient?: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      transactionState.setError('Enter an amount greater than zero.')
      return null
    }
    if (type === 'TRANSFER' && (!recipient || !Number.isInteger(recipient) || recipient <= 0)) {
      transactionState.setError('Enter a valid recipient account ID.')
      return null
    }
    const result = await transactionState.submit(type, {
      amount,
      ...(type === 'TRANSFER' ? { destinationAccountId: recipient } : {}),
    })
    if (result && !user.demo) await historyState.refresh()
    if (!result && !user.demo) {
      await accountState.refresh()
      await historyState.refresh()
    }
    return result
  }

  return <AccountDashboard
    user={user}
    account={accountState.account}
    loading={accountState.loading}
    loadError={accountState.error}
    refresh={() => { void accountState.refresh() }}
    logout={onSignOut}
    transactions={transactionState.items}
    busy={transactionState.busy}
    error={transactionState.error}
    notice={transactionState.notice}
    submit={submitTransaction}
    demo={Boolean(user.demo)}
    ledgerEntries={historyState.entries}
    auditEvents={historyState.events}
    historyLoading={historyState.loading}
    historyError={historyState.error}
  />
}

export default App
