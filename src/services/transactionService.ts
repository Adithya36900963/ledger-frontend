import type { TransactionRequest, TransactionResult, TransactionType } from '../types/ledger'
import { request } from './http'

const route: Record<TransactionType, string> = {
  DEPOSIT: '/api/ledger/deposits',
  WITHDRAWAL: '/api/ledger/withdrawals',
  TRANSFER: '/api/ledger/transfers',
}

export const transactionService = {
  submit: (type: TransactionType, payload: TransactionRequest) => request<TransactionResult>(route[type], {
    method: 'POST', body: JSON.stringify(payload),
  }),
}
