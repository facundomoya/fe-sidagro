import { useState } from 'react'
import StatusMessage from '../StatusMessage'
import ErrorConReintento from '../monitoreo/ErrorConReintento'
import type { ErrorCarga } from '../monitoreo/errores'
import { tonoRiesgo } from '../monitoreo/riesgo'
import { IconHistory, IconRefresh } from '../icons/Icons'
import type { SimulacionResumenApi } from '../../types/simulacionApi'
import { formatearFechaHora } from '../../utils/format'
import { lotesDelHistorial } from './historial'
import { ESTADO_SIMULACION, claseBadge } from './presentacion'

interface HistorialSimulacionesProps {
  /** Ordenadas de la más reciente a la más antigua; null mientras se cargan. */
  simulaciones: SimulacionResumenApi[] | null
  error: ErrorCarga | null
  /** Simulación que se muestra en los paneles de resultado. */
  seleccionadaId: number | null
  /** Simulación cuyo detalle se está consultando. */
  consultandoId: number | null
  errorConsulta: string | null
  /** Hay una simulación o un reintento en curso: no se puede cambiar la selección. */
  bloqueado: boolean
  onSeleccionar: (id: number) => void
  onRecargar: () => void
}

const TODOS = ''

function HistorialSimulaciones({
  simulaciones,
  error,
  seleccionadaId,
  consultandoId,
  errorConsulta,
  bloqueado,
  onSeleccionar,
  onRecargar,
}: HistorialSimulacionesProps) {
  const [loteFiltro, setLoteFiltro] = useState(TODOS)

  let contenido
  if (error) {
    contenido = <ErrorConReintento error={error} onReintentar={onRecargar} />
  } else if (!simulaciones) {
    contenido = <StatusMessage type="loading" message="Cargando simulaciones guardadas..." />
  } else if (simulaciones.length === 0) {
    contenido = (
      <StatusMessage
        type="empty"
        message="Todavía no hay simulaciones guardadas. Las que ejecutes aparecerán aquí."
      />
    )
  } else {
    const lotes = lotesDelHistorial(simulaciones)
    const visibles =
      loteFiltro === TODOS
        ? simulaciones
        : simulaciones.filter((s) => String(s.lote.id) === loteFiltro)

    contenido = (
      <>
        <div className="historial-sim__barra">
          <label className="form-field historial-sim__filtro">
            <span className="form-field__label">Lote</span>
            <select value={loteFiltro} onChange={(e) => setLoteFiltro(e.target.value)}>
              <option value={TODOS}>Todos los lotes</option>
              {lotes.map((lote) => (
                <option key={lote.id} value={lote.id}>
                  {lote.nombre}
                </option>
              ))}
            </select>
          </label>
          <p className="historial-sim__resumen" aria-live="polite">
            {visibles.length} {visibles.length === 1 ? 'simulación' : 'simulaciones'}
          </p>
        </div>

        {errorConsulta && <StatusMessage type="error" message={errorConsulta} />}

        {visibles.length === 0 ? (
          <StatusMessage type="empty" message="No hay simulaciones guardadas para este lote." />
        ) : (
          <>
            <div className="historial-sim__encabezado" aria-hidden="true">
              <span>N.º</span>
              <span>Fecha</span>
              <span>Lote</span>
              <span>Etapa fenológica</span>
              <span>Riesgo observado</span>
              <span>Estado</span>
            </div>
            <ul className="historial-sim__lista">
              {visibles.map((simulacion) => (
                <FilaSimulacion
                  key={simulacion.id}
                  simulacion={simulacion}
                  seleccionada={simulacion.id === seleccionadaId}
                  consultando={simulacion.id === consultandoId}
                  bloqueado={bloqueado}
                  onSeleccionar={onSeleccionar}
                />
              ))}
            </ul>
          </>
        )}
      </>
    )
  }

  return (
    <section className="card section-card simulador-panel historial-sim">
      <div className="historial-sim__titulo">
        <h2 className="simulador-panel__title">
          <IconHistory />
          Simulaciones guardadas
        </h2>
        {simulaciones && (
          <button type="button" className="btn btn--secondary" onClick={onRecargar}>
            <IconRefresh />
            Actualizar
          </button>
        )}
      </div>
      {contenido}
    </section>
  )
}

interface FilaSimulacionProps {
  simulacion: SimulacionResumenApi
  seleccionada: boolean
  consultando: boolean
  bloqueado: boolean
  onSeleccionar: (id: number) => void
}

function FilaSimulacion({
  simulacion,
  seleccionada,
  consultando,
  bloqueado,
  onSeleccionar,
}: FilaSimulacionProps) {
  const estado = ESTADO_SIMULACION[simulacion.estado] ?? { texto: simulacion.estado, tono: 'default' }

  return (
    <li>
      <button
        type="button"
        className="historial-sim__fila"
        aria-current={seleccionada ? 'true' : undefined}
        aria-busy={consultando}
        disabled={bloqueado}
        onClick={() => onSeleccionar(simulacion.id)}
      >
        <span className="historial-sim__celda historial-sim__celda--numero">
          <span className="historial-sim__etiqueta">Simulación </span>N.º {simulacion.id}
        </span>
        <span className="historial-sim__celda historial-sim__celda--fecha">
          <span className="historial-sim__etiqueta">Fecha: </span>
          {formatearFechaHora(simulacion.createdAt)}
        </span>
        <span className="historial-sim__celda historial-sim__celda--lote">
          <span className="historial-sim__etiqueta">Lote: </span>
          {simulacion.lote.nombre}
        </span>
        <span className="historial-sim__celda historial-sim__celda--etapa">
          <span className="historial-sim__etiqueta">Etapa: </span>
          {simulacion.etapa.nombre}
        </span>
        <span className="historial-sim__celda historial-sim__celda--riesgo">
          <span className="historial-sim__etiqueta">Riesgo observado: </span>
          <span className={claseBadge(tonoRiesgo(simulacion.riesgoPlaga))}>
            {simulacion.riesgoPlaga}
          </span>
        </span>
        <span className="historial-sim__celda historial-sim__celda--estado">
          <span className="historial-sim__etiqueta">Estado: </span>
          {consultando ? (
            <span className="historial-sim__cargando">
              <span className="historial-sim__spinner" aria-hidden="true" />
              Cargando...
            </span>
          ) : (
            <span className={claseBadge(estado.tono)}>{estado.texto}</span>
          )}
        </span>
      </button>
    </li>
  )
}

export default HistorialSimulaciones
