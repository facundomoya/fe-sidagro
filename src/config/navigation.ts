import type { ComponentType } from 'react'
import { IconBug, IconDollar, IconMap, IconSprout, IconUsers } from '../components/icons/Icons'
import { PERMISOS, cumpleRequisito, type ConsultaPermiso, type RequisitoAcceso } from '../auth/permisos'

export const RUTAS = {
  login: '/login',
  inicio: '/inicio',
  dashboard: '/dashboard-economico',
  simulador: '/simulador-escenarios',
  monitoreo: '/monitoreo-chinche-verde',
  lotesCampanias: '/lotes-y-campanias',
  administracion: '/administracion-usuarios',
} as const

/** Estado de navegación para abrir «Lotes y campañas» en el formulario de datos productivos. */
export interface EstadoCompletarDatos {
  completarDatosLoteId: number
}

export interface NavItem {
  path: string
  label: string
  icon: ComponentType
  /** Permisos necesarios para ver la opción y entrar a su ruta. */
  acceso: RequisitoAcceso
}

const SIMULACION = [
  PERMISOS.crearSimulacion,
  PERMISOS.listarSimulaciones,
  PERMISOS.consultarSimulacion,
]

/**
 * Permisos de cada sección, iguales para el menú y para la ruta. Son los que exigen los
 * endpoints del backend que la sección consulta al abrirse.
 */
export const ACCESO = {
  // Basta con poder consultar usuarios o roles; cada pestaña exige el suyo.
  administracion: { alguno: [PERMISOS.listarUsuarios, PERMISOS.listarRoles] },
  lotesCampanias: { todos: [PERMISOS.consultarCatalogo] },
  monitoreo: { todos: [PERMISOS.consultarCatalogo, PERMISOS.consultarMonitoreo] },
  // Los lotes y etapas son obligatorios; de la simulación alcanza con cualquiera de sus permisos.
  simulador: { todos: [PERMISOS.consultarCatalogo], alguno: SIMULACION },
  dashboard: { todos: [PERMISOS.consultarEconomico] },
} satisfies Record<string, RequisitoAcceso>

// Orden del menú lateral, de arriba hacia abajo.
export const NAV_ITEMS: NavItem[] = [
  {
    path: RUTAS.administracion,
    label: 'Administración de usuarios',
    icon: IconUsers,
    acceso: ACCESO.administracion,
  },
  {
    path: RUTAS.lotesCampanias,
    label: 'Lotes y campañas',
    icon: IconMap,
    acceso: ACCESO.lotesCampanias,
  },
  {
    path: RUTAS.monitoreo,
    label: 'Monitoreo de chinche verde',
    icon: IconBug,
    acceso: ACCESO.monitoreo,
  },
  {
    path: RUTAS.simulador,
    label: 'Simulador de escenarios',
    icon: IconSprout,
    acceso: ACCESO.simulador,
  },
  {
    path: RUTAS.dashboard,
    label: 'Dashboard económico',
    icon: IconDollar,
    acceso: ACCESO.dashboard,
  },
]

/** Opciones del menú a las que el usuario puede entrar, en el orden del menú. */
export function seccionesDisponibles(tienePermiso: ConsultaPermiso): NavItem[] {
  return NAV_ITEMS.filter((item) => cumpleRequisito(tienePermiso, item.acceso))
}

/**
 * Prioridad para sugerir una sección (por ejemplo, desde la pantalla sin permiso). Es distinta
 * del orden del menú: la Administración figura primera, pero se sugiere solo si no hay otra.
 */
const PRIORIDAD_INICIAL: string[] = [
  RUTAS.dashboard,
  RUTAS.lotesCampanias,
  RUTAS.monitoreo,
  RUTAS.simulador,
  RUTAS.administracion,
]

/** Primera sección habilitada según PRIORIDAD_INICIAL; null si no tiene acceso a ninguna. */
export function rutaInicial(tienePermiso: ConsultaPermiso): string | null {
  const disponibles = new Set(seccionesDisponibles(tienePermiso).map((item) => item.path))
  return PRIORIDAD_INICIAL.find((path) => disponibles.has(path)) ?? null
}
