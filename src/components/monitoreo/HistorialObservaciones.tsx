import { useEffect, useRef, useState } from 'react'
import StatusMessage from '../StatusMessage'
import ErrorConReintento from './ErrorConReintento'
import { describirError, type ErrorCarga } from './errores'
import { obtenerObservacionesPaginadas } from '../../services/monitoreoService'
import type { Paginado } from '../../types/api'
import type { ObservacionApi } from '../../types/monitoreoApi'
import { formatearFecha, formatearFechaHora, formatearNumero, parsearDecimal } from '../../utils/format'

const OBSERVACIONES_POR_PAGINA = 10

interface HistorialObservacionesProps {
  loteId: number
  loteNombre: string
}

/** Página pedida al backend. Cada cambio (de página o reintento) dispara una nueva consulta. */
interface Consulta {
  pagina: number
  intento: number
}

type Resultado =
  | { consulta: Consulta; pagina: Paginado<ObservacionApi>; error: null }
  | { consulta: Consulta; pagina: null; error: ErrorCarga }

function textoGdda(valor: string | null): string {
  const gdda = parsearDecimal(valor)
  return gdda === null ? 'Sin dato' : `${formatearNumero(gdda)} °C día`
}

// Se monta cada vez que se abre el modal (y con key por lote), por lo que siempre consulta
// las observaciones actuales del lote seleccionado, empezando por la página 1.
function HistorialObservaciones({ loteId, loteNombre }: HistorialObservacionesProps) {
  const [consulta, setConsulta] = useState<Consulta>({ pagina: 1, intento: 0 })
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    obtenerObservacionesPaginadas(loteId, consulta.pagina, OBSERVACIONES_POR_PAGINA, controller.signal)
      .then((pagina) => {
        // La página pedida dejó de existir (por ejemplo, se eliminaron observaciones): se
        // muestra la última página válida.
        if (pagina.data.length === 0 && pagina.totalPages > 0 && consulta.pagina > pagina.totalPages) {
          setConsulta({ pagina: pagina.totalPages, intento: 0 })
          return
        }
        setResultado({ consulta, pagina, error: null })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setResultado({
          consulta,
          pagina: null,
          error: describirError(error, 'el historial de observaciones'),
        })
      })
    return () => controller.abort()
  }, [loteId, consulta])

  // Mientras llega la página nueva se sigue mostrando la anterior, atenuada.
  const cargando = resultado?.consulta !== consulta

  function irAPagina(pagina: number) {
    setConsulta({ pagina, intento: 0 })
    // El historial se muestra dentro del modal, que es el que tiene el scroll.
    contenedorRef.current?.closest('dialog')?.scrollTo({ top: 0 })
  }

  if (!resultado || (cargando && resultado.error)) {
    return <StatusMessage type="loading" message="Cargando observaciones..." />
  }
  if (resultado.error) {
    return (
      <ErrorConReintento
        error={resultado.error}
        onReintentar={() => setConsulta((c) => ({ ...c, intento: c.intento + 1 }))}
      />
    )
  }

  const { data: observaciones, total, page, totalPages } = resultado.pagina
  if (total === 0) {
    return (
      <StatusMessage
        type="empty"
        message={`Todavía no hay observaciones registradas para ${loteNombre}.`}
      />
    )
  }

  return (
    <div className="historial" ref={contenedorRef}>
      <p className="historial__resumen">
        {loteNombre} · {total} {total === 1 ? 'observación registrada' : 'observaciones registradas'}
      </p>
      <ul
        className={`historial__lista${cargando ? ' historial__lista--cargando' : ''}`}
        aria-busy={cargando}
      >
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
      {totalPages > 1 && (
        <nav className="historial__paginacion" aria-label="Páginas del historial">
          <button
            type="button"
            className="btn btn--secondary"
            disabled={cargando || page <= 1}
            onClick={() => irAPagina(page - 1)}
          >
            Anterior
          </button>
          <span className="historial__pagina" aria-live="polite">
            {cargando ? `Cargando página ${consulta.pagina}...` : `Página ${page} de ${totalPages}`}
          </span>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={cargando || page >= totalPages}
            onClick={() => irAPagina(page + 1)}
          >
            Siguiente
          </button>
        </nav>
      )}
    </div>
  )
}

export default HistorialObservaciones
