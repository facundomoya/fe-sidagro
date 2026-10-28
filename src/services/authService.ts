// Servicio de autenticación contra el backend.
import { apiClient } from './apiClient'
import type { CredencialesLogin, RespuestaLogin, UsuarioAutenticado } from '../types/auth'

export interface SesionIniciada {
  usuario: UsuarioAutenticado
  token: string
}

export async function iniciarSesion(credenciales: CredencialesLogin): Promise<SesionIniciada> {
  const { token, ...usuario } = await apiClient.post<RespuestaLogin>('/auth/login', credenciales)
  return { usuario, token }
}
