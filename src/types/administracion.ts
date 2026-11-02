// Tipos de la administración de usuarios, roles y permisos según el backend
// (be-sidagro: user/, role/ y permission/). Las fechas llegan como texto ISO.

/** Permiso del catálogo (GET /permission). */
export interface PermisoApi {
  id: number
  /** Nombre técnico, por ejemplo USER_GET_ALL. */
  name: string
  description: string | null
  /** Campo genérico de la base; el backend no lo usa para autorizar. */
  enabled: boolean
}

/** Rol tal como lo lista GET /role, sin sus permisos. */
export interface RolApi {
  id: number
  name: string
  description: string | null
  enabled: boolean
}

/** Rol con sus permisos (GET /role/:id y POST /role/:id/add/permissions). */
export interface RolConPermisosApi extends RolApi {
  permission: PermisoApi[]
}

/** Usuario de GET /user. El backend nunca envía la contraseña. */
export interface UsuarioApi {
  id: number
  username: string
  email: string
  name: string
  lastname: string
  /** false = dado de baja: no puede iniciar sesión ni usar el sistema. */
  isActive: boolean
  /** Campo genérico de la base; el backend no lo usa para autorizar. */
  enabled: boolean
  /** Campo libre sin uso en el sistema. */
  type: string | null
  createdAt: string
  /** null si el usuario no tiene rol: el backend le rechaza todas las operaciones. */
  role: RolApi | null
}

/** Cuerpo de POST /user/register (CreateUserDto). */
export interface NuevoUsuarioApi {
  /** Al menos 4 caracteres; único. */
  username: string
  /** Al menos 6 caracteres. */
  password: string
  /** Formato de correo válido; único. */
  email: string
  name: string
  lastname: string
  roleId: number
}

/**
 * Cuerpo de PATCH /user/:id (UpdateUserDto, parcial). Solo se envían los campos que cambian:
 * si ningún valor cambia, la base informa 0 filas modificadas y el backend responde 404.
 */
export interface CambiosUsuarioApi {
  username?: string
  email?: string
  name?: string
  lastname?: string
  password?: string
  isActive?: boolean
}

/** Cuerpo de POST /role/:id/add/permissions: la lista COMPLETA de permisos que queda en el rol. */
export interface PermisosRolApi {
  ids: number[]
}
