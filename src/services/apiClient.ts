// Cliente HTTP base para el backend de SID-Agro. Usa fetch nativo.
// Desenvuelve las respuestas exitosas ({ statusCode, message, data }) y convierte
// los errores del backend en ApiError con mensajes listos para mostrar.
import type { ApiErrorBody, ApiResponse } from '../types/api'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor. Verificá tu conexión e intentá nuevamente.'
const MENSAJE_RESPUESTA_INVALIDA = 'El servidor devolvió una respuesta inesperada.'

/** Mensajes por defecto cuando el backend no informa un error.message. */
const MENSAJES_POR_ESTADO: Record<number, string> = {
  400: 'Los datos enviados no son válidos.',
  401: 'La sesión expiró o no es válida. Iniciá sesión nuevamente.',
  403: 'No tenés permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación entra en conflicto con datos existentes.',
  503: 'El servicio no está disponible en este momento. Intentá nuevamente más tarde.',
}

/** Error de una llamada a la API. `status` es 0 cuando no hubo respuesta del servidor. */
export class ApiError extends Error {
  readonly status: number
  /** Mensajes para mostrar al usuario. Siempre tiene al menos uno. */
  readonly mensajes: string[]

  constructor(status: number, mensajes: string[]) {
    super(mensajes.join(' '))
    this.name = 'ApiError'
    this.status = status
    this.mensajes = mensajes
  }
}

// Token JWT de la sesión actual. Se guarda solo en memoria: se pierde al recargar la página.
let tokenActual: string | null = null

export function establecerToken(token: string | null): void {
  tokenActual = token
}

export function obtenerToken(): string | null {
  return tokenActual
}

// Se invoca cuando una petición enviada con token recibe 401 (token vencido o inválido).
let manejadorNoAutorizado: (() => void) | null = null

/** Registra la acción a ejecutar ante un 401 en una petición autenticada. Devuelve cómo quitarla. */
export function alRecibirNoAutorizado(manejador: () => void): () => void {
  manejadorNoAutorizado = manejador
  return () => {
    if (manejadorNoAutorizado === manejador) manejadorNoAutorizado = null
  }
}

type ValorQuery = string | number | boolean | null | undefined

interface OpcionesRequest {
  /** Query params. Los valores null o undefined se omiten. */
  query?: Record<string, ValorQuery>
  /** Cuerpo de la petición; se envía como JSON. */
  body?: unknown
  /** Permite cancelar la petición, por ejemplo al desmontar un componente. */
  signal?: AbortSignal
}

function construirUrl(path: string, query?: OpcionesRequest['query']): string {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
  if (!query) return url

  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(query)) {
    if (valor !== null && valor !== undefined) params.append(clave, String(valor))
  }
  const texto = params.toString()
  return texto ? `${url}?${texto}` : url
}

function esErrorDelBackend(valor: unknown): valor is ApiErrorBody {
  return typeof valor === 'object' && valor !== null && 'error' in valor
}

function mensajesDeError(status: number, cuerpo: unknown): string[] {
  if (esErrorDelBackend(cuerpo)) {
    const { message } = cuerpo.error
    const mensajes = (Array.isArray(message) ? message : [message]).filter(
      (m) => typeof m === 'string' && m.trim() !== '',
    )
    if (mensajes.length > 0) return mensajes
  }
  return [MENSAJES_POR_ESTADO[status] ?? `Error inesperado del servidor (código ${status}).`]
}

async function leerJson(respuesta: Response): Promise<unknown> {
  const texto = await respuesta.text()
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

async function request<T>(metodo: string, path: string, opciones: OpcionesRequest = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (opciones.body !== undefined) headers['Content-Type'] = 'application/json'
  const tokenEnviado = tokenActual
  if (tokenEnviado) headers.Authorization = `Bearer ${tokenEnviado}`

  let respuesta: Response
  try {
    respuesta = await fetch(construirUrl(path, opciones.query), {
      method: metodo,
      headers,
      body: opciones.body !== undefined ? JSON.stringify(opciones.body) : undefined,
      signal: opciones.signal,
    })
  } catch (error) {
    // La cancelación no es un error de conexión: se propaga para que quien llamó la ignore.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, [MENSAJE_SIN_CONEXION])
  }

  const cuerpo = await leerJson(respuesta)

  if (!respuesta.ok) {
    // Solo invalida la sesión si el token rechazado sigue siendo el actual.
    if (respuesta.status === 401 && tokenEnviado && tokenEnviado === tokenActual) {
      manejadorNoAutorizado?.()
    }
    throw new ApiError(respuesta.status, mensajesDeError(respuesta.status, cuerpo))
  }

  if (typeof cuerpo !== 'object' || cuerpo === null || !('data' in cuerpo)) {
    throw new ApiError(respuesta.status, [MENSAJE_RESPUESTA_INVALIDA])
  }
  return (cuerpo as ApiResponse<T>).data
}

/** Métodos HTTP del cliente. Cada uno devuelve directamente el contenido de `data`. */
export const apiClient = {
  get: <T>(path: string, opciones?: Omit<OpcionesRequest, 'body'>) =>
    request<T>('GET', path, opciones),
  post: <T>(path: string, body?: unknown, opciones?: Omit<OpcionesRequest, 'body'>) =>
    request<T>('POST', path, { ...opciones, body }),
  patch: <T>(path: string, body?: unknown, opciones?: Omit<OpcionesRequest, 'body'>) =>
    request<T>('PATCH', path, { ...opciones, body }),
}
