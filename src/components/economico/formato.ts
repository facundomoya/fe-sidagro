// Textos y formatos del Dashboard económico. Solo presentan los valores calculados por el
// backend: no recalculan ingresos, costos, ganancias ni rentabilidad.
import type { DatoFaltante, ResultadoEconomico } from '../../types/economico'
import { esFechaIsoValida } from '../../utils/fechas'
import { formatearFecha, formatearNumero, parsearDecimal } from '../../utils/format'

/** Quintales por tonelada: solo un cambio de unidad para mostrar el rendimiento de indiferencia. */
const QUINTALES_POR_TONELADA = 10

const SIN_DATO = 'Sin dato'

/** Importe en dólares con dos decimales, por ejemplo "1.234,56 USD/ha". */
export function textoUsd(valor: number | string | null, unidad = 'USD'): string {
  const numero = parsearDecimal(valor)
  return numero === null ? SIN_DATO : `${formatearNumero(numero, 2)} ${unidad}`
}

export function textoPesos(valor: number | null, unidad = 'ARS'): string {
  return valor === null ? SIN_DATO : `${formatearNumero(valor, 2)} ${unidad}`
}

export function textoHectareas(valor: number | null): string {
  return valor === null ? SIN_DATO : `${formatearNumero(valor, 2)} ha`
}

export function textoToneladas(valor: number | null): string {
  return valor === null ? SIN_DATO : `${formatearNumero(valor, 2)} t`
}

export function textoRendimiento(valor: number | null): string {
  return valor === null ? SIN_DATO : `${formatearNumero(valor, 2)} t/ha`
}

export function textoQuintales(toneladasPorHectarea: number): string {
  return `${formatearNumero(toneladasPorHectarea * QUINTALES_POR_TONELADA, 1)} qq/ha`
}

/** Porcentaje; sin dato cuando el backend devuelve null (nunca "0 %"). */
export function textoPorcentaje(valor: number | null): string {
  return valor === null ? SIN_DATO : `${formatearNumero(valor, 2)} %`
}

/** Fecha YYYY-MM-DD en formato DD/MM/AAAA; si llega en otro formato se muestra tal cual. */
export function textoFecha(fecha: string | null): string {
  if (!fecha) return SIN_DATO
  const iso = fecha.slice(0, 10)
  return esFechaIsoValida(iso) ? formatearFecha(iso) : fecha
}

/** Tono según el signo del resultado: ganancia, pérdida o equilibrio. */
export type Signo = 'positivo' | 'negativo' | 'neutro'

export function signoDe(valor: number): Signo {
  if (valor > 0) return 'positivo'
  if (valor < 0) return 'negativo'
  return 'neutro'
}

interface Presentacion {
  texto: string
  clase: string
  /** Refuerza el color, para no depender solo de él. */
  simbolo: string
}

export const RESULTADO: Record<ResultadoEconomico, Presentacion> = {
  GANANCIA: { texto: 'Ganancia', clase: 'badge badge--success', simbolo: '▲' },
  PERDIDA: { texto: 'Pérdida', clase: 'badge badge--danger', simbolo: '▼' },
  EQUILIBRIO: { texto: 'Equilibrio', clase: 'badge economico-badge--equilibrio', simbolo: '=' },
}

/** Presentación del resultado; ante un valor desconocido se muestra tal como llegó. */
export function presentacionResultado(resultado: string): Presentacion {
  return (
    RESULTADO[resultado as ResultadoEconomico] ?? {
      texto: resultado,
      clase: 'badge economico-badge--equilibrio',
      simbolo: '',
    }
  )
}

const NOMBRE_FALTANTE: Record<DatoFaltante, string> = {
  superficie: 'superficie',
  rendimiento: 'rendimiento esperado',
}

/** Por ejemplo "superficie y rendimiento esperado". */
export function textoFaltantes(faltantes: string[]): string {
  const nombres = faltantes.map((f) => NOMBRE_FALTANTE[f as DatoFaltante] ?? f)
  if (nombres.length <= 1) return nombres[0] ?? 'datos del lote'
  return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`
}
