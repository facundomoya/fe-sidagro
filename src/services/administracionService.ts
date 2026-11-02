// Servicio de la administración de usuarios, roles y permisos contra el backend (/user, /role y
// /permission). Cada función exige el permiso indicado; el backend lo controla en cada petición.
import { apiClient } from './apiClient'
import type { ListaCompleta, Paginado } from '../types/api'
import type {
  CambiosUsuarioApi,
  NuevoUsuarioApi,
  PermisoApi,
  RolApi,
  RolConPermisosApi,
  UsuarioApi,
} from '../types/administracion'

/** Una página de usuarios con su rol (USER_GET_ALL). `limit` admite como máximo 100. */
export function obtenerUsuarios(
  pagina: { page: number; limit: number },
  signal?: AbortSignal,
): Promise<Paginado<UsuarioApi>> {
  return apiClient.get<Paginado<UsuarioApi>>('/user', { query: pagina, signal })
}

/** Todos los usuarios, sin paginar (USER_GET_ALL). Se usa para saber qué usuarios tiene cada rol. */
export async function obtenerTodosLosUsuarios(signal?: AbortSignal): Promise<UsuarioApi[]> {
  const { data } = await apiClient.get<ListaCompleta<UsuarioApi>>('/user', {
    query: { takeAll: true },
    signal,
  })
  return data
}

/** Crea un usuario (USER_POST). 409 si el usuario o el correo ya existen; 404 si el rol no existe. */
export function crearUsuario(usuario: NuevoUsuarioApi): Promise<UsuarioApi> {
  return apiClient.post<UsuarioApi>('/user/register', usuario)
}

/** Modifica datos, contraseña o estado de un usuario (USER_PUT). Solo se envían los cambios. */
export function modificarUsuario(id: number, cambios: CambiosUsuarioApi): Promise<UsuarioApi> {
  return apiClient.patch<UsuarioApi>(`/user/${id}`, cambios)
}

/** Asigna el rol del usuario, que reemplaza al anterior (USER_PUT). */
export function asignarRol(usuarioId: number, rolId: number): Promise<UsuarioApi> {
  return apiClient.post<UsuarioApi>(`/user/${usuarioId}/add/role/${rolId}`)
}

/**
 * Da de baja a un usuario (USER_DELETE). No lo borra: lo deja inactivo. El backend no permite
 * darse de baja a uno mismo ni dar de baja a un usuario ya inactivo (400).
 */
export function darDeBajaUsuario(id: number): Promise<UsuarioApi> {
  return apiClient.delete<UsuarioApi>(`/user/${id}`)
}

/** Roles sin sus permisos (ROLE_GET_ALL). El backend devuelve solo la primera página de 10. */
export function obtenerRoles(signal?: AbortSignal): Promise<Paginado<RolApi>> {
  return apiClient.get<Paginado<RolApi>>('/role', { signal })
}

/** Un rol con sus permisos (ROLE_GET_ONE). */
export function obtenerRol(id: number, signal?: AbortSignal): Promise<RolConPermisosApi | null> {
  return apiClient.get<RolConPermisosApi | null>(`/role/${id}`, { signal })
}

/**
 * Deja en el rol exactamente estos permisos (ROLE_PUT). Aunque la ruta dice "add", el backend
 * reemplaza la lista completa, así que hay que enviar también los que se conservan.
 */
export function establecerPermisosRol(id: number, permisoIds: number[]): Promise<RolConPermisosApi> {
  return apiClient.post<RolConPermisosApi>(`/role/${id}/add/permissions`, { ids: permisoIds })
}

/** Elimina un rol con borrado lógico (ROLE_DELETE). */
export function eliminarRol(id: number): Promise<unknown> {
  return apiClient.delete<unknown>(`/role/${id}`)
}

/** Catálogo completo de permisos (PERMISSION_GET_ALL). */
export async function obtenerPermisos(signal?: AbortSignal): Promise<PermisoApi[]> {
  const { data } = await apiClient.get<ListaCompleta<PermisoApi>>('/permission', {
    query: { takeAll: true },
    signal,
  })
  return data
}
