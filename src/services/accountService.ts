import type { Account, RecipientAccount } from '../types/ledger'
import { request } from './http'

export const accountService = {
  current: () => request<Account>('/api/ledger/accounts/me'),
  recipient: (accountId: number) => request<RecipientAccount>(`/api/ledger/accounts/${accountId}/recipient`),
  open: (accountHolderId: number) => request<Account>('/api/ledger/accounts', {
    method: 'POST', body: JSON.stringify({ accountHolderId }),
  }),
}
