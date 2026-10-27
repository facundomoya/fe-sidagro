import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './Layout.css'

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="layout__overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <div className="layout__main">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
