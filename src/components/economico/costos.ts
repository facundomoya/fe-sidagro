// Estado de cada costo de producción del historial, con el mismo criterio que el backend
// (economico.service.ts, costoVigente): rige el de mayor vigenciaDesde que no sea posterior a hoy
// en Argentina; los posteriores a hoy todavía no rigen.
import type { CostoProduccionApi } from '../../types/economico'

export type EstadoCosto = 'vigente' | 'anterior' | 'futuro'

const ZONA_ARGENTINA = 'America/Argentina/Buenos_Aires'

/** Fecha de hoy en Argentina (YYYY-MM-DD), igual que hoyEnArgentina() del backend. */
export function hoyEnArgentina(): string {
  // en-CA formatea las fechas como YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_ARGENTINA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Solo la fecha (YYYY-MM-DD), por si el backend la enviara con hora. */
function fechaDe(costo: CostoProduccionApi): string {
  return costo.vigenciaDesde.slice(0, 10)
}

/** Estado de cada costo por id. Las fechas YYYY-MM-DD se comparan como texto. */
export function estadosDeCostos(costos: CostoProduccionApi[], hoy: string): Map<number, EstadoCosto> {
  const vigente = costos
    .filter((c) => fechaDe(c) <= hoy)
    .reduce<CostoProduccionApi | null>(
      (mayor, c) => (!mayor || fechaDe(c) > fechaDe(mayor) ? c : mayor),
      null,
    )
  const estados = new Map<number, EstadoCosto>()
  costos.forEach((c) => {
    if (fechaDe(c) > hoy) estados.set(c.id, 'futuro')
    else estados.set(c.id, c.id === vigente?.id ? 'vigente' : 'anterior')
  })
  return estados
}

export const ESTADO_COSTO: Record<EstadoCosto, { texto: string; clase: string }> = {
  vigente: { texto: 'Vigente', clase: 'badge badge--success' },
  anterior: { texto: 'Anterior', clase: 'badge economico-badge--equilibrio' },
  futuro: { texto: 'Futuro', clase: 'badge badge--warning' },
}
