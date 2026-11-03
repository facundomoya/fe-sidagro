import { useAuth } from '../auth/useAuth'
import { seccionesDisponibles } from '../config/navigation'
import { IconMenu } from '../components/icons/Icons'
import '../components/inicio/Inicio.css'

/** Logo oficial de SID-Agro, servido desde public/. */
const LOGO = '/logo-sidagro.jpeg'

/**
 * Pantalla de inicio después del login. Permanece hasta que el usuario elige un módulo en el
 * menú lateral; no requiere permisos más allá de tener la sesión iniciada.
 */
function InicioPage() {
  const { tienePermiso } = useAuth()
  const haySecciones = seccionesDisponibles(tienePermiso).length > 0

  return (
    <section className="inicio" aria-labelledby="inicio-titulo">
      <img className="inicio__logo" src={LOGO} alt="SID-Agro" width={254} height={122} />
      <h1 id="inicio-titulo" className="inicio__titulo">
        Bienvenido a SID-Agro
      </h1>
      <p className="inicio__subtitulo">Sistema de apoyo a la toma de decisiones agrícolas</p>
      {haySecciones ? (
        <p className="inicio__indicacion">
          <IconMenu />
          Seleccioná un módulo desde el menú lateral para comenzar.
        </p>
      ) : (
        <p className="inicio__indicacion inicio__indicacion--aviso">
          Tu usuario todavía no tiene módulos habilitados. Pedí que te asignen los accesos que
          necesitás y volvé a ingresar.
        </p>
      )}
    </section>
  )
}

export default InicioPage
