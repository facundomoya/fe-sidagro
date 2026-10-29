import EmptyState from '../EmptyState'
import StatusMessage from '../StatusMessage'
import { IconAlert, IconClipboard, IconRefresh } from '../icons/Icons'
import type { RecomendacionApi, SimulacionApi } from '../../types/simulacionApi'
import ProcesandoSimulacion from './ProcesandoSimulacion'

interface RecomendacionPanelProps {
  simulacion: SimulacionApi | null
  creando: boolean
  reintentando: boolean
  /** Error del último reintento. */
  errorReintento: string | null
  onReintentar: () => void
}

function RecomendacionPanel({
  simulacion,
  creando,
  reintentando,
  errorReintento,
  onReintentar,
}: RecomendacionPanelProps) {
  let contenido
  if (creando) {
    contenido = <StatusMessage type="loading" message="Esperando la recomendación..." />
  } else if (reintentando) {
    contenido = <ProcesandoSimulacion titulo="Reintentando la recomendación..." />
  } else if (!simulacion) {
    contenido = (
      <EmptyState
        icon={IconClipboard}
        title="Sin recomendación"
        description="La recomendación se mostrará después de ejecutar una simulación, a partir de sus resultados."
      />
    )
  } else if (!simulacion.recomendacion) {
    contenido = (
      <div className="recomendacion-fallida">
        <div className="recomendacion-fallida__mensaje">
          <IconAlert />
          <div>
            <strong>No se pudo generar la recomendación</strong>
            <p>
              El escenario quedó guardado como simulación N.º {simulacion.id}. Podés volver a
              solicitar la recomendación sin cargar los datos de nuevo.
            </p>
          </div>
        </div>
        {errorReintento && <StatusMessage type="error" message={errorReintento} />}
        <button type="button" className="btn btn--primary" onClick={onReintentar}>
          <IconRefresh />
          Reintentar recomendación
        </button>
      </div>
    )
  } else {
    contenido = <DetalleRecomendacion recomendacion={simulacion.recomendacion} />
  }

  return (
    <section className="card section-card simulador-panel" aria-busy={creando || reintentando}>
      <h2 className="simulador-panel__title">
        <IconClipboard />
        Recomendación agronómica
      </h2>
      {contenido}
    </section>
  )
}

/** Muestra solo la recomendación principal, con el texto exacto que devuelve el backend. */
function DetalleRecomendacion({ recomendacion }: { recomendacion: RecomendacionApi }) {
  return (
    <div className="recomendacion__principal">
      <h3>Recomendación principal</h3>
      <p>{recomendacion.recomendacionPrincipal}</p>
    </div>
  )
}

export default RecomendacionPanel
