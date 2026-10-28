import { useEffect, useState } from 'react'
import StatusMessage from '../StatusMessage'
import ErrorConReintento from './ErrorConReintento'
import { describirError, type ErrorCarga } from './errores'
import { obtenerObservaciones } from '../../services/monitoreoService'
import type { ObservacionApi } from '../../types/monitoreoApi'
import { formatearFecha, formatearFechaHora, formatearNumero, parsearDecimal } from '../../utils/format'

interface HistorialObservacionesProps {
  loteId: number
  loteNombre: string
}

interface Resultado {
  /** Intento al que corresponde el resultado. */
  intento: number
  observaciones: ObservacionApi[] | null
  error: ErrorCarga | null
}

function textoGdda(valor: string | null): string {
  const gdda = parsearDecimal(valor)
  return gdda === null ? 'Sin dato' : `${formatearNumero(gdda)} °C día`
}

// Se monta cada vez que se abre el modal (y con key por lote), por lo que siempre consulta
// las observaciones actuales del lote seleccionado.
function HistorialObservaciones({ loteId, loteNombre }: HistorialObservacionesProps) {
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    obtenerObservaciones(loteId, controller.signal)
      .then((observaciones) => setResultado({ intento, observaciones, error: null }))
      .catch((error) => {
        if (controller.signal.aborted) return
        setResultado({
          intento,
          observaciones: null,
          error: describirError(error, 'el historial de observaciones'),
        })
      })
    return () => controller.abort()
  }, [loteId, intento])

  const vigente = resultado?.intento === intento ? resultado : null

  if (!vigente) return <StatusMessage type="loading" message="Cargando observaciones..." />
  if (vigente.error) {
    return <ErrorConReintento error={vigente.error} onReintentar={() => setIntento((n) => n + 1)} />
  }

  const observaciones = vigente.observaciones ?? []
  if (observaciones.length === 0) {
    return (
      <StatusMessage
        type="empty"
        message={`Todavía no hay observaciones registradas para ${loteNombre}.`}
      />
    )
  }

  return (
    <div className="historial">
      <p className="historial__resumen">
        {loteNombre} · {observaciones.length}{' '}
        {observaciones.length === 1 ? 'observación registrada' : 'observaciones registradas'}
      </p>
      <ul className="historial__lista">
        {observaciones.map((obs) => (
          <li key={obs.id} className="historial__item">
            <div className="historial__encabezado">
              <strong>{formatearFecha(obs.fecha)}</strong>
              <span className={`badge ${obs.presencia ? 'badge--warning' : 'badge--success'}`}>
                {obs.presencia ? 'Presencia' : 'Ausencia'}
              </span>
            </div>
            <dl className="historial__datos">
              {obs.presencia && obs.densidad !== null && (
                <div>
                  <dt>Densidad</dt>
                  <dd>
                    {obs.densidad.toLocaleString('es-AR')}{' '}
                    <small>chinches / 20 golpes de paño</small>
                  </dd>
                </div>
              )}
              <div>
                <dt>Etapa estimada</dt>
                <dd>{obs.etapaEstimada ?? 'Sin dato'}</dd>
              </div>
              <div>
                <dt>GDDA acumulado</dt>
                <dd>{textoGdda(obs.gddaAcumulado)}</dd>
              </div>
            </dl>
            {obs.observaciones && <p className="historial__comentarios">{obs.observaciones}</p>}
            <p className="historial__registro">Registrada el {formatearFechaHora(obs.createdAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HistorialObservaciones
