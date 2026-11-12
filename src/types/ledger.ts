export type UserRole = 'ADMIN' | 'ACCOUNT_HOLDER' | 'AUDITOR'
export type ManagedRole = Exclude<UserRole, 'ADMIN'>

export type AuthUser = {
  role: UserRole
  name: string
  email?: string
  demo?: boolean
  emailVerified?: boolean
  mobileVerified?: boolean
}

export type AdminUser = {
  userId: number
  name: string
  email: string
  number: string
  role: UserRole
  emailVerified: boolean
  mobileVerified: boolean
  accountHolderStatus: string | null
  accountId: number | null
  balance: number | null
}

export type AuditEvent = {
  id: number
  actorId: number | null
  actorName: string
  actorRole: string
  action: string
  outcome: string
  details: string
  createdAt: string
}

export type LedgerEntry = {
  id: number
  transactionId: string
  accountId: number
  accountHolder: string
  amount: number
  type: TransactionType
  createdAt: string
}

export type TransferHistory = {
  transactionId: string
  fromAccountId: number
  toAccountId: number
  counterpartyAccountId: number
  counterpartyName: string
  amount: number
  createdAt: string
}

export type LedgerIntegrity = {
  balanced: boolean
  ledgerTotal: number
  customerAccountCount: number
  negativeBalanceCount: number
}

export type Account = {
  accountId: number
  accountHolderId: number
  holderName: string
  balance: number
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'
export type TransactionResult = {
  transactionId: string
  type: TransactionType
  fromAccountId: number | null
  toAccountId: number | null
  amount: number
  balance: number
  createdAt: string
}

export type TransactionRequest = {
  amount: number
  destinationAccountId?: number
  mpin?: string
}

export type RegistrationRequest = {
  userName: string
  email: string
  number: string
  password: string
  role: ManagedRole
}

export type RegistrationResult = {
  success: boolean
  message: string
  userId: number
  accountHolderId?: number
  role: string
}

export type CreatedUser = RegistrationResult & { displayName: string }

export const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)

export const formatRole = (role: UserRole) => role === 'ACCOUNT_HOLDER'
  ? 'Account holder'
  : role === 'ADMIN' ? 'Administrator' : 'Auditor'

export const transactionLabel = (type: TransactionType) => type === 'DEPOSIT'
  ? 'Deposit'
  : type === 'WITHDRAWAL' ? 'Withdrawal' : 'Transfer'
