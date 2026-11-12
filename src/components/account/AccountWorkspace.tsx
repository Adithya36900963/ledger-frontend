import { useCallback } from 'react'
import { useAccount } from '../../hooks/useAccount'
import { useLedgerHistory } from '../../hooks/useLedgerHistory'
import { useTransactions } from '../../hooks/useTransactions'
import { useMpin } from '../../hooks/useMpin'
import type { AuthUser, TransactionType } from '../../types/ledger'
import { AccountDashboard } from './AccountDashboard'

export function AccountWorkspace({ user, onSignOut }: { user: AuthUser; onSignOut: () => Promise<void> }) {
  const accountState = useAccount(user)
  const transactionState = useTransactions(accountState.account, accountState.setAccount, Boolean(user.demo))
  const historyState = useLedgerHistory(Boolean(user.demo))
  const mpinState = useMpin(Boolean(user.demo))
  const { refresh: refreshAccountData } = accountState
  const { refresh: refreshHistory } = historyState
  const { setError: setTransactionError, submit: submitTransactionRequest } = transactionState

  const submitTransaction = useCallback(async (type: TransactionType, amount: number, recipient?: number, mpin?: string) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      setTransactionError('Enter an amount greater than zero.')
      return null
    }
    if (Number(amount.toFixed(2)) !== amount) {
      setTransactionError('Amount can have no more than two decimal places.')
      return null
    }
    if (type === 'TRANSFER' && !/^\d{6}$/.test(mpin ?? '')) {
      setTransactionError('Enter your 6-digit MPIN to authorize this transfer.')
      return null
    }
    if (type === 'TRANSFER' && (!recipient || !Number.isInteger(recipient) || recipient <= 0)) {
      setTransactionError('Enter a valid recipient account ID.')
      return null
    }
    const result = await submitTransactionRequest(type, {
      amount,
      ...(type === 'TRANSFER' ? { destinationAccountId: recipient } : {}),
      ...(type === 'TRANSFER' ? { mpin } : {}),
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
    mpinConfigured={mpinState.configured}
    mpinLoading={mpinState.loading}
    mpinError={mpinState.error}
    setupMpin={mpinState.setup}
    demo={Boolean(user.demo)}
    ledgerEntries={historyState.entries}
    transfers={historyState.transfers}
    auditEvents={historyState.events}
    historyLoading={historyState.loading}
    historyError={historyState.error}
  />
}
