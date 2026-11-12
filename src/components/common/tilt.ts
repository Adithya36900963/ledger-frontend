import type { MouseEvent } from 'react'

/** Mouse-follow 3D tilt: sets --rx/--ry (rotation) and --mx/--my (shine position). */
export function tiltHandlers(max = 12) {
  return {
    onMouseMove(e: MouseEvent<HTMLElement>) {
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--ry', `${x * max}deg`)
      el.style.setProperty('--rx', `${-y * max}deg`)
      el.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
      el.style.setProperty('--my', `${(y + 0.5) * 100}%`)
    },
    onMouseLeave(e: MouseEvent<HTMLElement>) {
      const el = e.currentTarget
      el.style.setProperty('--ry', '0deg')
      el.style.setProperty('--rx', '0deg')
    },
  }
}
