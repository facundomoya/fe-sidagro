// Servicio del simulador de escenarios. Por ahora guarda las simulaciones en memoria;
// cuando el backend defina sus endpoints, reemplazar estas funciones por llamadas reales.
import type { NuevaSimulacion, SimulacionGuardada } from '../types/simulador'

const DEMORA_SIMULADA_MS = 400

// Simulaciones guardadas durante la sesión. Se pierden al recargar la página.
const simulacionesEnMemoria: SimulacionGuardada[] = []

function simularRespuesta<T>(datos: T, demoraMs = DEMORA_SIMULADA_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(datos), demoraMs))
}

export function guardarSimulacion(simulacion: NuevaSimulacion): Promise<SimulacionGuardada> {
  const guardada: SimulacionGuardada = { ...simulacion, id: crypto.randomUUID() }
  simulacionesEnMemoria.push(guardada)
  return simularRespuesta(guardada)
}

/** Simulaciones guardadas del lote, de la ejecución más reciente a la más antigua. */
export function obtenerSimulacionesPorLote(loteId: string): Promise<SimulacionGuardada[]> {
  const simulaciones = simulacionesEnMemoria
    .filter((s) => s.loteId === loteId)
    .sort((a, b) => b.fechaEjecucion.localeCompare(a.fechaEjecucion))
  return simularRespuesta(simulaciones)
}
