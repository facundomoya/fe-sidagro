import type { ComponentType } from 'react'

interface EmptyStateProps {
  icon: ComponentType
  title: string
  description: string
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Icon />
      </span>
      <strong className="empty-state__title">{title}</strong>
      <p className="empty-state__description">{description}</p>
    </div>
  )
}

export default EmptyState
