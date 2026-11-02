import type { ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import RutaProtegida from './components/auth/RutaProtegida'
import RequierePermiso from './components/auth/RequierePermiso'
import SinAcceso from './components/auth/SinAcceso'
import LoginPage from './pages/LoginPage'
import DashboardEconomicoPage from './pages/DashboardEconomicoPage'
import SimuladorEscenariosPage from './pages/SimuladorEscenariosPage'
import MonitoreoChinchePage from './pages/MonitoreoChinchePage'
import LotesCampaniasPage from './pages/LotesCampaniasPage'
import AdministracionUsuariosPage from './pages/AdministracionUsuariosPage'
import { useAuth } from './auth/useAuth'
import { NAV_ITEMS, RUTAS, rutaInicial } from './config/navigation'

/** Página de cada sección del menú. Su acceso se controla con los permisos de NAV_ITEMS. */
const PAGINAS: Record<string, ComponentType> = {
  [RUTAS.administracion]: AdministracionUsuariosPage,
  [RUTAS.lotesCampanias]: LotesCampaniasPage,
  [RUTAS.monitoreo]: MonitoreoChinchePage,
  [RUTAS.simulador]: SimuladorEscenariosPage,
  [RUTAS.dashboard]: DashboardEconomicoPage,
}

/**
 * Raíz y direcciones desconocidas: a la primera sección habilitada para el usuario. Si no tiene
 * ninguna, se informa sin redirigir a una ruta que no puede usar.
 */
function RedireccionInicial() {
  const { tienePermiso } = useAuth()
  const destino = rutaInicial(tienePermiso)
  return destino ? <Navigate to={destino} replace /> : <SinAcceso />
}

function App() {
  return (
    <Routes>
      <Route path={RUTAS.login} element={<LoginPage />} />
      <Route element={<RutaProtegida />}>
        <Route element={<MainLayout />}>
          {NAV_ITEMS.map(({ path, label, acceso }) => {
            const Pagina = PAGINAS[path]
            return (
              <Route
                key={path}
                path={path}
                element={
                  <RequierePermiso acceso={acceso} seccion={label}>
                    <Pagina />
                  </RequierePermiso>
                }
              />
            )
          })}
          <Route path="*" element={<RedireccionInicial />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
