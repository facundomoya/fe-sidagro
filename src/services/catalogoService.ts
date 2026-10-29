// Servicio del catálogo agro (provincias, campañas, lotes y etapas) contra el backend.
import { apiClient } from './apiClient'
import type { ListaCompleta } from '../types/api'
import type {
  CampaniaApi,
  EtapaFenologicaApi,
  FechaSiembraApi,
  LoteApi,
  NuevaCampaniaApi,
  NuevoLoteApi,
  ProvinciaApi,
} from '../types/catalogo'

/** Todos los lotes, sin paginar, con su provincia y campaña. */
export async function obtenerLotes(signal?: AbortSignal): Promise<LoteApi[]> {
  const { data } = await apiClient.get<ListaCompleta<LoteApi>>('/agro/lotes', {
    query: { takeAll: true },
    signal,
  })
  return data
}

/** Un lote con su provincia y campaña. Responde 404 si no existe. */
export function obtenerLote(loteId: number, signal?: AbortSignal): Promise<LoteApi> {
  return apiClient.get<LoteApi>(`/agro/lotes/${loteId}`, { signal })
}

/** Etapas fenológicas ordenadas de Emergencia a R8. */
export async function obtenerEtapas(signal?: AbortSignal): Promise<EtapaFenologicaApi[]> {
  const { data } = await apiClient.get<ListaCompleta<EtapaFenologicaApi>>('/agro/etapas-fenologicas', {
    signal,
  })
  return data
}

/** Todas las campañas, sin paginar. El backend no las ordena. */
export async function obtenerCampanias(signal?: AbortSignal): Promise<CampaniaApi[]> {
  const { data } = await apiClient.get<ListaCompleta<CampaniaApi>>('/agro/campanias', {
    query: { takeAll: true },
    signal,
  })
  return data
}

/** Provincias disponibles para los lotes. */
export async function obtenerProvincias(signal?: AbortSignal): Promise<ProvinciaApi[]> {
  const { data } = await apiClient.get<ListaCompleta<ProvinciaApi>>('/agro/provincias', { signal })
  return data
}

/** Crea una campaña. Responde 409 si ya existe una con el mismo nombre. */
export async function crearCampania(campania: NuevaCampaniaApi): Promise<CampaniaApi> {
  const creada = await apiClient.post<CampaniaApi>('/agro/campanias', campania)
  // Sin fecha de fin el backend puede omitir el campo en la respuesta.
  return { ...creada, fechaFin: creada.fechaFin ?? null }
}

/** Crea un lote. Responde 404 si la provincia o la campaña no existen. */
export function crearLote(lote: NuevoLoteApi): Promise<LoteApi> {
  return apiClient.post<LoteApi>('/agro/lotes', lote)
}

/** Registra la fecha de siembra de un lote; solo se envía ese campo. */
export function registrarFechaSiembra(loteId: number, cambios: FechaSiembraApi): Promise<LoteApi> {
  return apiClient.patch<LoteApi>(`/agro/lotes/${loteId}`, cambios)
}
