import { useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../../config/navigation'
import { IconMenu } from '../icons/Icons'

interface HeaderProps {
  onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((item) => item.path === pathname)

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
    </header>
  )
}

export default Header
