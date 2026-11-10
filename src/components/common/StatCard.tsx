type StatCardProps = { label: string; value: string; detail: string; icon: string; tone?: 'green' | 'purple' }

export function StatCard({ label, value, detail, icon, tone = 'green' }: StatCardProps) {
  return <article className="summary-card">
    <div className="summary-title"><span className={`summary-icon ${tone}`}>{icon}</span><span>{label}</span></div>
    <div className="summary-value">{value}</div>
    <div className="summary-foot">{detail}</div>
  </article>
}
