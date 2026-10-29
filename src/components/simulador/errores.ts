import { ApiError } from '../../services/apiClient'

export type AccionSimulacion = 'crear' | 'reintentar' | 'consultar'

const FALLA_GENERICA: Record<AccionSimulacion, string> = {
  crear: 'No se pudo ejecutar la simulación. Intentá nuevamente.',
  reintentar: 'No se pudo reintentar la recomendación. Intentá nuevamente.',
  consultar: 'No se pudo consultar la simulación. Intentá nuevamente.',
}

/** Traduce un error de /agro/simulaciones a un mensaje para el usuario. */
export function mensajeErrorSimulacion(error: unknown, accion: AccionSimulacion): string {
  if (!(error instanceof ApiError)) return FALLA_GENERICA[accion]
  const detalle = error.mensajes.join(' ')

  switch (error.status) {
    case 0:
      // Sin respuesta no se sabe si el backend llegó a guardar el escenario.
      return accion === 'crear'
        ? `${detalle} Es posible que el servidor haya guardado el escenario aunque no llegó la respuesta.`
        : detalle
    case 400:
      return `Revisá los datos del escenario: ${detalle}`
    case 401:
      return 'Tu sesión expiró. Iniciá sesión nuevamente.'
    case 403:
      return accion === 'consultar'
        ? 'Tu usuario no tiene permiso para consultar simulaciones.'
        : 'Tu usuario no tiene permiso para crear simulaciones.'
    case 404:
      return accion === 'crear'
        ? `${detalle} Recargá la página para actualizar los lotes y las etapas.`
        : 'La simulación ya no existe.'
    case 503:
      return 'No fue posible generar la recomendación. El escenario sigue guardado: intentá nuevamente en unos minutos.'
    default:
      return detalle || FALLA_GENERICA[accion]
  }
}
