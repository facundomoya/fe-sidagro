export type Provincia = 'San Luis' | 'Santiago del Estero'

export type NivelRiesgo = 'Bajo' | 'Medio' | 'Alto'

export interface Lote {
  id: string
  nombre: string
  provincia: Provincia
  /** Fecha en formato ISO (YYYY-MM-DD). */
  fechaSiembra: string
}

export interface IndicadoresMonitoreo {
  gdd: number
  gdda: number
  etapaFenologica: string
  descripcionEtapa: string
  riesgo: NivelRiesgo
}

export interface CondicionesClimaticas {
  temperatura: number
  temperaturaMax: number
  temperaturaMin: number
  lluvia: number
  humedad: number
  vientoVelocidad: number
  vientoDireccion: string
}

/** Resultado predictivo de un análisis: indicadores y fecha recomendada de monitoreo. */
export interface ResultadoAnalisis {
  indicadores: IndicadoresMonitoreo
  /** Fecha en formato ISO (YYYY-MM-DD). */
  proximoMonitoreo: string
}

export interface AnalisisEjecutado extends ResultadoAnalisis {
  id: string
  loteId: string
  /** Fecha y hora de ejecución en formato ISO. */
  fechaEjecucion: string
}

export interface MonitoreoLote extends ResultadoAnalisis {
  loteId: string
  clima: CondicionesClimaticas
  /** Fecha y hora del análisis mostrado. Ausente cuando se muestran los datos iniciales. */
  fechaUltimoAnalisis?: string
}

export const ETAPAS_FENOLOGICAS_SOJA = [
  'VE', 'VC', 'V1', 'V2', 'V3',
  'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8',
] as const

export type EtapaFenologicaSoja = (typeof ETAPAS_FENOLOGICAS_SOJA)[number]

export interface NuevaObservacion {
  loteId: string
  /** Fecha en formato ISO (YYYY-MM-DD). */
  fecha: string
  presenciaChinche: boolean
  /** Solo se informa cuando hay presencia. La unidad de muestreo está pendiente de definición. */
  cantidadObservada: number | null
  /** null cuando no se especifica. */
  etapaFenologica: EtapaFenologicaSoja | null
  comentarios: string
}

export interface ObservacionCampo extends NuevaObservacion {
  id: string
  /** Fecha y hora de registro en formato ISO. */
  fechaRegistro: string
}
