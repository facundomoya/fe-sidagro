import { ApiError } from '../../services/apiClient'
import type { ErrorCarga } from '../monitoreo/errores'

/** Traduce un error al consultar los listados de la sección. */
export function errorDeCarga(error: unknown, recurso: string): ErrorCarga {
  if (!(error instanceof ApiError)) {
    return { mensaje: `No se pudo cargar ${recurso}.`, reintentable: true }
  }
  switch (error.status) {
    case 401:
      return { mensaje: 'La sesión expiró. Iniciá sesión nuevamente.', reintentable: false }
    case 403:
      return { mensaje: `Tu usuario no tiene permiso para consultar ${recurso}.`, reintentable: false }
    default:
      return { mensaje: error.mensajes.join(' '), reintentable: true }
  }
}

interface MensajesGuardado {
  /** Qué se intentaba hacer, por ejemplo "crear campañas". */
  accion: string
  /** Qué dato dejó de existir cuando el backend responde 404. */
  noEncontrado: string
  /** Conflicto con datos existentes (409). */
  conflicto?: string
}

/** Traduce un error al guardar. El formulario queda abierto para corregir y reintentar. */
export function mensajeErrorGuardado(error: unknown, mensajes: MensajesGuardado): string {
  if (!(error instanceof ApiError)) return `No se pudo ${mensajes.accion}. Intentá nuevamente.`
  switch (error.status) {
    case 400:
      return `El servidor rechazó los datos: ${error.mensajes.join(' ')}`
    case 401:
      return 'La sesión expiró. Iniciá sesión nuevamente.'
    case 403:
      return `Tu usuario no tiene permiso para ${mensajes.accion}.`
    case 404:
      return mensajes.noEncontrado
    case 409:
      return mensajes.conflicto ?? error.mensajes.join(' ')
    default:
      return error.mensajes.join(' ')
  }
}
