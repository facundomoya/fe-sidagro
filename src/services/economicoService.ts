// Servicio del módulo económico contra el backend. Requiere el permiso ECONOMICO_GET.
import { apiClient } from './apiClient'
import type {
  CostoProduccionApi,
  DashboardEconomicoApi,
  FiltrosDashboardEconomico,
  NuevoCostoApi,
} from '../types/economico'

/**
 * Indicadores económicos de los lotes y sus totales. Responde 409 si no hay un costo de
 * producción vigente y 503 si no se puede obtener el precio de la soja.
 */
export function obtenerDashboardEconomico(
  filtros: FiltrosDashboardEconomico,
  signal?: AbortSignal,
): Promise<DashboardEconomicoApi> {
  return apiClient.get<DashboardEconomicoApi>('/agro/economico/dashboard', {
    query: { campaniaId: filtros.campaniaId, provinciaId: filtros.provinciaId },
    signal,
  })
}

/** Costos cargados, del más reciente al más antiguo; incluye los de vigencia futura. */
export function obtenerCostos(signal?: AbortSignal): Promise<CostoProduccionApi[]> {
  return apiClient.get<CostoProduccionApi[]>('/agro/economico/costos', { signal })
}

/** Registra un costo (permiso COSTO_POST). Responde 409 si ya hay uno con esa vigenciaDesde. */
export function registrarCosto(costo: NuevoCostoApi): Promise<CostoProduccionApi> {
  return apiClient.post<CostoProduccionApi>('/agro/economico/costos', costo)
}
