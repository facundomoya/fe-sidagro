import EmptyState from '../EmptyState'
import { IconSparkles } from '../icons/Icons'

function RecomendacionPanel() {
  return (
    <section className="card section-card simulador-panel">
      <h2 className="simulador-panel__title">
        <IconSparkles />
        Recomendación de IA
      </h2>
      <EmptyState
        icon={IconSparkles}
        title="Sin recomendación"
        description="La recomendación se mostrará después de ejecutar una simulación, a partir de sus resultados."
      />
    </section>
  )
}

export default RecomendacionPanel
