import { useEffect, useState } from 'react'
import StatusMessage from '../StatusMessage'
import { TONO_RIESGO } from './riesgo'
import { obtenerAnalisisPorLote } from '../../services/monitoreoService'
import type { AnalisisEjecutado, Lote } from '../../types/monitoreo'
import { formatearFecha, formatearFechaHora, formatearNumero } from '../../utils/format'

interface HistorialAnalisisProps {
  lote: Lote
}

// Se monta cada vez que se abre el modal, por lo que siempre consulta los análisis actuales.
function HistorialAnalisis({ lote }: HistorialAnalisisProps) {
  const [analisis, setAnalisis] = useState<AnalisisEjecutado[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let vigente = true
    obtenerAnalisisPorLote(lote.id)
      .then((datos) => vigente && setAnalisis(datos))
      .catch(() => vigente && setError(true))
    return () => {
      vigente = false
    }
  }, [lote.id])

  if (error) {
    return <StatusMessage type="error" message="No se pudo cargar el historial de análisis." />
  }
  if (!analisis) {
    return <StatusMessage type="loading" message="Cargando análisis..." />
  }
  if (analisis.length === 0) {
    return (
      <StatusMessage
        type="empty"
        message={`Todavía no se ejecutaron análisis para ${lote.nombre}.`}
      />
    )
  }

  return (
    <div className="historial">
      <p className="historial__resumen">
        {lote.nombre} · {analisis.length}{' '}
        {analisis.length === 1 ? 'análisis ejecutado' : 'análisis ejecutados'} · Resultados
        simulados
      </p>
      <ul className="historial__lista">
        {analisis.map((a) => (
          <li key={a.id} className="historial__item">
            <div className="historial__encabezado">
              <strong>{formatearFechaHora(a.fechaEjecucion)}</strong>
              <span className={`badge badge--${TONO_RIESGO[a.indicadores.riesgo]}`}>
                Riesgo {a.indicadores.riesgo}
              </span>
            </div>
            <dl className="historial__datos">
              <div>
                <dt>GDD</dt>
                <dd>{formatearNumero(a.indicadores.gdd)}</dd>
              </div>
              <div>
                <dt>GDDA</dt>
                <dd>{formatearNumero(a.indicadores.gdda)}</dd>
              </div>
              <div>
                <dt>Etapa fenológica</dt>
                <dd>{a.indicadores.etapaFenologica}</dd>
              </div>
              <div>
                <dt>Próximo monitoreo</dt>
                <dd>{formatearFecha(a.proximoMonitoreo)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HistorialAnalisis
