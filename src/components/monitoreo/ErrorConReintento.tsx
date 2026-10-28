import StatusMessage from '../StatusMessage'
import type { ErrorCarga } from './errores'

interface ErrorConReintentoProps {
  error: ErrorCarga
  onReintentar: () => void
}

function ErrorConReintento({ error, onReintentar }: ErrorConReintentoProps) {
  return (
    <div className="monitoreo__error">
      <StatusMessage type="error" message={error.mensaje} />
      {error.reintentable && (
        <button type="button" className="btn btn--secondary" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export default ErrorConReintento
