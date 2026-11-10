import { useCallback } from 'react'
import { useAccount } from '../../hooks/useAccount'
import { useLedgerHistory } from '../../hooks/useLedgerHistory'
import { useTransactions } from '../../hooks/useTransactions'
import type { AuthUser, TransactionType } from '../../types/ledger'
import { AccountDashboard } from './AccountDashboard'

export function AccountWorkspace({ user, onSignOut }: { user: AuthUser; onSignOut: () => Promise<void> }) {
  const accountState = useAccount(user)
  const transactionState = useTransactions(accountState.account, accountState.setAccount, Boolean(user.demo))
  const historyState = useLedgerHistory(Boolean(user.demo))
  const { refresh: refreshAccountData } = accountState
  const { refresh: refreshHistory } = historyState
  const { setError: setTransactionError, submit: submitTransactionRequest } = transactionState

  const submitTransaction = useCallback(async (type: TransactionType, amount: number, recipient?: number) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      setTransactionError('Enter an amount greater than zero.')
      return null
    }
    if (type === 'TRANSFER' && (!recipient || !Number.isInteger(recipient) || recipient <= 0)) {
      setTransactionError('Enter a valid recipient account ID.')
      return null
    }
    const result = await submitTransactionRequest(type, {
      amount,
      ...(type === 'TRANSFER' ? { destinationAccountId: recipient } : {}),
    })
    if (result && !user.demo) await refreshHistory()
    if (!result && !user.demo) {
      await refreshAccountData()
      await refreshHistory()
    }
    return result
  }, [refreshAccountData, refreshHistory, setTransactionError, submitTransactionRequest, user.demo])

  const refreshAccount = useCallback(() => { void refreshAccountData() }, [refreshAccountData])

  return <AccountDashboard
    user={user}
    account={accountState.account}
    loading={accountState.loading}
    loadError={accountState.error}
    refresh={refreshAccount}
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
