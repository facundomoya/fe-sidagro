import { formatearFechaLarga } from '../../utils/format'
import { IconCalendar } from '../icons/Icons'

interface ProximoMonitoreoCardProps {
  fecha: string
  /** Explicación de la fecha informada por el servicio de monitoreo. */
  motivo?: string
}

function ProximoMonitoreoCard({ fecha, motivo }: ProximoMonitoreoCardProps) {
  return (
    <section className="card proximo-monitoreo">
      <span className="proximo-monitoreo__icon">
        <IconCalendar />
      </span>
      <div>
        <span className="proximo-monitoreo__label">Próximo monitoreo sugerido</span>
        <strong className="proximo-monitoreo__fecha">{formatearFechaLarga(fecha)}</strong>
        <span className="proximo-monitoreo__caption">
          {motivo ?? 'Fecha informada por el servicio de monitoreo.'}
        </span>
      </div>
    </section>
  )
}

export default ProximoMonitoreoCard
