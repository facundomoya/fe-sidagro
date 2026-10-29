// Orden y textos de los listados de lotes y campañas. El backend no ordena estos listados.
import type { CampaniaApi, LoteApi } from '../../types/catalogo'
import { formatearNumero, parsearDecimal } from '../../utils/format'

export function ordenarLotes(lotes: LoteApi[]): LoteApi[] {
  return [...lotes].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es') || a.id - b.id)
}

/** De la campaña que empezó más recientemente a la más antigua. */
export function ordenarCampanias(campanias: CampaniaApi[]): CampaniaApi[] {
  return [...campanias].sort(
    (a, b) => b.fechaInicio.localeCompare(a.fechaInicio) || a.nombre.localeCompare(b.nombre, 'es'),
  )
}

/** Cantidad de lotes de cada campaña, calculada con el listado de lotes. */
export function lotesPorCampania(lotes: LoteApi[]): Map<number, number> {
  const cantidades = new Map<number, number>()
  lotes.forEach(({ campania }) => cantidades.set(campania.id, (cantidades.get(campania.id) ?? 0) + 1))
  return cantidades
}

export function textoSuperficie(superficie: string | null): string | null {
  const valor = parsearDecimal(superficie)
  return valor === null ? null : `${formatearNumero(valor, 2)} ha`
}

export function textoRendimiento(rendimiento: string | null): string | null {
  const valor = parsearDecimal(rendimiento)
  return valor === null ? null : `${formatearNumero(valor, 2)} t/ha`
}

/** Lotes sin departamento: el backend pide el clima del monitoreo en la capital provincial. */
export const SIN_DEPARTAMENTO = 'Sin departamento · clima de la capital provincial'

export const ESTADO_LOTE: Record<string, { texto: string; clase: string }> = {
  ACTIVO: { texto: 'Activo', clase: 'badge badge--success' },
  INACTIVO: { texto: 'Inactivo', clase: 'badge badge--danger' },
}
