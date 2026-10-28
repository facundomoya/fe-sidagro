import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { RUTAS } from '../../config/navigation'

/** Muestra las rutas hijas solo con sesión iniciada; si no, redirige al login recordando el destino. */
function RutaProtegida() {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario) return <Navigate to={RUTAS.login} replace state={{ desde: location.pathname }} />
  return <Outlet />
}

export default RutaProtegida
