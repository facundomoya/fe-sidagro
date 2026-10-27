import { useEffect, useState } from 'react'
import StatusMessage from '../StatusMessage'
import { obtenerObservacionesPorLote } from '../../services/monitoreoService'
import type { Lote, ObservacionCampo } from '../../types/monitoreo'
import { formatearFecha } from '../../utils/format'

interface HistorialObservacionesProps {
  lote: Lote
}

// Se monta cada vez que se abre el modal, por lo que siempre consulta las observaciones actuales.
function HistorialObservaciones({ lote }: HistorialObservacionesProps) {
  const [observaciones, setObservaciones] = useState<ObservacionCampo[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let vigente = true
    obtenerObservacionesPorLote(lote.id)
      .then((datos) => vigente && setObservaciones(datos))
      .catch(() => vigente && setError(true))
    return () => {
      vigente = false
    }
  }, [lote.id])

  if (error) {
    return <StatusMessage type="error" message="No se pudo cargar el historial de observaciones." />
  }
  if (!observaciones) {
    return <StatusMessage type="loading" message="Cargando observaciones..." />
  }
  if (observaciones.length === 0) {
    return (
      <StatusMessage
        type="empty"
        message={`Todavía no existen observaciones registradas para ${lote.nombre}.`}
      />
    )
  }

  return (
    <div className="historial">
      <p className="historial__resumen">
        {lote.nombre} · {observaciones.length}{' '}
        {observaciones.length === 1 ? 'observación registrada' : 'observaciones registradas'}
      </p>
      <ul className="historial__lista">
        {observaciones.map((obs) => (
          <li key={obs.id} className="historial__item">
            <div className="historial__encabezado">
              <strong>{formatearFecha(obs.fecha)}</strong>
              <span
                className={`badge ${obs.presenciaChinche ? 'badge--warning' : 'badge--success'}`}
              >
                {obs.presenciaChinche ? 'Presencia' : 'Ausencia'}
              </span>
            </div>
            {(obs.cantidadObservada !== null || obs.etapaFenologica) && (
              <dl className="historial__datos">
                {obs.cantidadObservada !== null && (
                  <div>
                    <dt>Cantidad</dt>
                    <dd>{obs.cantidadObservada.toLocaleString('es-AR')}</dd>
                  </div>
                )}
                {obs.etapaFenologica && (
                  <div>
                    <dt>Etapa fenológica</dt>
                    <dd>{obs.etapaFenologica}</dd>
                  </div>
                )}
              </dl>
            )}
            {obs.comentarios && <p className="historial__comentarios">{obs.comentarios}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HistorialObservaciones
