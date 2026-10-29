// Fechas de calendario. Internamente y con el backend se usa YYYY-MM-DD; al usuario se le
// muestran y se le piden como DD/MM/YYYY. Se trabaja con los números de la fecha, sin
// convertir a Date, para que la zona horaria no pueda correr el día.

const FORMATO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/
const FORMATO_ARGENTINO = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/

function esBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0
}

function diasDelMes(anio: number, mes: number): number {
  if (mes === 2) return esBisiesto(anio) ? 29 : 28
  return [4, 6, 9, 11].includes(mes) ? 30 : 31
}

function esFechaReal(anio: number, mes: number, dia: number): boolean {
  return anio >= 1 && mes >= 1 && mes <= 12 && dia >= 1 && dia <= diasDelMes(anio, mes)
}

function aIso(anio: number, mes: number, dia: number): string {
  return `${String(anio).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/** Fecha real en formato YYYY-MM-DD (tiene en cuenta los días de cada mes y los años bisiestos). */
export function esFechaIsoValida(valor: string): boolean {
  const partes = FORMATO_ISO.exec(valor)
  if (!partes) return false
  const [anio, mes, dia] = partes.slice(1).map(Number)
  return esFechaReal(anio, mes, dia)
}

/** YYYY-MM-DD a DD/MM/YYYY. Si no es una fecha válida, devuelve el texto sin cambios. */
export function isoATextoArgentino(valor: string): string {
  if (!esFechaIsoValida(valor)) return valor
  const [anio, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${anio}`
}

/** DD/MM/YYYY (también D/M/YYYY, con / - o .) a YYYY-MM-DD; null si no es una fecha real. */
export function textoArgentinoAIso(texto: string): string | null {
  const partes = FORMATO_ARGENTINO.exec(texto.trim())
  if (!partes) return null
  const [dia, mes, anio] = partes.slice(1).map(Number)
  return esFechaReal(anio, mes, dia) ? aIso(anio, mes, dia) : null
}

/**
 * Ordena lo que se escribe como DD/MM/YYYY: agrega la barra cuando el día o el mes ya tienen
 * dos dígitos ("29102026" queda "29/10/2026"), respeta las barras escritas ("5/3/2026") y
 * descarta cualquier otro carácter.
 */
export function enmascararFecha(texto: string): string {
  let resultado = ''
  let segmento = 0 // 0: día, 1: mes, 2: año
  let largo = 0
  for (const caracter of texto) {
    if (caracter === '/') {
      if (largo > 0 && segmento < 2) {
        resultado += '/'
        segmento++
        largo = 0
      }
      continue
    }
    if (caracter < '0' || caracter > '9') continue
    if (largo === (segmento < 2 ? 2 : 4)) {
      if (segmento === 2) break
      resultado += '/'
      segmento++
      largo = 0
    }
    resultado += caracter
    largo++
  }
  return resultado
}
