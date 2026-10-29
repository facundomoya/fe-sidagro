// Textos y colores para mostrar los valores que devuelve el backend. No calculan nada.
import type { StatTone } from '../StatCard'
import type {
  EstadoSimulacion,
  NivelConfianza,
  PrioridadRecomendacion,
} from '../../types/simulacionApi'
import { parsearDecimal } from '../../utils/format'

export const ESTADO_SIMULACION: Record<EstadoSimulacion, { texto: string; tono: StatTone }> = {
  RECOMENDADA: { texto: 'Recomendación generada', tono: 'success' },
  ERROR: { texto: 'Sin recomendación', tono: 'danger' },
  CREADA: { texto: 'Recomendación pendiente', tono: 'warning' },
}

export const TONO_PRIORIDAD: Record<PrioridadRecomendacion, StatTone> = {
  BAJA: 'success',
  MEDIA: 'warning',
  ALTA: 'danger',
}

export const TEXTO_PRIORIDAD: Record<PrioridadRecomendacion, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
}

export const TEXTO_CONFIANZA: Record<NivelConfianza, string> = {
  BAJO: 'Baja',
  MEDIO: 'Media',
  ALTO: 'Alta',
}

/** Clase de la etiqueta según el tono; los valores desconocidos se muestran sin color. */
export function claseBadge(tono: StatTone | undefined): string {
  return `badge badge--${tono && tono !== 'default' ? tono : 'neutral'}`
}

/** Formatea un decimal recibido como texto, sin ceros de más; muestra "—" si no es válido. */
export function formatearDecimal(valor: string, maxDecimales = 2): string {
  const numero = parsearDecimal(valor)
  return numero === null ? '—' : numero.toLocaleString('es-AR', { maximumFractionDigits: maxDecimales })
}
