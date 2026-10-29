import { useEffect, useState } from 'react'
import StatusMessage from '../StatusMessage'
import ErrorConReintento from '../monitoreo/ErrorConReintento'
import type { ErrorCarga } from '../monitoreo/errores'
import { errorDeCarga } from '../gestion/errores'
import { IconPlus } from '../icons/Icons'
import { obtenerCostos } from '../../services/economicoService'
import type { CostoProduccionApi } from '../../types/economico'
import { ESTADO_COSTO, estadosDeCostos, hoyEnArgentina } from './costos'
import { textoFecha, textoUsd } from './formato'

interface CostosProduccionProps {
  /** Cambia cuando hay que volver a consultar el historial (por ejemplo, tras registrar un costo). */
  version: number
  /** Permiso COSTO_POST. */
  puedeRegistrar: boolean
  onRegistrar: () => void
}

interface Resultado {
  /** Consulta a la que corresponde. */
  clave: string
  costos: CostoProduccionApi[] | null
  error: ErrorCarga | null
}

/** Historial de costos de producción (GET /agro/economico/costos), con su estado. */
function CostosProduccion({ version, puedeRegistrar, onRegistrar }: CostosProduccionProps) {
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  // La consulta se repite al registrar un costo (version) o al reintentar (intento).
  const clave = `${version}-${intento}`

  useEffect(() => {
    const controller = new AbortController()
    obtenerCostos(controller.signal)
      .then((costos) => setResultado({ clave, costos, error: null }))
      .catch((error) => {
        if (controller.signal.aborted) return
        setResultado({ clave, costos: null, error: errorDeCarga(error, 'los costos de producción') })
      })
    return () => controller.abort()
  }, [clave])

  const vigente = resultado?.clave === clave ? resultado : null

  let contenido
  if (!vigente) {
    contenido = <StatusMessage type="loading" message="Cargando costos de producción..." />
  } else if (vigente.error || !vigente.costos) {
    contenido = (
      <ErrorConReintento
        error={vigente.error ?? { mensaje: 'No se pudieron cargar los costos.', reintentable: true }}
        onReintentar={() => setIntento((n) => n + 1)}
      />
    )
  } else if (vigente.costos.length === 0) {
    contenido = (
      <StatusMessage
        type="empty"
        message={
          puedeRegistrar
            ? 'Todavía no hay costos de producción registrados. Registrá uno para calcular los indicadores.'
            : 'Todavía no hay costos de producción registrados.'
        }
      />
    )
  } else {
    const estados = estadosDeCostos(vigente.costos, hoyEnArgentina())
    contenido = (
      <ul className="economico-costos__lista">
        {vigente.costos.map((costo) => {
          const estado = ESTADO_COSTO[estados.get(costo.id) ?? 'anterior']
          return (
            <li
              key={costo.id}
              className={`economico-costos__item economico-costos__item--${estados.get(costo.id)}`}
            >
              <div className="economico-costos__encabezado">
                <strong>{textoUsd(costo.costoPorHectarea, 'USD/ha')}</strong>
                <span className={estado.clase}>{estado.texto}</span>
              </div>
              <p className="economico-costos__vigencia">Vigencia desde el {textoFecha(costo.vigenciaDesde)}</p>
              {costo.fuente && (
                <p className="economico-costos__texto">
                  <span>Fuente:</span> {costo.fuente}
                </p>
              )}
              {costo.detalle && (
                <p className="economico-costos__texto">
                  <span>Detalle:</span> {costo.detalle}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <section className="card section-card economico-seccion" aria-labelledby="economico-costos">
      <div className="economico-costos__titulo">
        <div>
          <h2 id="economico-costos" className="section-card__title">
            Costos de producción
          </h2>
          <p className="economico-seccion__nota">
            Rige el de fecha más reciente que no sea posterior a hoy. Los de fecha posterior se aplicarán
            automáticamente desde esa fecha.
          </p>
        </div>
        {puedeRegistrar && (
          <button type="button" className="btn btn--primary" onClick={onRegistrar}>
            <IconPlus />
            Registrar costo
          </button>
        )}
      </div>
      {contenido}
    </section>
  )
}

export default CostosProduccion
