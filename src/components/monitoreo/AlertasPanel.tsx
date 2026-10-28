import type { ComponentType } from 'react'
import type { Alerta, NivelAlerta } from '../../types/monitoreoApi'
import { IconAlert, IconInfo } from '../icons/Icons'

interface AlertasPanelProps {
  /** Alertas tal como las devuelve el backend, en su mismo orden. */
  alertas: Alerta[]
}

interface EstiloNivel {
  clase: string
  etiqueta: string
  icono: ComponentType
}

// Solo define cómo se presenta cada nivel; las alertas y sus mensajes los genera el backend.
const ESTILO_NIVEL: Record<NivelAlerta, EstiloNivel> = {
  INFO: { clase: 'alerta--info', etiqueta: 'Información', icono: IconInfo },
  ADVERTENCIA: { clase: 'alerta--advertencia', etiqueta: 'Advertencia', icono: IconAlert },
  CRITICA: { clase: 'alerta--critica', etiqueta: 'Crítica', icono: IconAlert },
}

function AlertasPanel({ alertas }: AlertasPanelProps) {
  return (
    <section className="card section-card alertas" aria-label="Alertas del lote">
      <h2 className="section-card__title">Alertas</h2>
      {alertas.length === 0 ? (
        <p className="alertas__vacio">Sin alertas para este lote.</p>
      ) : (
        <ul className="alertas__lista">
          {alertas.map((alerta, i) => {
            // Un nivel desconocido se muestra como informativo.
            const estilo = ESTILO_NIVEL[alerta.nivel] ?? ESTILO_NIVEL.INFO
            const Icono = estilo.icono
            return (
              <li key={`${alerta.tipo}-${i}`} className={`alerta ${estilo.clase}`}>
                <span className="alerta__icono">
                  <Icono />
                </span>
                <div>
                  <span className="alerta__nivel">{estilo.etiqueta}</span>
                  <p className="alerta__mensaje">{alerta.mensaje}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default AlertasPanel
