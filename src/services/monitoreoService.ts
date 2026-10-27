// Servicio del módulo de monitoreo. Por ahora devuelve datos simulados;
// cuando el backend defina sus endpoints, reemplazar estas funciones por llamadas reales.
import { LOTES_MOCK, MONITOREO_MOCK, RESULTADOS_ANALISIS_MOCK } from '../mocks/monitoreoMock'
import type {
  AnalisisEjecutado,
  Lote,
  MonitoreoLote,
  NuevaObservacion,
  ObservacionCampo,
} from '../types/monitoreo'

const DEMORA_SIMULADA_MS = 400
const DEMORA_ANALISIS_MS = 1800

// Datos registrados durante la sesión. Se pierden al recargar la página.
const observacionesEnMemoria: ObservacionCampo[] = []
const analisisEnMemoria: AnalisisEjecutado[] = []
// Posición del próximo resultado de la secuencia simulada de cada lote.
const indiceSecuenciaPorLote = new Map<string, number>()
const analisisEnCurso = new Map<string, Promise<AnalisisEjecutado>>()

function simularRespuesta<T>(datos: T, demoraMs = DEMORA_SIMULADA_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(datos), demoraMs))
}

function ultimoAnalisisDelLote(loteId: string): AnalisisEjecutado | undefined {
  return analisisEnMemoria.findLast((a) => a.loteId === loteId)
}

export function obtenerLotes(): Promise<Lote[]> {
  return simularRespuesta(LOTES_MOCK)
}

/** Datos del lote con su último análisis ejecutado o, si no tiene, con los valores iniciales. */
export function obtenerMonitoreoPorLote(loteId: string): Promise<MonitoreoLote | null> {
  const inicial = MONITOREO_MOCK.find((m) => m.loteId === loteId)
  if (!inicial) return simularRespuesta(null)

  const ultimo = ultimoAnalisisDelLote(loteId)
  if (!ultimo) return simularRespuesta(inicial)

  return simularRespuesta({
    ...inicial,
    indicadores: ultimo.indicadores,
    proximoMonitoreo: ultimo.proximoMonitoreo,
    fechaUltimoAnalisis: ultimo.fechaEjecucion,
  })
}

/**
 * Simula la ejecución de un análisis devolviendo el siguiente resultado predefinido del lote.
 * Si ya hay un análisis en curso para el lote, devuelve esa misma ejecución.
 */
export function ejecutarAnalisis(loteId: string): Promise<AnalisisEjecutado> {
  const enCurso = analisisEnCurso.get(loteId)
  if (enCurso) return enCurso

  const secuencia = RESULTADOS_ANALISIS_MOCK[loteId]
  if (!secuencia || secuencia.length === 0) {
    return Promise.reject(new Error(`No hay resultados simulados para el lote ${loteId}`))
  }

  const indice = indiceSecuenciaPorLote.get(loteId) ?? 0
  const ejecucion = simularRespuesta(null, DEMORA_ANALISIS_MS)
    .then(() => {
      const analisis: AnalisisEjecutado = {
        ...secuencia[indice],
        id: crypto.randomUUID(),
        loteId,
        fechaEjecucion: new Date().toISOString(),
      }
      analisisEnMemoria.push(analisis)
      indiceSecuenciaPorLote.set(loteId, (indice + 1) % secuencia.length)
      return analisis
    })
    .finally(() => analisisEnCurso.delete(loteId))

  analisisEnCurso.set(loteId, ejecucion)
  return ejecucion
}

/** Análisis ejecutados del lote, del más reciente al más antiguo. */
export function obtenerAnalisisPorLote(loteId: string): Promise<AnalisisEjecutado[]> {
  const analisis = analisisEnMemoria
    .filter((a) => a.loteId === loteId)
    .sort((a, b) => b.fechaEjecucion.localeCompare(a.fechaEjecucion))
  return simularRespuesta(analisis)
}

export function registrarObservacion(observacion: NuevaObservacion): Promise<ObservacionCampo> {
  const registrada: ObservacionCampo = {
    ...observacion,
    id: crypto.randomUUID(),
    fechaRegistro: new Date().toISOString(),
  }
  observacionesEnMemoria.push(registrada)
  return simularRespuesta(registrada)
}

/** Observaciones del lote, de la fecha de observación más reciente a la más antigua. */
export function obtenerObservacionesPorLote(loteId: string): Promise<ObservacionCampo[]> {
  const observaciones = observacionesEnMemoria
    .filter((o) => o.loteId === loteId)
    .sort(
      (a, b) =>
        b.fecha.localeCompare(a.fecha) || b.fechaRegistro.localeCompare(a.fechaRegistro),
    )
  return simularRespuesta(observaciones)
}
