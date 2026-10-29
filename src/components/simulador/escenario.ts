// Valores, validación y armado del escenario a simular.
// Las reglas replican las de CreateSimulacionDto y SimulacionService en el backend.
import type { NivelRiesgoChinche } from '../../types/monitoreoApi'
import type { DatoClimaticoEntrada, NuevaSimulacionApi } from '../../types/simulacionApi'

export const MAX_DIAS_CLIMATICOS = 7
export const MAX_OBSERVACIONES = 2000

export const FECHA_REPETIDA = 'Fecha repetida.'

export const NIVELES_RIESGO: NivelRiesgoChinche[] = ['Muy bajo', 'Bajo', 'Moderado', 'Alto', 'Muy alto']

export type VariableClimatica = 'temperatura' | 'precipitacion' | 'humedad' | 'viento'

interface DefinicionVariable {
  etiqueta: string
  unidad: string
  min: number
  max: number
}

export const VARIABLES_CLIMATICAS: Record<VariableClimatica, DefinicionVariable> = {
  temperatura: { etiqueta: 'Temp. media', unidad: '°C', min: -30, max: 60 },
  precipitacion: { etiqueta: 'Precipitación', unidad: 'mm', min: 0, max: 1000 },
  humedad: { etiqueta: 'Humedad', unidad: '%', min: 0, max: 100 },
  viento: { etiqueta: 'Viento', unidad: 'km/h', min: 0, max: 300 },
}

export const LISTA_VARIABLES = Object.keys(VARIABLES_CLIMATICAS) as VariableClimatica[]

/** Un día de la tabla de clima. Los números se guardan como texto mientras se editan. */
export interface DiaClimaticoForm extends Record<VariableClimatica, string> {
  /** Identificador estable de la fila (no se envía). */
  clave: number
  fecha: string
}

export interface ValoresEscenario {
  loteId: string
  etapaId: string
  riesgoObservado: NivelRiesgoChinche | ''
  observaciones: string
  dias: DiaClimaticoForm[]
}

export type CampoDia = 'fecha' | VariableClimatica

export interface ErroresEscenario {
  loteId?: string
  etapaId?: string
  riesgoObservado?: string
  observaciones?: string
  /** Errores de cada día, por clave de la fila. */
  dias: Record<number, Partial<Record<CampoDia, string>>>
  /** Error del conjunto de fechas. */
  serie?: string
}

const MS_POR_DIA = 24 * 60 * 60 * 1000
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/

function fechaUtc(fechaIso: string): number {
  const [anio, mes, dia] = fechaIso.split('-').map(Number)
  return Date.UTC(anio, mes - 1, dia)
}

function esFechaValida(fechaIso: string): boolean {
  if (!FORMATO_FECHA.test(fechaIso)) return false
  const [anio, mes, dia] = fechaIso.split('-').map(Number)
  const fecha = new Date(fechaUtc(fechaIso))
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
}

/** Suma días a una fecha ISO (YYYY-MM-DD). */
export function sumarDias(fechaIso: string, dias: number): string {
  return new Date(fechaUtc(fechaIso) + dias * MS_POR_DIA).toISOString().slice(0, 10)
}

/**
 * Ordena los días por fecha. Cada fila se mueve completa, con sus valores.
 * Los días sin fecha válida quedan al final, en el orden en que estaban.
 */
export function ordenarDias(dias: DiaClimaticoForm[]): DiaClimaticoForm[] {
  return [...dias].sort((a, b) => {
    const aValida = esFechaValida(a.fecha)
    const bValida = esFechaValida(b.fecha)
    if (aValida && bValida) return a.fecha.localeCompare(b.fecha)
    return Number(bValida) - Number(aValida)
  })
}

/** Última fecha válida cargada, o null si no hay ninguna. */
export function ultimaFecha(dias: DiaClimaticoForm[]): string | null {
  const fechas = dias.map((d) => d.fecha).filter(esFechaValida).sort()
  return fechas[fechas.length - 1] ?? null
}

export function nuevoDia(clave: number, fecha: string): DiaClimaticoForm {
  return { clave, fecha, temperatura: '', precipitacion: '', humedad: '', viento: '' }
}

function validarNumero(texto: string, variable: VariableClimatica): string | undefined {
  const { min, max, unidad } = VARIABLES_CLIMATICAS[variable]
  if (texto.trim() === '') return 'Obligatorio.'
  const valor = Number(texto)
  if (!Number.isFinite(valor)) return 'Debe ser un número.'
  if (valor < min || valor > max) return `Entre ${min} y ${max} ${unidad}.`
  return undefined
}

export function validarEscenario(valores: ValoresEscenario): ErroresEscenario {
  const errores: ErroresEscenario = { dias: {} }

  if (!valores.loteId) errores.loteId = 'Seleccioná un lote.'
  if (!valores.etapaId) errores.etapaId = 'Seleccioná la etapa fenológica.'
  if (!valores.riesgoObservado) errores.riesgoObservado = 'Indicá el riesgo observado.'
  if (valores.observaciones.length > MAX_OBSERVACIONES) {
    errores.observaciones = `Las observaciones no pueden superar los ${MAX_OBSERVACIONES} caracteres.`
  }

  const repeticiones = new Map<string, number>()
  for (const dia of valores.dias) {
    if (dia.fecha) repeticiones.set(dia.fecha, (repeticiones.get(dia.fecha) ?? 0) + 1)
  }

  for (const dia of valores.dias) {
    const erroresDia: Partial<Record<CampoDia, string>> = {}
    if (!dia.fecha) erroresDia.fecha = 'Obligatoria.'
    else if (!esFechaValida(dia.fecha)) erroresDia.fecha = 'Fecha inválida.'
    else if ((repeticiones.get(dia.fecha) ?? 0) > 1) erroresDia.fecha = FECHA_REPETIDA

    for (const variable of LISTA_VARIABLES) {
      const error = validarNumero(dia[variable], variable)
      if (error) erroresDia[variable] = error
    }
    if (Object.keys(erroresDia).length > 0) errores.dias[dia.clave] = erroresDia
  }

  if (valores.dias.length === 0) {
    errores.serie = 'Cargá al menos un día de clima.'
  } else if (valores.dias.length > MAX_DIAS_CLIMATICOS) {
    errores.serie = `Se admiten como máximo ${MAX_DIAS_CLIMATICOS} días.`
  } else {
    const tiempos = valores.dias.filter((d) => esFechaValida(d.fecha)).map((d) => fechaUtc(d.fecha))
    if (tiempos.length > 1) {
      const diferencia = (Math.max(...tiempos) - Math.min(...tiempos)) / MS_POR_DIA
      if (diferencia >= MAX_DIAS_CLIMATICOS) {
        errores.serie = `Las fechas deben abarcar como máximo ${MAX_DIAS_CLIMATICOS} días corridos: entre la primera y la última hay ${diferencia} días de diferencia.`
      }
    }
  }

  return errores
}

/** Cantidad de datos a completar o corregir. */
export function contarErrores(errores: ErroresEscenario): number {
  const generales = [errores.loteId, errores.etapaId, errores.riesgoObservado, errores.observaciones, errores.serie]
  const deDias = Object.values(errores.dias).reduce((total, dia) => total + Object.keys(dia).length, 0)
  return generales.filter(Boolean).length + deDias
}

/** Arma el cuerpo de POST /agro/simulaciones. Usar solo con un escenario sin errores. */
export function construirSimulacion(valores: ValoresEscenario): NuevaSimulacionApi {
  const datosClimaticos: DatoClimaticoEntrada[] = valores.dias.map((dia) => ({
    fecha: dia.fecha,
    temperatura: Number(dia.temperatura),
    precipitacion: Number(dia.precipitacion),
    humedad: Number(dia.humedad),
    viento: Number(dia.viento),
  }))
  const observaciones = valores.observaciones.trim()
  return {
    loteId: Number(valores.loteId),
    etapaId: Number(valores.etapaId),
    riesgoObservado: valores.riesgoObservado as NivelRiesgoChinche,
    datosClimaticos,
    ...(observaciones && { observaciones }),
  }
}
