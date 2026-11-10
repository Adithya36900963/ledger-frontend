type FeedbackProps = { kind: 'error' | 'success'; children: string }

export function Feedback({ kind, children }: FeedbackProps) {
  return <div className={kind === 'error' ? 'inline-error' : 'inline-success'} role={kind === 'error' ? 'alert' : 'status'}>
    {kind === 'success' && '✓ '}{children}
  </div>
}
