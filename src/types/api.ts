// Formatos comunes de las respuestas del backend (ver guía de integración y Swagger en /docs).

/** Respuesta exitosa: los datos vienen siempre dentro de `data`. */
export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

/** Contenido de `data` en las listas paginadas (lotes, campañas, simulaciones). */
export interface Paginado<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** Con `takeAll=true` la lista no se pagina y solo viene `data`. */
export interface ListaCompleta<T> {
  data: T[]
}

/** Query params de las listas paginadas. `limit` admite como máximo 100. */
export interface ParametrosPaginacion {
  page?: number
  limit?: number
  takeAll?: boolean
}

/** Cuerpo de una respuesta de error. `error.message` puede ser un texto o una lista (validaciones). */
export interface ApiErrorBody {
  success: false
  statusCode: number
  method: string
  path: string
  error: {
    message: string | string[]
    error: string
    timestamp: string
  }
}
