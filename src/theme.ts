export type Theme = '3d' | 'classic'
const KEY = 'ledgerline-theme'

export function getTheme(): Theme {
  try { return localStorage.getItem(KEY) === 'classic' ? 'classic' : '3d' } catch { return '3d' }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try { localStorage.setItem(KEY, theme) } catch { /* storage unavailable: theme still applies for this visit */ }
}
