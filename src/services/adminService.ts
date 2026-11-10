import type { AdminUser, AuditEvent, LedgerEntry, LedgerIntegrity } from '../types/ledger'
import { request } from './http'

export const adminService = {
  users: () => request<AdminUser[]>('/api/admin/users'),
  auditEvents: () => request<AuditEvent[]>('/api/audit/events'),
  ledgerEntries: () => request<LedgerEntry[]>('/api/audit/ledger-entries'),
  integrity: () => request<LedgerIntegrity>('/api/audit/integrity'),
}
