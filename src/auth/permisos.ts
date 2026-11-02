// Permisos del backend (ValidPermissions) que usa el frontend para mostrar u ocultar acciones.
// El backend vuelve a controlarlos en cada petición: ocultar una opción no reemplaza esa
// autorización. El frontend decide siempre por permisos, nunca por el nombre del rol.
export const PERMISOS = {
  consultarCatalogo: 'AGRO_PARAM_GET',
  crearCampania: 'CAMPANIA_POST',
  crearLote: 'LOTE_POST',
  modificarLote: 'LOTE_PUT',
  consultarMonitoreo: 'MONITOREO_GET',
  registrarObservacion: 'MONITOREO_POST',
  crearSimulacion: 'SIMULACION_POST',
  listarSimulaciones: 'SIMULACION_GET_ALL',
  consultarSimulacion: 'SIMULACION_GET_ONE',
  consultarEconomico: 'ECONOMICO_GET',
  registrarCosto: 'COSTO_POST',
  listarUsuarios: 'USER_GET_ALL',
  crearUsuario: 'USER_POST',
  modificarUsuario: 'USER_PUT',
  desactivarUsuario: 'USER_DELETE',
  listarRoles: 'ROLE_GET_ALL',
  consultarRol: 'ROLE_GET_ONE',
  modificarRol: 'ROLE_PUT',
  eliminarRol: 'ROLE_DELETE',
  listarPermisos: 'PERMISSION_GET_ALL',
} as const

export type ConsultaPermiso = (permiso: string) => boolean

/**
 * Permisos necesarios para acceder a una sección: todos los de `todos` y, si se indica
 * `alguno`, al menos uno de esa lista.
 */
export interface RequisitoAcceso {
  todos?: readonly string[]
  alguno?: readonly string[]
}

export function tieneTodos(tienePermiso: ConsultaPermiso, permisos: readonly string[]): boolean {
  return permisos.every((permiso) => tienePermiso(permiso))
}

export function tieneAlguno(tienePermiso: ConsultaPermiso, permisos: readonly string[]): boolean {
  return permisos.some((permiso) => tienePermiso(permiso))
}

export function cumpleRequisito(tienePermiso: ConsultaPermiso, requisito: RequisitoAcceso): boolean {
  const { todos = [], alguno } = requisito
  return tieneTodos(tienePermiso, todos) && (!alguno || tieneAlguno(tienePermiso, alguno))
}
