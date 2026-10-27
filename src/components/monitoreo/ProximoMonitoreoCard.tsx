import { formatearFechaLarga } from '../../utils/format'
import { IconCalendar } from '../icons/Icons'

interface ProximoMonitoreoCardProps {
  fecha: string
}

function ProximoMonitoreoCard({ fecha }: ProximoMonitoreoCardProps) {
  return (
    <section className="card proximo-monitoreo">
      <span className="proximo-monitoreo__icon">
        <IconCalendar />
      </span>
      <div>
        <span className="proximo-monitoreo__label">Próximo monitoreo recomendado</span>
        <strong className="proximo-monitoreo__fecha">{formatearFechaLarga(fecha)}</strong>
        <span className="proximo-monitoreo__caption">
          Fecha informada por el servicio de monitoreo.
        </span>
      </div>
    </section>
  )
}

export default ProximoMonitoreoCard
