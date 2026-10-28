import type { ComponentType } from 'react'
import { IconBug, IconDollar, IconSprout } from '../components/icons/Icons'

export const RUTAS = {
  login: '/login',
  dashboard: '/dashboard-economico',
  simulador: '/simulador-escenarios',
  monitoreo: '/monitoreo-chinche-verde',
} as const

export interface NavItem {
  path: string
  label: string
  icon: ComponentType
}

export const NAV_ITEMS: NavItem[] = [
  { path: RUTAS.dashboard, label: 'Dashboard económico', icon: IconDollar },
  { path: RUTAS.simulador, label: 'Simulador de escenarios', icon: IconSprout },
  { path: RUTAS.monitoreo, label: 'Monitoreo de chinche verde', icon: IconBug },
]
