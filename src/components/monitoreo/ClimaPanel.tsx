import type { ComponentType } from 'react'
import type { DiaMonitoreo, UbicacionClima } from '../../types/monitoreoApi'
import { formatearNumero } from '../../utils/format'
import { IconDroplet, IconRain, IconThermometer, IconWind } from '../icons/Icons'

interface ClimaPanelProps {
  /** Pronóstico del día de hoy; null si el proveedor no lo informó. */
  dia: DiaMonitoreo | null
  proveedor: string
  /** Dónde pidió el clima el backend; puede faltar en versiones anteriores del backend. */
  ubicacion?: UbicacionClima
}

/** Texto de la ubicación que informa el backend, sin deducirla en el frontend. */
function textoUbicacion(ubicacion: UbicacionClima | undefined): string {
  if (!ubicacion) return 'Clima de la ubicación del lote'
  if (ubicacion.origen === 'DEPARTAMENTO') return `Clima del departamento ${ubicacion.nombre}`
  // El backend informa "Capital de <provincia>".
  const nombre = ubicacion.nombre.toLowerCase().startsWith('capital ')
    ? `la ${ubicacion.nombre.charAt(0).toLowerCase()}${ubicacion.nombre.slice(1)}`
    : ubicacion.nombre
  return `Clima de ${nombre} (el lote no tiene departamento)`
}

function textoCoordenadas(ubicacion: UbicacionClima): string {
  return `${formatearNumero(ubicacion.latitud, 4)}, ${formatearNumero(ubicacion.longitud, 4)}`
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

function ClimaPanel({ dia, proveedor, ubicacion }: ClimaPanelProps) {
  return (
    <section className="card section-card">
      <h2 className="section-card__title">Condiciones climáticas</h2>
      <p className="section-card__subtitle">
        {textoUbicacion(ubicacion)} ·{' '}
        {dia
          ? `Pronóstico para hoy: ${dia.estadoCielo.descripcion}`
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
      <p className="monitoreo__fuente">
        Datos climáticos: {proveedor}
        {ubicacion && ` · Coordenadas: ${textoCoordenadas(ubicacion)}`}
      </p>
    </section>
  )
}

export default ClimaPanel
