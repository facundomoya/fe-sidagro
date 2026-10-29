import StatCard, { type StatTone } from '../StatCard'
import { IconDollar, IconGauge, IconTrend } from '../icons/Icons'
import type { TotalesEconomicosApi } from '../../types/economico'
import { signoDe, textoHectareas, textoPorcentaje, textoToneladas, textoUsd, type Signo } from './formato'

interface ResultadosGeneralesProps {
  totales: TotalesEconomicosApi
}

const TONO: Record<Signo, StatTone> = { positivo: 'success', negativo: 'danger', neutro: 'default' }
const SIMBOLO: Record<Signo, string> = { positivo: '▲ ', negativo: '▼ ', neutro: '' }

function ResultadosGenerales({ totales }: ResultadosGeneralesProps) {
  const signoGanancia = signoDe(totales.gananciaTotal)
  const signoRentabilidad = totales.rentabilidad === null ? 'neutro' : signoDe(totales.rentabilidad)
  const sinCalculados = totales.lotesCalculados === 0

  return (
    <section className="economico-seccion" aria-labelledby="economico-resultados">
      <h2 id="economico-resultados" className="economico-seccion__titulo">
        Resultados económicos estimados
      </h2>
      <p className="economico-seccion__nota">
        Estimaciones calculadas con el precio y el costo vigentes; no son resultados históricos
        definitivos. Solo incluyen los lotes con superficie y rendimiento cargados.
      </p>
      <div className="stat-grid">
        <StatCard icon={IconDollar} label="Ingreso total estimado" value={textoUsd(totales.ingresoTotal)} />
        <StatCard icon={IconGauge} label="Costo total estimado" value={textoUsd(totales.costoTotal)} />
        <StatCard
          icon={IconTrend}
          label={signoGanancia === 'negativo' ? 'Pérdida total estimada' : 'Ganancia total estimada'}
          value={`${SIMBOLO[signoGanancia]}${textoUsd(totales.gananciaTotal)}`}
          tone={sinCalculados ? 'default' : TONO[signoGanancia]}
          caption={sinCalculados ? 'Sin lotes calculados' : undefined}
        />
        <StatCard
          icon={IconTrend}
          label="Rentabilidad estimada"
          value={
            totales.rentabilidad === null
              ? 'Sin datos'
              : `${SIMBOLO[signoRentabilidad]}${textoPorcentaje(totales.rentabilidad)}`
          }
          tone={TONO[signoRentabilidad]}
          caption="Ganancia sobre el costo total"
        />
      </div>

      <dl className="card economico-resumen">
        <div>
          <dt>Lotes calculados</dt>
          <dd>{totales.lotesCalculados}</dd>
        </div>
        <div>
          <dt>Lotes incompletos</dt>
          <dd>{totales.lotesIncompletos}</dd>
        </div>
        <div>
          <dt>Lotes con ganancia</dt>
          <dd>{totales.lotesConGanancia}</dd>
        </div>
        <div>
          <dt>Lotes con pérdida</dt>
          <dd>{totales.lotesConPerdida}</dd>
        </div>
        <div>
          <dt>Superficie considerada</dt>
          <dd>{textoHectareas(totales.superficie)}</dd>
        </div>
        <div>
          <dt>Producción estimada</dt>
          <dd>{textoToneladas(totales.produccionEstimada)}</dd>
        </div>
      </dl>
    </section>
  )
}

export default ResultadosGenerales
