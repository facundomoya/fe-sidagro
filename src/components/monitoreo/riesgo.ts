import type { StatTone } from '../StatCard'
import type { NivelRiesgo } from '../../types/monitoreo'
import type { NivelRiesgoChinche } from '../../types/monitoreoApi'

// Escala de los datos simulados anteriores (Bajo, Medio, Alto). Se conserva para los
// componentes que todavía usan mocks.
export const TONO_RIESGO_SIMULADO: Record<NivelRiesgo, StatTone> = {
  Bajo: 'success',
  Medio: 'warning',
  Alto: 'danger',
}

// Solo define el color con que se muestra el nivel recibido del backend; no calcula el riesgo.
export const TONO_RIESGO: Record<NivelRiesgoChinche, StatTone> = {
  'Muy bajo': 'success',
  Bajo: 'success',
  Moderado: 'warning',
  Alto: 'danger',
  'Muy alto': 'danger',
}

/** Tono del nivel; si el backend envía un valor desconocido, se muestra sin color de alerta. */
export function tonoRiesgo(nivel: string): StatTone {
  return TONO_RIESGO[nivel as NivelRiesgoChinche] ?? 'default'
}
