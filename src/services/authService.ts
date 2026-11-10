import type { AuthUser, ManagedRole, RegistrationRequest, RegistrationResult, UserRole } from '../types/ledger'
import { request } from './http'

type LoginResponse = { success: boolean; role: UserRole; name: string; email: string; message: string; isEmailVerified: boolean; isNumberVerified: boolean }

const loginRoute: Record<UserRole, string> = {
  ADMIN: 'admin/login',
  ACCOUNT_HOLDER: 'ACCOUNT_HOLDER/login',
  AUDITOR: 'auditor/login',
}

export const authService = {
  async login(role: UserRole, login: string, password: string): Promise<AuthUser> {
    const result = await request<LoginResponse>(`/api/users/auth/${loginRoute[role]}`, {
      method: 'POST', body: JSON.stringify({ login, password }),
    })
    if (!result.success) throw new Error(result.message || 'Sign in failed.')
    return { role: result.role, name: result.name, email: result.email,
      emailVerified: result.isEmailVerified, mobileVerified: result.isNumberVerified }
  },

  current: () => request<{ userId: number; name: string; email: string; role: UserRole; isEmailVerified: boolean; isNumberVerified: boolean }>('/api/users/auth/me'),

  requestEmailVerification: () => request<{ success: boolean; message: string; isEmailVerified: boolean }>('/api/users/auth/email', { method: 'POST' }),
  requestMobileVerification: () => request<{ success: boolean; message: string; isNumberVerified: boolean }>('/api/users/auth/mobile', { method: 'POST' }),

  logout: () => request<{ success: boolean; message: string }>('/api/users/auth/logout', { method: 'POST' }),

  createUser: (payload: RegistrationRequest) => request<RegistrationResult>('/api/users/auth/register', {
    method: 'POST', body: JSON.stringify(payload),
  }),
}

export const authStorage = {
  read(): AuthUser | null {
    try { return JSON.parse(sessionStorage.getItem('ledgerline_user') || 'null') as AuthUser | null }
    catch { return null }
  },
  write(user: AuthUser) { sessionStorage.setItem('ledgerline_user', JSON.stringify(user)) },
  clear() { sessionStorage.removeItem('ledgerline_user') },
}

export type { ManagedRole }
