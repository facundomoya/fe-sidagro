import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './authContext'

/** Sesión actual: usuario autenticado, permisos y acciones de login y logout. */
export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return contexto
}
