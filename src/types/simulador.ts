/**
 * Configuración de un escenario puntual a simular.
 * Las variables climáticas y del cultivo se agregarán cuando se definan las entradas del motor.
 */
export interface ConfiguracionEscenario {
  loteId: string
  /** Fecha del escenario en formato ISO (YYYY-MM-DD). */
  fecha: string
}

/** Valor de una variable de entrada o de salida del motor. */
export type ValorVariable = string | number | boolean | null

/**
 * Conjunto de variables con nombre. Se usa mientras no estén definidas
 * las entradas y salidas del motor de simulación.
 */
export type VariablesSimulacion = Record<string, ValorVariable>

export interface ResultadoRiesgoSimulacion {
  /** Nivel de riesgo informado por el motor, tal como lo devuelva. */
  nivel: string | null
  /** Otros valores de salida del motor. */
  valores: VariablesSimulacion
}

export interface NuevaSimulacion {
  loteId: string
  nombreEscenario: string
  /** Fecha del escenario simulado (YYYY-MM-DD). */
  fechaSimulada: string
  /** Fecha y hora de ejecución de la simulación (ISO). */
  fechaEjecucion: string
  condicionesEntrada: VariablesSimulacion
  resultadoRiesgo: ResultadoRiesgoSimulacion
  /** Recomendación generada a partir del resultado, si existe. */
  recomendacion: string | null
}

export interface SimulacionGuardada extends NuevaSimulacion {
  id: string
}
