import type { ComponentType } from 'react'
import type { CondicionesClimaticas } from '../../types/monitoreo'
import { formatearNumero } from '../../utils/format'
import { IconDroplet, IconRain, IconThermometer, IconWind } from '../icons/Icons'

interface ClimaPanelProps {
  clima: CondicionesClimaticas
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

function ClimaPanel({ clima }: ClimaPanelProps) {
  const max = formatearNumero(clima.temperaturaMax)
  const min = formatearNumero(clima.temperaturaMin)

  return (
    <section className="card section-card">
      <h2 className="section-card__title">Condiciones climáticas</h2>
      <p className="section-card__subtitle">Condiciones actuales del lote seleccionado.</p>
      <div className="clima-grid">
        <ClimaItem
          icon={IconThermometer}
          label="Temperatura"
          value={formatearNumero(clima.temperatura)}
          unit="°C"
          caption={`Máx: ${max} °C · Mín: ${min} °C`}
        />
        <ClimaItem
          icon={IconRain}
          label="Lluvia"
          value={formatearNumero(clima.lluvia)}
          unit="mm"
          caption="Acumulada hoy"
        />
        <ClimaItem
          icon={IconDroplet}
          label="Humedad"
          value={formatearNumero(clima.humedad, 0)}
          unit="%"
          caption="HR relativa"
        />
        <ClimaItem
          icon={IconWind}
          label="Viento"
          value={formatearNumero(clima.vientoVelocidad)}
          unit="km/h"
          caption={`Dirección: ${clima.vientoDireccion}`}
        />
      </div>
    </section>
  )
}

export default ClimaPanel
