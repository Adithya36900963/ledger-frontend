import { request } from './http'

export const mpinService = {
  status: () => request<{ configured: boolean }>('/api/users/auth/mpin/status'),
  setup: (mpin: string) => request<{ message: string }>('/api/users/auth/mpin', {
    method: 'PUT', body: JSON.stringify({ mpin }),
  }),
}
