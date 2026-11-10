import type { PropsWithChildren } from 'react'

export function Panel({ children, className = '', id }: PropsWithChildren<{ className?: string; id?: string }>) {
  return <section className={`panel ${className}`} id={id}>{children}</section>
}
