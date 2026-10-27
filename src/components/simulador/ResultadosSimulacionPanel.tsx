import EmptyState from '../EmptyState'
import { IconGauge } from '../icons/Icons'

function ResultadosSimulacionPanel() {
  return (
    <section className="card section-card simulador-panel">
      <h2 className="simulador-panel__title">
        <IconGauge />
        Resultados de la simulación
      </h2>
      <EmptyState
        icon={IconGauge}
        title="Todavía no hay resultados"
        description="Configurá el escenario y ejecutá la simulación para ver el nivel de riesgo estimado de chinche verde para la fecha elegida."
      />
    </section>
  )
}

export default ResultadosSimulacionPanel
