// Tipos del catálogo agro según el backend (be-sidagro: dto/catalogo-response.dto.ts).
// Los decimales llegan como texto (por ejemplo "80.00"): convertirlos con Number() antes de usarlos.

export interface ProvinciaApi {
  id: number
  nombre: string
  /** Texto decimal. */
  latitud: string
  /** Texto decimal. */
  longitud: string
}

export interface CampaniaApi {
  id: number
  nombre: string
  /** Fecha en formato YYYY-MM-DD. */
  fechaInicio: string
  /** Fecha en formato YYYY-MM-DD. */
  fechaFin: string | null
}

export type EstadoLote = 'ACTIVO' | 'INACTIVO'

export interface LoteApi {
  id: number
  nombre: string
  ubicacion: string | null
  /** Hectáreas como texto decimal. */
  superficie: string | null
  /** Fecha en formato YYYY-MM-DD. Necesaria para calcular el monitoreo. */
  fechaSiembra: string | null
  estado: EstadoLote
  provincia: ProvinciaApi
  campania: CampaniaApi
}
