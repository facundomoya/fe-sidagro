interface StatusMessageProps {
  type: 'loading' | 'error' | 'empty' | 'success'
  message: string
}

function StatusMessage({ type, message }: StatusMessageProps) {
  return (
    <div
      className={`status-message status-message--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {type === 'loading' && <span className="status-message__spinner" aria-hidden="true" />}
      {message}
    </div>
  )
}

export default StatusMessage
