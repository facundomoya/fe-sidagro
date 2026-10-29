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

/** Etapa fenológica de la soja (GET /agro/etapas-fenologicas), de Emergencia a R8. */
export interface EtapaFenologicaApi {
  id: number
  /** Por ejemplo "R3 - Formación de vainas". */
  nombre: string
  descripcion: string
  /** Texto decimal (°C día). */
  gddaMinimo: string
  /** Texto decimal (°C día). */
  gddaMaximo: string
  /** Por ejemplo "Cada 3 días". */
  frecuenciaMonitoreo: string
  /** Riesgo base de chinche verde en la etapa ("Muy bajo" a "Muy alto"). */
  riesgoChinche: string
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

/** Cuerpo de POST /agro/campanias (CreateCampaniaDto). */
export interface NuevaCampaniaApi {
  /** Único, hasta 120 caracteres. */
  nombre: string
  /** YYYY-MM-DD. */
  fechaInicio: string
  /** YYYY-MM-DD; no puede ser anterior a fechaInicio. */
  fechaFin?: string
}

/** Cuerpo de POST /agro/lotes (CreateLoteDto). El estado inicial lo define el backend. */
export interface NuevoLoteApi {
  /** Hasta 120 caracteres. */
  nombre: string
  provinciaId: number
  campaniaId: number
  /** Hasta 255 caracteres. */
  ubicacion?: string
  /** Hectáreas, número positivo. */
  superficie?: number
  /** YYYY-MM-DD. El backend la admite opcional; el frontend la exige. */
  fechaSiembra?: string
}

/** Cuerpo de PATCH /agro/lotes/:id cuando solo se completa la fecha de siembra. */
export interface FechaSiembraApi {
  /** YYYY-MM-DD. */
  fechaSiembra: string
}
