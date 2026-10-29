import EmptyState from '../EmptyState'
import { IconGauge } from '../icons/Icons'
import { tonoRiesgo } from '../monitoreo/riesgo'
import type { SimulacionApi } from '../../types/simulacionApi'
import { formatearFecha, formatearFechaHora } from '../../utils/format'
import ProcesandoSimulacion from './ProcesandoSimulacion'
import {
  ESTADO_SIMULACION,
  TEXTO_CONFIANZA,
  TEXTO_PRIORIDAD,
  TONO_PRIORIDAD,
  claseBadge,
  formatearDecimal,
} from './presentacion'

interface ResultadosSimulacionPanelProps {
  simulacion: SimulacionApi | null
  /** Se está creando una simulación nueva. */
  creando: boolean
}

function ResultadosSimulacionPanel({ simulacion, creando }: ResultadosSimulacionPanelProps) {
  return (
    <section className="card section-card simulador-panel" aria-busy={creando}>
      <h2 className="simulador-panel__title">
        <IconGauge />
        Resultados de la simulación
      </h2>
      {creando ? (
        <ProcesandoSimulacion titulo="Ejecutando la simulación..." />
      ) : simulacion ? (
        <DetalleSimulacion simulacion={simulacion} />
      ) : (
        <EmptyState
          icon={IconGauge}
          title="Todavía no hay resultados"
          description="Configurá el escenario y ejecutá la simulación para ver su resultado."
        />
      )}
    </section>
  )
}

function DetalleSimulacion({ simulacion }: { simulacion: SimulacionApi }) {
  const { lote, etapa, recomendacion } = simulacion
  const estado = ESTADO_SIMULACION[simulacion.estado] ?? { texto: simulacion.estado, tono: 'default' }

  return (
    <div className="resultado">
      <div className="resultado__encabezado">
        <span className={claseBadge(estado.tono)}>{estado.texto}</span>
        <span className="resultado__meta">
          Simulación N.º {simulacion.id} · {formatearFechaHora(simulacion.createdAt)}
        </span>
      </div>

      {recomendacion && (
        <dl className="resultado__indicadores">
          <div>
            <dt>Nivel de riesgo</dt>
            <dd>
              <span className={claseBadge(tonoRiesgo(recomendacion.nivelRiesgo))}>
                {recomendacion.nivelRiesgo}
              </span>
            </dd>
          </div>
          <div>
            <dt>Prioridad</dt>
            <dd>
              <span className={claseBadge(TONO_PRIORIDAD[recomendacion.prioridad])}>
                {TEXTO_PRIORIDAD[recomendacion.prioridad] ?? recomendacion.prioridad}
              </span>
            </dd>
          </div>
          <div>
            <dt>Confianza</dt>
            <dd>
              <span className={claseBadge(undefined)}>
                {TEXTO_CONFIANZA[recomendacion.nivelConfianza] ?? recomendacion.nivelConfianza}
              </span>
            </dd>
          </div>
        </dl>
      )}

      <dl className="simulador-datos resultado__escenario">
        <div>
          <dt>Lote</dt>
          <dd>
            {lote.nombre} <small>· {lote.provincia.nombre} · {lote.campania.nombre}</small>
          </dd>
        </div>
        <div>
          <dt>Etapa fenológica</dt>
          <dd>{etapa.nombre}</dd>
        </div>
        <div>
          <dt>Riesgo observado</dt>
          <dd>{simulacion.riesgoPlaga}</dd>
        </div>
        <div>
          <dt>Riesgo base de la etapa</dt>
          <dd>{simulacion.riesgoEtapaUtilizado}</dd>
        </div>
        <div>
          <dt>GDDA de la etapa</dt>
          <dd>
            {formatearDecimal(simulacion.gddaMinimoUtilizado, 0)} a{' '}
            {formatearDecimal(simulacion.gddaMaximoUtilizado, 0)} °C día
          </dd>
        </div>
        {simulacion.observaciones && (
          <div className="resultado__observaciones">
            <dt>Observaciones</dt>
            <dd>{simulacion.observaciones}</dd>
          </div>
        )}
      </dl>

      <div className="resultado__clima">
        <table>
          <caption>Clima del escenario</caption>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Temp. media (°C)</th>
              <th scope="col">Precip. (mm)</th>
              <th scope="col">Humedad (%)</th>
              <th scope="col">Viento (km/h)</th>
            </tr>
          </thead>
          <tbody>
            {simulacion.datosClimaticos.map((dia) => (
              <tr key={dia.id}>
                <th scope="row">{formatearFecha(dia.fecha)}</th>
                <td>{formatearDecimal(dia.temperatura)}</td>
                <td>{formatearDecimal(dia.precipitacion)}</td>
                <td>{formatearDecimal(dia.humedad)}</td>
                <td>{formatearDecimal(dia.viento)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResultadosSimulacionPanel
