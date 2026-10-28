import { ApiError } from '../../services/apiClient'

export interface ErrorCarga {
  mensaje: string
  /** Si tiene sentido ofrecer volver a intentar. */
  reintentable: boolean
}

/** Traduce un error de la API del monitoreo a un mensaje para el usuario. */
export function describirError(error: unknown, recurso: string): ErrorCarga {
  if (!(error instanceof ApiError)) {
    return { mensaje: `No se pudo cargar ${recurso}.`, reintentable: true }
  }
  switch (error.status) {
    case 0:
      return { mensaje: error.mensajes.join(' '), reintentable: true }
    case 403:
      return { mensaje: `Tu usuario no tiene permiso para consultar ${recurso}.`, reintentable: false }
    case 404:
      return { mensaje: 'El lote seleccionado ya no existe. Recargá la página para actualizar la lista.', reintentable: false }
    case 503:
      return {
        mensaje: 'El proveedor de datos climáticos no respondió. Intentá nuevamente en unos minutos.',
        reintentable: true,
      }
    case 400:
      return { mensaje: error.mensajes.join(' '), reintentable: false }
    default:
      return { mensaje: error.mensajes.join(' '), reintentable: true }
  }
}
