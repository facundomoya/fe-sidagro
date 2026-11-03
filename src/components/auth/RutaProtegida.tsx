import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { RUTAS } from '../../config/navigation'

/** Muestra las rutas hijas solo con sesión iniciada; si no, redirige al login. */
function RutaProtegida() {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to={RUTAS.login} replace />
  return <Outlet />
}

export default RutaProtegida
