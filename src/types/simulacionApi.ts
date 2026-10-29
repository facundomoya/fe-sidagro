// Tipos de la simulación de escenarios según el backend
// (be-sidagro: dto/create-simulacion.dto.ts y dto/simulacion-response.dto.ts).
// Los decimales de las respuestas llegan como texto (por ejemplo "17.20").
import type { EtapaFenologicaApi, LoteApi } from './catalogo'
import type { NivelRiesgoChinche } from './monitoreoApi'

/** RECOMENDADA: tiene recomendación. ERROR: la IA falló y se puede reintentar. */
export type EstadoSimulacion = 'CREADA' | 'RECOMENDADA' | 'ERROR'

export type FuenteClimatica = 'API' | 'MANUAL'

export type PrioridadRecomendacion = 'BAJA' | 'MEDIA' | 'ALTA'

export type NivelConfianza = 'BAJO' | 'MEDIO' | 'ALTO'

/** Un día del clima del escenario, tal como se envía al crear la simulación. */
export interface DatoClimaticoEntrada {
  /** Fecha en formato YYYY-MM-DD. */
  fecha: string
  /** Temperatura media (°C), de -30 a 60. */
  temperatura: number
  /** Precipitación (mm), de 0 a 1000. */
  precipitacion: number
  /** Humedad relativa (%), de 0 a 100. */
  humedad: number
  /** Velocidad del viento (km/h), de 0 a 300. */
  viento: number
}

/** Cuerpo de POST /agro/simulaciones. */
export interface NuevaSimulacionApi {
  loteId: number
  etapaId: number
  datosClimaticos: DatoClimaticoEntrada[]
  riesgoObservado: NivelRiesgoChinche
  /** Hasta 2000 caracteres. */
  observaciones?: string
}

/** Un día del clima guardado con la simulación. */
export interface DatoClimaticoApi {
  id: number
  /** Fecha en formato YYYY-MM-DD. */
  fecha: string
  /** Texto decimal (°C). */
  temperatura: string
  /** Texto decimal (mm). */
  precipitacion: string
  /** Texto decimal (%). */
  humedad: string
  /** Texto decimal (km/h). */
  viento: string
  fuente: FuenteClimatica
  proveedor: string | null
}

export interface FuenteConsultadaApi {
  titulo: string
  /** Por ejemplo "pág. 3". */
  referencia?: string
}

/** Recomendación agronómica generada para la simulación (IA o reglas locales). */
export interface RecomendacionApi {
  id: number
  resumen: string
  analisisDetallado: string
  analisisEtapaFenologica: string
  analisisClimatico: string
  analisisSanitario: string
  /** Lo más importante: qué hacer, cuándo, dónde y con qué criterio. */
  recomendacionPrincipal: string
  nivelRiesgo: NivelRiesgoChinche
  prioridad: PrioridadRecomendacion
  nivelConfianza: NivelConfianza
  factoresRiesgo: string[]
  factoresAtenuantes: string[]
  /** Pasos ordenados con su fecha. */
  accionesSugeridas: string[]
  datosFaltantes: string[]
  advertencias: string[]
  fuentesConsultadas: FuenteConsultadaApi[]
  /** JSON completo devuelto por el generador, para auditoría. */
  respuestaOriginal: string | null
  /** Modelo de IA utilizado, o "reglas-locales" si no se usó IA. */
  modeloIa: string | null
  /** Fecha y hora ISO. */
  fechaGeneracion: string | null
}

/** Usuario que creó la simulación (el backend no envía la contraseña). */
export interface UsuarioSimulacionApi {
  id: number
  username: string
  email: string
  name: string
  lastname: string
}

/** Datos comunes del listado y del detalle. */
interface SimulacionBaseApi {
  id: number
  estado: EstadoSimulacion
  fuenteClimatica: FuenteClimatica
  /** Riesgo observado por el ingeniero. */
  riesgoPlaga: NivelRiesgoChinche
  observaciones: string | null
  /** Datos de la etapa copiados al simular (texto decimal). */
  gddaMinimoUtilizado: string
  gddaMaximoUtilizado: string
  frecuenciaMonitoreoUtilizada: string
  riesgoEtapaUtilizado: string
  etapa: EtapaFenologicaApi
  usuario: UsuarioSimulacionApi
  /** Fecha y hora ISO de creación. */
  createdAt: string
}

/** Elemento de GET /agro/simulaciones: el lote sin provincia ni campaña, sin clima ni recomendación. */
export interface SimulacionResumenApi extends SimulacionBaseApi {
  lote: Omit<LoteApi, 'provincia' | 'campania'>
}

/** Simulación completa: respuesta de POST /agro/simulaciones, GET /:id y del reintento. */
export interface SimulacionApi extends SimulacionBaseApi {
  lote: LoteApi
  /** Ordenados por fecha. */
  datosClimaticos: DatoClimaticoApi[]
  /** null si la simulación quedó en ERROR. */
  recomendacion: RecomendacionApi | null
}
