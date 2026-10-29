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

/**
 * Departamento de una provincia (GET /agro/provincias/:id/departamentos). Sus coordenadas son
 * las que usa el backend para pedir el clima del monitoreo de los lotes de la zona.
 */
export interface DepartamentoApi {
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
  /** Rendimiento esperado en t/ha como texto decimal. Lo usa el módulo económico. */
  rendimiento: string | null
  /** Fecha en formato YYYY-MM-DD. Necesaria para calcular el monitoreo. */
  fechaSiembra: string | null
  estado: EstadoLote
  provincia: ProvinciaApi
  /**
   * null en los lotes sin departamento (por ejemplo, los creados antes de su incorporación):
   * el monitoreo usa entonces el clima de la capital provincial.
   */
  departamento: DepartamentoApi | null
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
  /** Departamento de esa provincia. El backend lo admite opcional y valida que pertenezca a ella. */
  departamentoId?: number
  campaniaId: number
  /** Hasta 255 caracteres. */
  ubicacion?: string
  /** Hectáreas, número positivo. */
  superficie?: number
  /** t/ha, mayor que cero, hasta 10 y con dos decimales como máximo. */
  rendimiento?: number
  /** YYYY-MM-DD. El backend la admite opcional; el frontend la exige. */
  fechaSiembra?: string
}

/** Cuerpo de PATCH /agro/lotes/:id cuando solo se completa la fecha de siembra. */
export interface FechaSiembraApi {
  /** YYYY-MM-DD. */
  fechaSiembra: string
}

/**
 * Cuerpo de PATCH /agro/lotes/:id al completar los datos productivos. Solo se envían los
 * campos que faltaban y se cargaron; nunca null.
 */
export interface DatosProductivosApi {
  /** Hectáreas, número positivo. */
  superficie?: number
  /** t/ha, mayor que cero y hasta 10. */
  rendimiento?: number
}

/** Cuerpo de PATCH /agro/lotes/:id cuando solo se completa el departamento. */
export interface DepartamentoLoteApi {
  departamentoId: number
}
