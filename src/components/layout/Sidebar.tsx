import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { NAV_ITEMS } from '../../config/navigation'
import { IconClose, IconLeaf } from '../icons/Icons'

interface SidebarProps {
  open: boolean
  /** El menú está oculto (o cerrándose): no debe recibir el foco ni clics. */
  oculto: boolean
  onClose: () => void
}

function Sidebar({ open, oculto, onClose }: SidebarProps) {
  const { tienePermiso } = useAuth()
  const items = NAV_ITEMS.filter((item) => !item.permiso || tienePermiso(item.permiso))

  return (
    <aside id="menu-lateral" className={`sidebar${open ? ' sidebar--open' : ''}`} inert={oculto}>
      <div className="sidebar__brand">
        <span className="sidebar__logo">
          <IconLeaf />
        </span>
        <span className="sidebar__name">
          SID-<span>Agro</span>
        </span>
        <button
          type="button"
          className="sidebar__close"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <IconClose />
        </button>
      </div>

      <nav className="sidebar__nav">
        {items.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
