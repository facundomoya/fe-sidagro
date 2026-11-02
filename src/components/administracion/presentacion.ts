// Textos de la administración de usuarios pensados para la Gerencia. Los nombres reales de los
// roles y permisos del backend se siguen usando internamente; acá solo se traducen para mostrarlos.
import type { PermisoApi, UsuarioApi } from '../../types/administracion'

export function nombreCompleto(usuario: Pick<UsuarioApi, 'name' | 'lastname' | 'username'>): string {
  return `${usuario.name} ${usuario.lastname}`.trim() || usuario.username
}

export const ESTADO_USUARIO = {
  activo: { texto: 'Activo', clase: 'badge badge--success' },
  inactivo: { texto: 'Inactivo', clase: 'badge badge--danger' },
} as const

const ROLES: Record<string, { nombre: string; descripcion: string }> = {
  GERENTE: {
    nombre: 'Gerente',
    descripcion: 'Administra los usuarios y accede a todas las funcionalidades del sistema.',
  },
  INGENIERO: {
    nombre: 'Ingeniero Agrónomo',
    descripcion: 'Trabaja con lotes, campañas, monitoreo de chinche verde y simulaciones agrícolas.',
  },
}

/** Nombre del rol para mostrar; un rol desconocido se muestra como lo informa el sistema. */
export function nombreRol(rol: { name: string } | null | undefined): string {
  if (!rol) return 'Sin rol'
  return ROLES[rol.name]?.nombre ?? rol.name
}

export function descripcionRol(rol: { name: string; description: string | null }): string | null {
  return ROLES[rol.name]?.descripcion ?? rol.description ?? null
}

interface Acceso {
  /** Nombre del permiso en el backend. */
  permiso: string
  etiqueta: string
  descripcion?: string
}

interface GrupoDefinido {
  titulo: string
  accesos: Acceso[]
  /**
   * No se muestra ni se puede modificar desde la interfaz. Sus permisos siguen siendo parte del
   * rol y se conservan al guardar otros cambios.
   */
  oculto?: boolean
}

const SIN_PANTALLA = 'Hoy no se usa en ninguna pantalla de SID-Agro.'

// Todos los permisos de ValidPermissions del backend, agrupados por área y con un nombre claro.
const GRUPOS: GrupoDefinido[] = [
  {
    titulo: 'Administración de usuarios',
    accesos: [
      { permiso: 'USER_GET_ALL', etiqueta: 'Consultar usuarios' },
      { permiso: 'USER_POST', etiqueta: 'Crear usuarios' },
      {
        permiso: 'USER_PUT',
        etiqueta: 'Modificar usuarios',
        descripcion: 'Datos personales, contraseña, rol y reactivación.',
      },
      { permiso: 'USER_DELETE', etiqueta: 'Dar de baja usuarios' },
      {
        permiso: 'ROLE_GET_ALL',
        etiqueta: 'Consultar roles',
        descripcion: 'También es necesario para elegir el rol al crear o modificar usuarios.',
      },
      { permiso: 'ROLE_GET_ONE', etiqueta: 'Consultar los accesos de cada rol' },
      { permiso: 'ROLE_PUT', etiqueta: 'Administrar los accesos de los roles' },
      { permiso: 'ROLE_DELETE', etiqueta: 'Eliminar roles' },
      {
        permiso: 'PERMISSION_GET_ALL',
        etiqueta: 'Consultar las funcionalidades disponibles',
        descripcion: 'Necesario para administrar los accesos de los roles.',
      },
    ],
  },
  {
    titulo: 'Lotes y campañas',
    accesos: [
      {
        permiso: 'AGRO_PARAM_GET',
        etiqueta: 'Consultar lotes, campañas y datos de referencia',
        descripcion: 'Necesario también para usar el Monitoreo y el Simulador.',
      },
      { permiso: 'CAMPANIA_POST', etiqueta: 'Crear campañas' },
      { permiso: 'LOTE_POST', etiqueta: 'Crear lotes' },
      {
        permiso: 'LOTE_PUT',
        etiqueta: 'Modificar lotes',
        descripcion: 'Fecha de siembra, datos productivos y departamento.',
      },
    ],
  },
  {
    titulo: 'Monitoreo de chinche verde',
    accesos: [
      {
        permiso: 'MONITOREO_GET',
        etiqueta: 'Consultar el monitoreo',
        descripcion: 'Indicadores, clima e historial de observaciones de cada lote.',
      },
      { permiso: 'MONITOREO_POST', etiqueta: 'Registrar observaciones' },
    ],
  },
  {
    titulo: 'Simulador de escenarios',
    accesos: [
      {
        permiso: 'SIMULACION_POST',
        etiqueta: 'Ejecutar simulaciones',
        descripcion: 'Incluye volver a solicitar la recomendación.',
      },
      { permiso: 'SIMULACION_GET_ALL', etiqueta: 'Consultar el historial de simulaciones' },
      { permiso: 'SIMULACION_GET_ONE', etiqueta: 'Consultar el detalle de una simulación' },
    ],
  },
  {
    titulo: 'Dashboard económico',
    accesos: [
      {
        permiso: 'ECONOMICO_GET',
        etiqueta: 'Consultar información económica',
        descripcion: 'Indicadores, precio de la soja e historial de costos.',
      },
      { permiso: 'COSTO_POST', etiqueta: 'Registrar costos de producción' },
    ],
  },
  {
    titulo: 'Otras funciones administrativas',
    oculto: true,
    accesos: [
      { permiso: 'AUDIT_GET_ALL', etiqueta: 'Consultar la auditoría del sistema' },
      { permiso: 'USER_GET_ONE', etiqueta: 'Consultar los datos de un usuario', descripcion: SIN_PANTALLA },
      { permiso: 'ROLE_POST', etiqueta: 'Crear roles', descripcion: SIN_PANTALLA },
      { permiso: 'PERMISSION_GET_ONE', etiqueta: 'Consultar una funcionalidad', descripcion: SIN_PANTALLA },
      { permiso: 'PERMISSION_POST', etiqueta: 'Crear funcionalidades', descripcion: SIN_PANTALLA },
      { permiso: 'PERMISSION_PUT', etiqueta: 'Modificar funcionalidades', descripcion: SIN_PANTALLA },
      { permiso: 'PERMISSION_DELETE', etiqueta: 'Eliminar funcionalidades', descripcion: SIN_PANTALLA },
    ],
  },
]

export interface AccesoVisible {
  permiso: PermisoApi
  etiqueta: string
  descripcion?: string
}

export interface GrupoAccesos {
  titulo: string
  accesos: AccesoVisible[]
}

const VISIBLES = GRUPOS.filter((g) => !g.oculto)
const NOMBRES_VISIBLES = new Set(VISIBLES.flatMap((g) => g.accesos.map((a) => a.permiso)))

/**
 * Si el acceso se muestra y se puede modificar desde la interfaz. Los de grupos ocultos y los que
 * SID-Agro no reconoce quedan fuera: no se muestran, pero se conservan tal cual en el rol.
 */
export function esAccesoVisible(permiso: PermisoApi): boolean {
  return NOMBRES_VISIBLES.has(permiso.name)
}

/** Accesos visibles agrupados por área, con su nombre claro y en el orden de GRUPOS. */
export function agruparAccesos(permisos: PermisoApi[]): GrupoAccesos[] {
  const porNombre = new Map(permisos.map((p) => [p.name, p]))
  return VISIBLES.map(({ titulo, accesos }) => ({
    titulo,
    accesos: accesos.flatMap(({ permiso, etiqueta, descripcion }) => {
      const encontrado = porNombre.get(permiso)
      return encontrado ? [{ permiso: encontrado, etiqueta, descripcion }] : []
    }),
  })).filter((g) => g.accesos.length > 0)
}

/** Nombre claro de un permiso, para las listas de cambios. */
export function etiquetaAcceso(permiso: PermisoApi): string {
  for (const grupo of GRUPOS) {
    const acceso = grupo.accesos.find((a) => a.permiso === permiso.name)
    if (acceso) return acceso.etiqueta
  }
  return permiso.description || 'Acceso adicional del sistema'
}

/** Accesos para administrar usuarios, roles y funcionalidades. */
export function esPermisoAdministrativo(nombre: string): boolean {
  return ['USER_', 'ROLE_', 'PERMISSION_'].some((prefijo) => nombre.startsWith(prefijo))
}
