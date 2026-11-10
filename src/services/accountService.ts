import type { Account } from '../types/ledger'
import { request } from './http'

export const accountService = {
  current: () => request<Account>('/api/ledger/accounts/me'),
  open: (accountHolderId: number) => request<Account>('/api/ledger/accounts', {
    method: 'POST', body: JSON.stringify({ accountHolderId }),
  }),
}
