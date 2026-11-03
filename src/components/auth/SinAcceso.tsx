import { Link } from 'react-router-dom'
import EmptyState from '../EmptyState'
import PageHeader from '../PageHeader'
import { IconShield } from '../icons/Icons'
import { useAuth } from '../../auth/useAuth'
import { NAV_ITEMS, rutaInicial } from '../../config/navigation'

interface SinAccesoProps {
  /** Sección a la que se intentó entrar. */
  seccion: string
}

const AVISO_PERMISOS =
  'Si te asignaron permisos recientemente, cerrá sesión y volvé a ingresar para que se apliquen.'

/** Pantalla para una sección no autorizada. */
function SinAcceso({ seccion }: SinAccesoProps) {
  const { tienePermiso } = useAuth()
  const inicio = rutaInicial(tienePermiso)
  const destino = NAV_ITEMS.find((item) => item.path === inicio)

  return (
    <>
      <PageHeader title={seccion} />
      <div className="card section-card sin-acceso">
        <EmptyState
          icon={IconShield}
          title="No tenés permiso para acceder a esta sección"
          description={`Tu usuario no tiene los permisos necesarios. ${AVISO_PERMISOS}`}
        />
        {destino && (
          <Link to={destino.path} className="btn btn--secondary sin-acceso__accion">
            Ir a {destino.label}
          </Link>
        )}
      </div>
    </>
  )
}

export default SinAcceso
