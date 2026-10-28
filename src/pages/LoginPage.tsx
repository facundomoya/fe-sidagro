import { useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import StatusMessage from '../components/StatusMessage'
import { IconLeaf } from '../components/icons/Icons'
import { useAuth } from '../auth/useAuth'
import { RUTAS } from '../config/navigation'
import { ApiError } from '../services/apiClient'
import '../components/auth/Login.css'

type Errores = Partial<Record<'username' | 'password', string>>

function validar(username: string, password: string): Errores {
  const errores: Errores = {}
  if (!username.trim()) errores.username = 'Ingresá tu nombre de usuario.'
  if (!password) errores.password = 'Ingresá tu contraseña.'
  return errores
}

function mensajeDeError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'No se pudo iniciar sesión. Intentá nuevamente.'
  if (error.status === 401) return 'Usuario o contraseña incorrectos, o el usuario está dado de baja.'
  return error.mensajes.join(' ')
}

function LoginPage() {
  const { usuario, motivoCierre, iniciarSesion } = useAuth()
  const location = useLocation()
  const destino = (location.state as { desde?: string } | null)?.desde ?? RUTAS.dashboard

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Evita envíos duplicados aunque se presione Enter varias veces antes de volver a renderizar.
  const enviandoRef = useRef(false)

  const errores = intentoEnvio ? validar(username, password) : {}

  if (usuario) return <Navigate to={destino} replace />

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (enviandoRef.current) return
    setIntentoEnvio(true)
    if (Object.keys(validar(username, password)).length > 0) return

    enviandoRef.current = true
    setEnviando(true)
    setError(null)
    try {
      await iniciarSesion({ username: username.trim(), password })
      // Al actualizarse el usuario, el componente redirige al destino.
    } catch (err) {
      setError(mensajeDeError(err))
      // Se limpia la contraseña sin marcarla como error hasta el próximo intento.
      setPassword('')
      setIntentoEnvio(false)
      setEnviando(false)
      enviandoRef.current = false
    }
  }

  return (
    <div className="login">
      <section className="login__marca" aria-hidden="true">
        <span className="login__logo">
          <IconLeaf />
        </span>
        <span className="login__nombre">
          SID-<span>Agro</span>
        </span>
        <p className="login__lema">
          Sistema de apoyo a la toma de decisiones para el cultivo de soja.
        </p>
      </section>

      <main className="login__panel">
        <div className="card login__card">
          <div className="login__encabezado">
            <span className="login__logo login__logo--compacto" aria-hidden="true">
              <IconLeaf />
            </span>
            <h1>Iniciar sesión</h1>
            <p>Ingresá con tu usuario de SID-Agro.</p>
          </div>

          {motivoCierre === 'sesionExpirada' && !error && (
            <StatusMessage type="error" message="Tu sesión expiró. Iniciá sesión nuevamente." />
          )}
          {error && <StatusMessage type="error" message={error} />}

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label className="form-field">
              <span className="form-field__label">Nombre de usuario</span>
              <input
                type="text"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={enviando}
                aria-invalid={!!errores.username}
              />
              {errores.username && <span className="form-field__error">{errores.username}</span>}
            </label>

            <label className="form-field">
              <span className="form-field__label">Contraseña</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={enviando}
                aria-invalid={!!errores.password}
              />
              {errores.password && <span className="form-field__error">{errores.password}</span>}
            </label>

            <button
              type="submit"
              className="btn btn--primary login__submit"
              disabled={enviando}
              aria-busy={enviando}
            >
              {enviando && <span className="btn__spinner" aria-hidden="true" />}
              {enviando ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
