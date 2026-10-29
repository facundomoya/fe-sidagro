import { useNavigate } from 'react-router-dom'
import { RUTAS, type EstadoCompletarDatos } from '../../config/navigation'
import type { LoteEconomicoApi } from '../../types/economico'
import {
  presentacionResultado,
  signoDe,
  textoFaltantes,
  textoHectareas,
  textoPorcentaje,
  textoRendimiento,
  textoToneladas,
  textoUsd,
} from './formato'

interface DetalleLoteEconomicoProps {
  item: LoteEconomicoApi
  /** Permisos para completar datos productivos en «Lotes y campañas» (LOTE_PUT). */
  puedeCompletarDatos: boolean
  onClose: () => void
}

/** Detalle de un lote con los indicadores ya recibidos en el dashboard (no vuelve a consultar). */
function DetalleLoteEconomico({ item, puedeCompletarDatos, onClose }: DetalleLoteEconomicoProps) {
  const { lote, indicadores, faltantes } = item
  const navigate = useNavigate()

  // El formulario de datos productivos está en «Lotes y campañas»; al volver, el Dashboard
  // se vuelve a montar y consulta los resultados nuevos.
  function irACompletarDatos() {
    const estado: EstadoCompletarDatos = { completarDatosLoteId: lote.id }
    navigate(RUTAS.lotesCampanias, { state: estado })
  }
  const resultado = indicadores ? presentacionResultado(indicadores.resultado) : null

  return (
    <div className="economico-detalle-lote">
      <dl className="economico-detalle-lote__datos">
        <div>
          <dt>Campaña</dt>
          <dd>{lote.campania ?? 'Sin dato'}</dd>
        </div>
        <div>
          <dt>Provincia</dt>
          <dd>{lote.provincia ?? 'Sin dato'}</dd>
        </div>
        <div>
          <dt>Superficie</dt>
          <dd>{textoHectareas(lote.superficie)}</dd>
        </div>
        <div>
          <dt>Rendimiento esperado</dt>
          <dd>{textoRendimiento(lote.rendimiento)}</dd>
        </div>
      </dl>

      {indicadores && resultado ? (
        <>
          <p className="economico-detalle-lote__resultado">
            Resultado económico:{' '}
            <span className={resultado.clase}>
              <span aria-hidden="true">{resultado.simbolo} </span>
              {resultado.texto}
            </span>
          </p>

          <h3 className="economico-detalle-lote__subtitulo">Por hectárea</h3>
          <dl className="economico-detalle-lote__indicadores">
            <div>
              <dt>Ingreso</dt>
              <dd>{textoUsd(indicadores.ingresoPorHectarea, 'USD/ha')}</dd>
            </div>
            <div>
              <dt>Costo</dt>
              <dd>{textoUsd(indicadores.costoPorHectarea, 'USD/ha')}</dd>
            </div>
            <div>
              <dt>{indicadores.gananciaPorHectarea < 0 ? 'Pérdida' : 'Ganancia'}</dt>
              <dd className={`economico-importe economico-importe--${signoDe(indicadores.gananciaPorHectarea)}`}>
                {textoUsd(indicadores.gananciaPorHectarea, 'USD/ha')}
              </dd>
            </div>
          </dl>

          <h3 className="economico-detalle-lote__subtitulo">Total del lote</h3>
          <dl className="economico-detalle-lote__indicadores">
            <div>
              <dt>Producción estimada</dt>
              <dd>{textoToneladas(indicadores.produccionEstimada)}</dd>
            </div>
            <div>
              <dt>Ingreso</dt>
              <dd>{textoUsd(indicadores.ingresoTotal)}</dd>
            </div>
            <div>
              <dt>Costo</dt>
              <dd>{textoUsd(indicadores.costoTotal)}</dd>
            </div>
            <div>
              <dt>{indicadores.gananciaTotal < 0 ? 'Pérdida' : 'Ganancia'}</dt>
              <dd className={`economico-importe economico-importe--${signoDe(indicadores.gananciaTotal)}`}>
                {textoUsd(indicadores.gananciaTotal)}
              </dd>
            </div>
            <div>
              <dt>Rentabilidad</dt>
              <dd className={`economico-importe economico-importe--${signoDe(indicadores.rentabilidad)}`}>
                {textoPorcentaje(indicadores.rentabilidad)}
              </dd>
            </div>
          </dl>
          <p className="economico-seccion__nota">
            Estimación con el precio de la soja y el costo de producción vigentes.
          </p>
        </>
      ) : (
        <div className="economico-detalle-lote__incompleto" role="note">
          <strong>⚠ Datos incompletos</strong>
          <p>
            Falta cargar: {textoFaltantes(faltantes)}. Sin esos datos no se pueden calcular los
            indicadores económicos de este lote y no se incluye en los totales del dashboard.
          </p>
          {!puedeCompletarDatos && (
            <p>Pedile a un usuario con permiso para modificar lotes que complete esos datos.</p>
          )}
        </div>
      )}

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Cerrar
        </button>
        {!indicadores && puedeCompletarDatos && (
          <button type="button" className="btn btn--primary" onClick={irACompletarDatos}>
            Completar datos en Lotes y campañas
          </button>
        )}
      </div>
    </div>
  )
}

export default DetalleLoteEconomico
