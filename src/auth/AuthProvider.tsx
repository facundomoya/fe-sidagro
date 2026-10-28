import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue, type MotivoCierreSesion } from './authContext'
import { alRecibirNoAutorizado, establecerToken } from '../services/apiClient'
import { iniciarSesion as iniciarSesionApi } from '../services/authService'
import type { CredencialesLogin, UsuarioAutenticado } from '../types/auth'

// La sesión vive solo en memoria: al recargar la página hay que volver a iniciar sesión.
function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null)
  const [motivoCierre, setMotivoCierre] = useState<MotivoCierreSesion | null>(null)

  const iniciarSesion = useCallback(async (credenciales: CredencialesLogin) => {
    const sesion = await iniciarSesionApi(credenciales)
    establecerToken(sesion.token)
    setUsuario(sesion.usuario)
    setMotivoCierre(null)
  }, [])

  const cerrarSesion = useCallback(() => {
    establecerToken(null)
    setUsuario(null)
    setMotivoCierre(null)
  }, [])

  // Si el backend rechaza el token durante la sesión, se invalida y se pide un nuevo login.
  useEffect(
    () =>
      alRecibirNoAutorizado(() => {
        establecerToken(null)
        setUsuario(null)
        setMotivoCierre('sesionExpirada')
      }),
    [],
  )

  const tienePermiso = useCallback(
    (permiso: string) => usuario?.role?.permission.some((p) => p.name === permiso) ?? false,
    [usuario],
  )

  const valor = useMemo<AuthContextValue>(
    () => ({ usuario, motivoCierre, iniciarSesion, cerrarSesion, tienePermiso }),
    [usuario, motivoCierre, iniciarSesion, cerrarSesion, tienePermiso],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export default AuthProvider
