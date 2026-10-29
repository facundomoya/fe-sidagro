// Servicio de la simulación de escenarios contra el backend (/agro/simulaciones).
import { apiClient } from './apiClient'
import type { ListaCompleta } from '../types/api'
import type { NuevaSimulacionApi, SimulacionApi, SimulacionResumenApi } from '../types/simulacionApi'

/**
 * Crea el escenario y genera la recomendación en el mismo pedido (tarda entre 15 y 60 s).
 * Si la IA falla, igual responde con la simulación en estado ERROR y sin recomendación.
 */
export function crearSimulacion(
  simulacion: NuevaSimulacionApi,
  signal?: AbortSignal,
): Promise<SimulacionApi> {
  return apiClient.post<SimulacionApi>('/agro/simulaciones', simulacion, { signal })
}

/** Reintenta la recomendación de una simulación en ERROR. 503 si vuelve a fallar; 409 si ya tenía. */
export function reintentarRecomendacion(
  simulacionId: number,
  signal?: AbortSignal,
): Promise<SimulacionApi> {
  return apiClient.post<SimulacionApi>(`/agro/simulaciones/${simulacionId}/recomendacion`, undefined, {
    signal,
  })
}

/** Detalle completo de una simulación, con clima y recomendación. */
export function obtenerSimulacion(simulacionId: number, signal?: AbortSignal): Promise<SimulacionApi> {
  return apiClient.get<SimulacionApi>(`/agro/simulaciones/${simulacionId}`, { signal })
}

/** Todas las simulaciones, sin paginar. No incluyen clima ni recomendación. */
export async function obtenerSimulaciones(signal?: AbortSignal): Promise<SimulacionResumenApi[]> {
  const { data } = await apiClient.get<ListaCompleta<SimulacionResumenApi>>('/agro/simulaciones', {
    query: { takeAll: true },
    signal,
  })
  return data
}
