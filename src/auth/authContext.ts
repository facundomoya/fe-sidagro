import { createContext } from 'react'
import type { CredencialesLogin, UsuarioAutenticado } from '../types/auth'

/** Por qué terminó la última sesión, para avisarlo en la pantalla de login. */
export type MotivoCierreSesion = 'sesionExpirada'

export interface AuthContextValue {
  usuario: UsuarioAutenticado | null
  motivoCierre: MotivoCierreSesion | null
  /** Inicia sesión contra el backend. Lanza ApiError si falla. */
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<void>
  cerrarSesion: () => void
  /** Indica si el rol del usuario tiene el permiso, por ejemplo MONITOREO_POST. */
  tienePermiso: (permiso: string) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
