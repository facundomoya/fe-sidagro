// Validaciones de los formularios de la sección, según los DTO del backend
// (CreateCampaniaDto, CreateLoteDto y UpdateLoteDto).

import { esFechaIsoValida } from '../../utils/fechas'

export const MAX_NOMBRE = 120
export const MAX_UBICACION = 255

export { esFechaIsoValida }

/** Error de una fecha obligatoria, o undefined si es válida. */
export function errorFechaObligatoria(valor: string, campo: string): string | undefined {
  if (!valor) return `Ingresá la ${campo}.`
  if (!esFechaIsoValida(valor)) return `La ${campo} no es válida (dd/mm/aaaa).`
  return undefined
}

export type LecturaSuperficie = { valor: number | null } | { error: string }

/** Superficie en hectáreas escrita por el usuario (admite coma decimal). Vacía es null. */
export function leerSuperficie(texto: string): LecturaSuperficie {
  const limpio = texto.trim().replace(',', '.')
  if (limpio === '') return { valor: null }
  if (!/^\d+(\.\d+)?$/.test(limpio)) return { error: 'Ingresá un número, por ejemplo 120,5.' }
  const valor = Number(limpio)
  if (valor <= 0) return { error: 'La superficie debe ser mayor que cero.' }
  // La columna del backend guarda dos decimales.
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return { error: 'Ingresá como máximo dos decimales.' }
  return { valor }
}
