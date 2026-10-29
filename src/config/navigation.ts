import type { ComponentType } from 'react'
import { IconBug, IconDollar, IconMap, IconSprout } from '../components/icons/Icons'
import { PERMISOS } from '../auth/permisos'

export const RUTAS = {
  login: '/login',
  dashboard: '/dashboard-economico',
  simulador: '/simulador-escenarios',
  monitoreo: '/monitoreo-chinche-verde',
  lotesCampanias: '/lotes-y-campanias',
} as const

/** Estado de navegación para abrir «Lotes y campañas» en el formulario de datos productivos. */
export interface EstadoCompletarDatos {
  completarDatosLoteId: number
}

export interface NavItem {
  path: string
  label: string
  icon: ComponentType
  /** Si se indica, la opción solo se muestra a usuarios con ese permiso. */
  permiso?: string
}

// Orden del menú lateral, de arriba hacia abajo.
export const NAV_ITEMS: NavItem[] = [
  {
    path: RUTAS.lotesCampanias,
    label: 'Lotes y campañas',
    icon: IconMap,
    permiso: PERMISOS.consultarCatalogo,
  },
  { path: RUTAS.monitoreo, label: 'Monitoreo de chinche verde', icon: IconBug },
  { path: RUTAS.simulador, label: 'Simulador de escenarios', icon: IconSprout },
  {
    path: RUTAS.dashboard,
    label: 'Dashboard económico',
    icon: IconDollar,
    permiso: PERMISOS.consultarEconomico,
  },
]

/**
 * Pantalla a la que se llega después del login o con una dirección desconocida: el Dashboard
 * económico si el usuario puede consultarlo, si no la primera opción del menú que tenga habilitada.
 */
export function rutaInicial(tienePermiso: (permiso: string) => boolean): string {
  const disponible = (item: NavItem) => !item.permiso || tienePermiso(item.permiso)
  const dashboard = NAV_ITEMS.find((item) => item.path === RUTAS.dashboard)
  if (dashboard && disponible(dashboard)) return dashboard.path
  return NAV_ITEMS.find(disponible)?.path ?? RUTAS.monitoreo
}
