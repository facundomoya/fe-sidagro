// Lógica del historial de simulaciones. El backend no ordena el listado ni permite filtrarlo
// por query (el ValidationPipe descarta parámetros desconocidos), por eso se hace aquí.
import type { SimulacionResumenApi } from '../../types/simulacionApi'

/** Lotes presentes en el historial, para el filtro. Incluye lotes que ya no están activos. */
export interface LoteHistorial {
  id: number
  nombre: string
}

/** De la más reciente a la más antigua; ante la misma fecha, la de mayor número primero. */
export function ordenarHistorial(simulaciones: SimulacionResumenApi[]): SimulacionResumenApi[] {
  return [...simulaciones].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id,
  )
}

/** Agrega o reemplaza una simulación (creada o reintentada) sin volver a consultar el listado. */
export function actualizarHistorial(
  historial: SimulacionResumenApi[],
  simulacion: SimulacionResumenApi,
): SimulacionResumenApi[] {
  return ordenarHistorial([...historial.filter((s) => s.id !== simulacion.id), simulacion])
}

export function lotesDelHistorial(simulaciones: SimulacionResumenApi[]): LoteHistorial[] {
  const lotes = new Map<number, LoteHistorial>()
  simulaciones.forEach(({ lote }) => lotes.set(lote.id, { id: lote.id, nombre: lote.nombre }))
  return [...lotes.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}
