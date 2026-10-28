// Tipos de autenticación según POST /auth/login (ver Swagger: UsuarioLogueadoDto).

export interface Permiso {
  id: number
  /** Nombre del permiso, por ejemplo MONITOREO_GET o SIMULACION_POST. */
  name: string
}

export interface Rol {
  id: number
  /** GERENTE o INGENIERO. */
  name: string
  permission: Permiso[]
}

/** Usuario autenticado, sin el token. */
export interface UsuarioAutenticado {
  id: number
  username: string
  email: string
  name: string
  lastname: string
  isActive: boolean
  /** Puede venir null si el usuario no tiene rol asignado. */
  role: Rol | null
}

/** Contenido de `data` en la respuesta de POST /auth/login. */
export interface RespuestaLogin extends UsuarioAutenticado {
  token: string
}

export interface CredencialesLogin {
  username: string
  password: string
}
