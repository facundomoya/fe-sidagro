// Tipos del módulo económico según el backend (be-sidagro: economico/economico.service.ts y
// economico/calculo-economico.ts). Unidades: superficie en ha, rendimiento en t/ha, precio en
// USD/t y costo en USD/ha. Los cálculos los hace el backend; el frontend solo los muestra.

export type ResultadoEconomico = 'GANANCIA' | 'PERDIDA' | 'EQUILIBRIO'

/** Precio de referencia de la soja (pizarra de Rosario). Los importes llegan como números. */
export interface PrecioSojaApi {
  /** Fecha de la cotización, YYYY-MM-DD. */
  fecha: string
  /** USD por tonelada. */
  valor: number
  moneda: string
  /** Equivalente en pesos argentinos, si la fuente lo informa. */
  valorPesos: number | null
  tipoCambio: number | null
  fuente: string
  /** true si la fuente no respondió y se usa el último precio guardado. */
  desactualizado: boolean
  aviso: string | null
}

/** Costo de producción vigente. Es la entidad completa: los decimales llegan como texto. */
export interface CostoProduccionApi {
  id: number
  /** USD por hectárea, por ejemplo "925.00". */
  costoPorHectarea: string | number
  /** YYYY-MM-DD. */
  vigenciaDesde: string
  fuente: string | null
  detalle: string | null
}

export interface IndicadoresEconomicosApi {
  /** Toneladas esperadas en todo el lote. */
  produccionEstimada: number
  ingresoPorHectarea: number
  costoPorHectarea: number
  /** Negativo si se pierde. */
  gananciaPorHectarea: number
  ingresoTotal: number
  costoTotal: number
  gananciaTotal: number
  /** Ganancia sobre el costo, en porcentaje. */
  rentabilidad: number
  resultado: ResultadoEconomico
}

/** Datos del lote que necesita el cálculo económico. */
export type DatoFaltante = 'superficie' | 'rendimiento'

export interface LoteEconomicoApi {
  lote: {
    id: number
    nombre: string
    /** Nombre de la provincia. */
    provincia: string | null
    /** Nombre de la campaña. */
    campania: string | null
    /** Hectáreas. */
    superficie: number | null
    /** Rendimiento esperado en t/ha. */
    rendimiento: number | null
  }
  /** null si falta algún dato del lote: el lote no se incluye en los totales. */
  indicadores: IndicadoresEconomicosApi | null
  faltantes: DatoFaltante[]
}

/** Totales de los lotes calculados (los incompletos no se suman). */
export interface TotalesEconomicosApi {
  lotesCalculados: number
  lotesIncompletos: number
  /** Hectáreas de los lotes calculados. */
  superficie: number
  /** Toneladas. */
  produccionEstimada: number
  ingresoTotal: number
  costoTotal: number
  gananciaTotal: number
  /** Porcentaje; null si el costo total es cero (por ejemplo, sin lotes calculados). */
  rentabilidad: number | null
  lotesConGanancia: number
  lotesConPerdida: number
}

/** Respuesta de GET /agro/economico/dashboard. */
export interface DashboardEconomicoApi {
  precioSoja: PrecioSojaApi
  costoProduccion: CostoProduccionApi
  /** t/ha necesarias para cubrir el costo al precio actual. */
  rendimientoIndiferencia: number
  totales: TotalesEconomicosApi
  /** Ordenados por nombre. */
  lotes: LoteEconomicoApi[]
  avisos: string[]
}

/** Cuerpo de POST /agro/economico/costos (CreateCostoDto). */
export interface NuevoCostoApi {
  /** USD/ha, mayor que cero y con dos decimales como máximo. */
  costoPorHectarea: number
  /** YYYY-MM-DD. Responde 409 si ya hay un costo con esa fecha. */
  vigenciaDesde: string
  /** Hasta 255 caracteres. */
  fuente?: string
  /** Hasta 2000 caracteres. */
  detalle?: string
}

/** Query params de GET /agro/economico/dashboard. Sin valor, el filtro no se envía. */
export interface FiltrosDashboardEconomico {
  campaniaId?: number
  provinciaId?: number
}
