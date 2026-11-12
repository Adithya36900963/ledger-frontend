import type { AuditEvent, LedgerEntry, TransferHistory } from '../types/ledger'
import { request } from './http'

export const ledgerService = {
  myEntries: () => request<LedgerEntry[]>('/api/ledger/entries/me'),
  myAuditEvents: () => request<AuditEvent[]>('/api/ledger/audit-events/me'),
  myTransfers: () => request<TransferHistory[]>('/api/ledger/transfers/me'),
}
