import type { ComponentType, ReactNode } from 'react'

export type StatTone = 'default' | 'success' | 'warning' | 'danger'

interface StatCardProps {
  icon: ComponentType
  label: string
  value: ReactNode
  caption?: ReactNode
  tone?: StatTone
}

function StatCard({ icon: Icon, label, value, caption, tone = 'default' }: StatCardProps) {
  return (
    <article className={`card stat-card stat-card--${tone}`}>
      <span className="stat-card__icon">
        <Icon />
      </span>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
        {caption && <span className="stat-card__caption">{caption}</span>}
      </div>
    </article>
  )
}

export default StatCard
