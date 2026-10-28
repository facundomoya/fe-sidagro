// Tipos del monitoreo de chinche verde según el backend
// (be-sidagro: dto/monitoreo-response.dto.ts, enums/agro.enums.ts y monitoreo/calculo-monitoreo.ts).
// Los tipos de types/monitoreo.ts corresponden a los datos simulados anteriores.

/** Escala de riesgo del backend (enum NivelRiesgo). */
export type NivelRiesgoChinche = 'Muy bajo' | 'Bajo' | 'Moderado' | 'Alto' | 'Muy alto'

export type CalificacionDia = 'OPTIMA' | 'ACEPTABLE' | 'RIESGOSA'

export type NivelAlerta = 'INFO' | 'ADVERTENCIA' | 'CRITICA'

export type IconoClima =
  | 'despejado'
  | 'parcialmente-nublado'
  | 'nublado'
  | 'niebla'
  | 'llovizna'
  | 'lluvia'
  | 'chaparrones'
  | 'nieve'
  | 'tormenta'
  | 'desconocido'

export interface EstadoCielo {
  /** Código WMO del proveedor. */
  codigo: number | null
  descripcion: string
  icono: IconoClima
}

export interface LoteMonitoreo {
  id: number
  nombre: string
  fechaSiembra: string
  /** Nombre de la provincia. */
  provincia: string
  /** Nombre de la campaña. */
  campania: string
}

export interface EtapaActual {
  id: number
  /** Por ejemplo "R3 - Formación de vainas". */
  nombre: string
  gddaMinimo: number
  gddaMaximo: number
  /** Por ejemplo "Cada 3 días". */
  frecuenciaMonitoreo: string
  /** Riesgo base de la etapa. */
  riesgoChinche: string
}

/** Uno de los próximos 7 días, calificado para monitorear. El primero es el día de hoy. */
export interface DiaMonitoreo {
  fecha: string
  gddaProyectado: number
  etapa: string
  calificacion: CalificacionDia
  motivo: string
  /** Temperatura media del día (°C). */
  temperatura: number
  /** Precipitación del día (mm). */
  precipitacion: number
  /** Viento máximo del día (km/h). */
  viento: number
  /** Humedad relativa media del día (%). */
  humedad: number
  /** Probabilidad de lluvia (%). */
  probabilidadLluvia: number | null
  estadoCielo: EstadoCielo
}

export interface VentanaEtapa {
  etapa: string
  riesgoChinche: string
  frecuenciaMonitoreo: string
  gddaMinimo: number
  gddaMaximo: number
  /** null si la fecha queda muy lejos. */
  fechaInicioEstimada: string | null
  fechaFinEstimada: string | null
  critica: boolean
}

export interface Alerta {
  tipo: string
  nivel: NivelAlerta
  mensaje: string
}

export interface ProximoMonitoreo {
  fecha: string
  motivo: string
}

export interface ObservacionApi {
  id: number
  fecha: string
  presencia: boolean
  /** Chinches cada 20 golpes de paño; null si no hubo presencia. */
  densidad: number | null
  observaciones: string | null
  /** GDDA al día del monitoreo, como texto decimal. */
  gddaAcumulado: string | null
  etapaEstimada: string | null
  createdAt: string
}

/** Cuerpo de POST /agro/monitoreo/lotes/:loteId/observaciones (CreateObservacionDto). */
export interface NuevaObservacionApi {
  /** YYYY-MM-DD; no futura ni anterior a la siembra. */
  fecha: string
  presencia: boolean
  /** Entero de 1 a 1000, chinches cada 20 golpes de paño. Solo se envía si hay presencia. */
  densidad?: number
  /** Hasta 2000 caracteres. */
  observaciones?: string
}

/** Respuesta de GET /agro/monitoreo/lotes/:loteId. */
export interface Monitoreo {
  lote: LoteMonitoreo
  /** Fecha del cálculo (hoy en Argentina). */
  fecha: string
  /** Temperatura base de la soja (°C). */
  temperaturaBase: number
  proveedorClimatico: string
  diasDesdeSiembra: number
  gddHoy: number
  gddaAcumulado: number
  etapaActual: EtapaActual
  /** true si el cultivo superó los GDDA de R8. */
  cicloCumplido: boolean
  nivelRiesgo: NivelRiesgoChinche
  motivoRiesgo: string
  proximoMonitoreo: ProximoMonitoreo
  fechasMonitoreo: DiaMonitoreo[]
  ventanasEtapas: VentanaEtapa[]
  alertas: Alerta[]
  ultimaObservacion: ObservacionApi | null
}
