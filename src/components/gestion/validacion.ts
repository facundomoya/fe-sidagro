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

export type LecturaNumero = LecturaSuperficie

interface ReglasDecimal {
  /** Para el mensaje de error, por ejemplo "El rendimiento". */
  nombre: string
  /** Ejemplo de formato válido, por ejemplo "3,2". */
  ejemplo: string
  /** Valor máximo admitido, si lo hay. */
  maximo?: number
  /** Unidad del máximo para el mensaje, por ejemplo "t/ha". */
  unidad?: string
}

/**
 * Número positivo escrito por el usuario (admite coma decimal) con dos decimales como máximo,
 * como piden los DTO del backend (IsNumber maxDecimalPlaces 2, IsPositive). Vacío es null.
 */
export function leerDecimalPositivo(texto: string, reglas: ReglasDecimal): LecturaNumero {
  const limpio = texto.trim().replace(',', '.')
  if (limpio === '') return { valor: null }
  if (!/^\d+(\.\d+)?$/.test(limpio)) return { error: `Ingresá un número, por ejemplo ${reglas.ejemplo}.` }
  const valor = Number(limpio)
  if (valor <= 0) return { error: `${reglas.nombre} debe ser mayor que cero.` }
  if (reglas.maximo !== undefined && valor > reglas.maximo) {
    const unidad = reglas.unidad ? ` ${reglas.unidad}` : ''
    return { error: `${reglas.nombre} no puede superar ${String(reglas.maximo).replace('.', ',')}${unidad}.` }
  }
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return { error: 'Ingresá como máximo dos decimales.' }
  return { valor }
}

/** Rendimiento esperado del backend: en t/ha, mayor que cero y hasta 10 (CreateLoteDto). */
export const MAX_RENDIMIENTO = 10

/** Rendimiento esperado en t/ha escrito por el usuario. Vacío es null. */
export function leerRendimiento(texto: string): LecturaNumero {
  return leerDecimalPositivo(texto, {
    nombre: 'El rendimiento',
    ejemplo: '3,2',
    maximo: MAX_RENDIMIENTO,
    unidad: 't/ha',
  })
}
