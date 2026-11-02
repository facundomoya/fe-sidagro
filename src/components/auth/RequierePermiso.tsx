import type { ReactNode } from 'react'
import { useAuth } from '../../auth/useAuth'
import { cumpleRequisito, type RequisitoAcceso } from '../../auth/permisos'
import SinAcceso from './SinAcceso'

interface RequierePermisoProps {
  acceso: RequisitoAcceso
  /** Nombre de la sección, para la pantalla sin permiso. */
  seccion: string
  children: ReactNode
}

/**
 * Monta la sección solo si el usuario tiene los permisos; si no, muestra un aviso sin montarla,
 * para que no haga consultas que el backend rechazaría. No reemplaza el control del backend.
 */
function RequierePermiso({ acceso, seccion, children }: RequierePermisoProps) {
  const { tienePermiso } = useAuth()
  if (!cumpleRequisito(tienePermiso, acceso)) return <SinAcceso seccion={seccion} />
  return children
}

export default RequierePermiso
