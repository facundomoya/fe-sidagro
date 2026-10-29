import { ApiError } from '../../services/apiClient'
import type { ErrorCarga } from '../monitoreo/errores'

export const MENSAJE_SIN_PERMISO =
  'Tu usuario no tiene permiso para consultar el Dashboard económico. Si te asignaron el permiso recientemente, cerrá sesión y volvé a ingresar.'

export interface ErrorDashboard extends ErrorCarga {
  /** 409: no hay un costo de producción vigente. */
  sinCostoVigente?: boolean
}

/** Traduce un error de GET /agro/economico/dashboard a un mensaje para el usuario. */
export function describirErrorDashboard(error: unknown): ErrorDashboard {
  if (!(error instanceof ApiError)) {
    return { mensaje: 'No se pudo cargar el Dashboard económico.', reintentable: true }
  }
  switch (error.status) {
    case 401:
      return { mensaje: 'La sesión expiró. Iniciá sesión nuevamente.', reintentable: false }
    case 403:
      return { mensaje: MENSAJE_SIN_PERMISO, reintentable: false }
    case 409:
      return {
        mensaje:
          'No hay un costo de producción vigente, por lo que no se pueden calcular los indicadores económicos. Debe registrarse un costo con fecha de vigencia igual o anterior a hoy.',
        reintentable: true,
        sinCostoVigente: true,
      }
    case 503:
      return {
        mensaje:
          'No se pudo obtener el precio de referencia de la soja y no hay precios guardados para usar en su lugar. Intentá nuevamente en unos minutos.',
        reintentable: true,
      }
    case 400:
      return {
        mensaje: `Los filtros seleccionados no son válidos: ${error.mensajes.join(' ')}`,
        reintentable: false,
      }
    default:
      // Incluye los errores de conexión (status 0), con su mensaje del cliente HTTP.
      return { mensaje: error.mensajes.join(' '), reintentable: true }
  }
}
