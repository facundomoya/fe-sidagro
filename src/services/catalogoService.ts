// Servicio del catálogo agro (provincias, campañas, lotes y etapas) contra el backend.
import { apiClient } from './apiClient'
import type { ListaCompleta } from '../types/api'
import type { EtapaFenologicaApi, LoteApi } from '../types/catalogo'

/** Todos los lotes, sin paginar, con su provincia y campaña. */
export async function obtenerLotes(signal?: AbortSignal): Promise<LoteApi[]> {
  const { data } = await apiClient.get<ListaCompleta<LoteApi>>('/agro/lotes', {
    query: { takeAll: true },
    signal,
  })
  return data
}

/** Etapas fenológicas ordenadas de Emergencia a R8. */
export async function obtenerEtapas(signal?: AbortSignal): Promise<EtapaFenologicaApi[]> {
  const { data } = await apiClient.get<ListaCompleta<EtapaFenologicaApi>>('/agro/etapas-fenologicas', {
    signal,
  })
  return data
}
