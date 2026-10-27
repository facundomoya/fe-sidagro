import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../config/navigation'
import { IconClose, IconLeaf } from '../icons/Icons'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
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
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
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
