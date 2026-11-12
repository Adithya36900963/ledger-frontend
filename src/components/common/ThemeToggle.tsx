import type { Theme } from '../../theme'

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return <button type="button" className="theme-toggle" onClick={onToggle} title="Switch between the original single page and the new 3D button layout">
    {theme === '3d' ? '◐ Original view' : '◈ New 3D view'}
  </button>
}
