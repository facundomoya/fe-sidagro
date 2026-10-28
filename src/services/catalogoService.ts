// Servicio del catálogo agro (provincias, campañas y lotes) contra el backend.
import { apiClient } from './apiClient'
import type { ListaCompleta } from '../types/api'
import type { LoteApi } from '../types/catalogo'

/** Todos los lotes, sin paginar, con su provincia y campaña. */
export async function obtenerLotes(signal?: AbortSignal): Promise<LoteApi[]> {
  const { data } = await apiClient.get<ListaCompleta<LoteApi>>('/agro/lotes', {
    query: { takeAll: true },
    signal,
  })
  return data
}
