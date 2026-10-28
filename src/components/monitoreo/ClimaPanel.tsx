import type { ComponentType } from 'react'
import type { DiaMonitoreo } from '../../types/monitoreoApi'
import { formatearNumero } from '../../utils/format'
import { IconDroplet, IconRain, IconThermometer, IconWind } from '../icons/Icons'

interface ClimaPanelProps {
  /** Pronóstico del día de hoy; null si el proveedor no lo informó. */
  dia: DiaMonitoreo | null
  proveedor: string
}

interface ClimaItemProps {
  icon: ComponentType
  label: string
  value: string
  unit: string
  caption: string
}

function ClimaItem({ icon: Icon, label, value, unit, caption }: ClimaItemProps) {
  return (
    <div className="clima-item">
      <span className="clima-item__icon">
        <Icon />
      </span>
      <div>
        <span className="clima-item__label">{label}</span>
        <strong className="clima-item__value">
          {value} <small>{unit}</small>
        </strong>
        <span className="clima-item__caption">{caption}</span>
      </div>
    </div>
  )
}

function ClimaPanel({ dia, proveedor }: ClimaPanelProps) {
  return (
    <section className="card section-card">
      <h2 className="section-card__title">Condiciones climáticas</h2>
      <p className="section-card__subtitle">
        {dia
          ? `Pronóstico para hoy en la provincia del lote · ${dia.estadoCielo.descripcion}`
          : 'No hay datos climáticos disponibles para hoy.'}
      </p>
      {dia && (
        <div className="clima-grid">
          <ClimaItem
            icon={IconThermometer}
            label="Temperatura"
            value={formatearNumero(dia.temperatura)}
            unit="°C"
            caption="Media del día"
          />
          <ClimaItem
            icon={IconRain}
            label="Precipitación"
            value={formatearNumero(dia.precipitacion)}
            unit="mm"
            caption={
              dia.probabilidadLluvia === null
                ? 'Probabilidad no informada'
                : `Probabilidad: ${formatearNumero(dia.probabilidadLluvia, 0)} %`
            }
          />
          <ClimaItem
            icon={IconDroplet}
            label="Humedad"
            value={formatearNumero(dia.humedad, 0)}
            unit="%"
            caption="Relativa, media del día"
          />
          <ClimaItem
            icon={IconWind}
            label="Viento"
            value={formatearNumero(dia.viento)}
            unit="km/h"
            caption="Máximo del día"
          />
        </div>
      )}
      <p className="monitoreo__fuente">Datos climáticos: {proveedor}</p>
    </section>
  )
}

export default ClimaPanel
