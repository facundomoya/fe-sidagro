import { useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { etiquetaRol } from '../../auth/roles'
import { NAV_ITEMS } from '../../config/navigation'
import { IconLogout, IconMenu } from '../icons/Icons'

interface HeaderProps {
  onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((item) => item.path === pathname)
  const { usuario, cerrarSesion } = useAuth()
  const nombreCompleto = usuario ? `${usuario.name} ${usuario.lastname}`.trim() || usuario.username : ''
  const iniciales = nombreCompleto
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('')

  return (
    <header className="header">
      <button
        type="button"
        className="header__menu"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <IconMenu />
      </button>
      <div className="header__breadcrumb">
        <span>SID-Agro</span>
        {current && (
          <>
            <span className="header__separator">/</span>
            <strong>{current.label}</strong>
          </>
        )}
      </div>

      {usuario && (
        <div className="header__usuario">
          <span className="header__avatar" aria-hidden="true">
            {iniciales}
          </span>
          <div className="header__usuario-datos">
            <strong>{nombreCompleto}</strong>
            <span>{etiquetaRol(usuario.role?.name)}</span>
          </div>
          <button
            type="button"
            className="btn btn--secondary header__logout"
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
          >
            <IconLogout />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </header>
  )
}

export default Header
