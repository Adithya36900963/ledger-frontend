import type { Account, AdminUser, AuditEvent, CreatedUser, LedgerEntry, TransactionResult } from '../types/ledger'

export const demoAccount: Account = {
  accountId: 101,
  accountHolderId: 11,
  holderName: 'Alice Morgan',
  balance: 2840.5,
}

export const demoTransactions: TransactionResult[] = [
  { transactionId: 'DEMO-TX-105', type: 'DEPOSIT', fromAccountId: null, toAccountId: 101, amount: 850, balance: 2840.5, createdAt: '2026-11-09T08:42:00Z' },
  { transactionId: 'DEMO-TX-104', type: 'TRANSFER', fromAccountId: 101, toAccountId: 202, amount: 125, balance: 1990.5, createdAt: '2026-11-08T15:18:00Z' },
  { transactionId: 'DEMO-TX-103', type: 'WITHDRAWAL', fromAccountId: 101, toAccountId: null, amount: 60, balance: 2115.5, createdAt: '2026-11-07T11:06:00Z' },
  { transactionId: 'DEMO-TX-102', type: 'DEPOSIT', fromAccountId: null, toAccountId: 101, amount: 1200, balance: 2175.5, createdAt: '2026-11-05T09:25:00Z' },
  { transactionId: 'DEMO-TX-101', type: 'TRANSFER', fromAccountId: 101, toAccountId: 202, amount: 24.5, balance: 975.5, createdAt: '2026-11-03T17:32:00Z' },
]

export const demoUsers: CreatedUser[] = [
  { success: true, message: 'User created successfully', userId: 301, accountHolderId: 301, role: 'ACCOUNT_HOLDER', displayName: 'Jordan Lee' },
  { success: true, message: 'User created successfully', userId: 302, role: 'AUDITOR', displayName: 'Sam Taylor' },
]

export const demoAdminUsers: AdminUser[] = [
  { userId: 1, name: 'Demo Admin', email: 'admin@ledgerline.demo', number: '9000000001', role: 'ADMIN', emailVerified: true, mobileVerified: true, accountHolderStatus: null, accountId: null, balance: null },
  { userId: 11, name: 'Alice Morgan', email: 'alice@ledgerline.demo', number: '9000000002', role: 'ACCOUNT_HOLDER', emailVerified: true, mobileVerified: true, accountHolderStatus: 'ACTIVE', accountId: 101, balance: 2840.5 },
  { userId: 12, name: 'Sam Taylor', email: 'sam@ledgerline.demo', number: '9000000003', role: 'AUDITOR', emailVerified: true, mobileVerified: true, accountHolderStatus: null, accountId: null, balance: null },
]

export const demoLedgerEntries: LedgerEntry[] = demoTransactions.flatMap((transaction, index) => {
  const customerEntry: LedgerEntry = {
    id: index * 2 + 1, transactionId: transaction.transactionId, accountId: 101,
    accountHolder: 'Alice Morgan',
    amount: transaction.type === 'WITHDRAWAL' || transaction.type === 'TRANSFER' ? -transaction.amount : transaction.amount,
    type: transaction.type, createdAt: transaction.createdAt,
  }
  const counterpartEntry: LedgerEntry = transaction.type === 'TRANSFER'
    ? { ...customerEntry, id: index * 2 + 2, accountId: transaction.toAccountId || 202, accountHolder: 'Bob Chen', amount: transaction.amount }
    : { ...customerEntry, id: index * 2 + 2, accountId: 999, accountHolder: 'System cash', amount: -customerEntry.amount }
  return [customerEntry, counterpartEntry]
})

export const demoAuditEvents = [
  { id: 'AUD-008', user: 'admin@ledgerline.demo', action: 'Opened new account', target: 'Jordan Lee · LL-00000301', result: 'SUCCESS', at: 'Nov 09, 2026 · 08:54 AM' },
  { id: 'AUD-007', user: 'alice@ledgerline.demo', action: 'Transfer submitted', target: '$125.00 → LL-00000202', result: 'SUCCESS', at: 'Nov 08, 2026 · 03:18 PM' },
  { id: 'AUD-006', user: 'alice@ledgerline.demo', action: 'Withdrawal attempted', target: '$4,000.00', result: 'DECLINED · insufficient funds', at: 'Nov 08, 2026 · 03:12 PM' },
  { id: 'AUD-005', user: 'admin@ledgerline.demo', action: 'Auditor created', target: 'Sam Taylor', result: 'SUCCESS', at: 'Nov 07, 2026 · 11:20 AM' },
]

export const demoAuditRecords: AuditEvent[] = [
  { id: 108, actorId: 1, actorName: 'Demo Admin', actorRole: 'ADMIN', action: 'ACCOUNT_OPENED', outcome: 'SUCCESS', details: 'accountId=301, accountHolderId=301', createdAt: '2026-11-10T08:54:00Z' },
  { id: 107, actorId: 11, actorName: 'Alice Morgan', actorRole: 'ACCOUNT_HOLDER', action: 'TRANSFER', outcome: 'POSTED', details: 'transactionId=DEMO-TX-104, fromAccountId=101, toAccountId=202, amount=125.00', createdAt: '2026-11-09T15:18:00Z' },
  { id: 106, actorId: 11, actorName: 'Alice Morgan', actorRole: 'ACCOUNT_HOLDER', action: 'WITHDRAWAL', outcome: 'FAILED', details: 'Insufficient funds for requested withdrawal', createdAt: '2026-11-09T15:12:00Z' },
  { id: 105, actorId: 1, actorName: 'Demo Admin', actorRole: 'ADMIN', action: 'USER_CREATED', outcome: 'SUCCESS', details: 'userId=302, role=AUDITOR', createdAt: '2026-11-08T11:20:00Z' },
]
