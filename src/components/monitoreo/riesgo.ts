import type { StatTone } from '../StatCard'
import type { NivelRiesgo } from '../../types/monitoreo'

// Solo define el color con que se muestra el nivel recibido; no calcula el riesgo.
export const TONO_RIESGO: Record<NivelRiesgo, StatTone> = {
  Bajo: 'success',
  Medio: 'warning',
  Alto: 'danger',
}
