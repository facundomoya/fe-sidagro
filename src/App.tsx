import type { ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import RutaProtegida from './components/auth/RutaProtegida'
import RequierePermiso from './components/auth/RequierePermiso'
import LoginPage from './pages/LoginPage'
import DashboardEconomicoPage from './pages/DashboardEconomicoPage'
import SimuladorEscenariosPage from './pages/SimuladorEscenariosPage'
import MonitoreoChinchePage from './pages/MonitoreoChinchePage'
import LotesCampaniasPage from './pages/LotesCampaniasPage'
import AdministracionUsuariosPage from './pages/AdministracionUsuariosPage'
import InicioPage from './pages/InicioPage'
import { NAV_ITEMS, RUTAS } from './config/navigation'

/** Página de cada sección del menú. Su acceso se controla con los permisos de NAV_ITEMS. */
const PAGINAS: Record<string, ComponentType> = {
  [RUTAS.administracion]: AdministracionUsuariosPage,
  [RUTAS.lotesCampanias]: LotesCampaniasPage,
  [RUTAS.monitoreo]: MonitoreoChinchePage,
  [RUTAS.simulador]: SimuladorEscenariosPage,
  [RUTAS.dashboard]: DashboardEconomicoPage,
}

function App() {
  return (
    <Routes>
      <Route path={RUTAS.login} element={<LoginPage />} />
      <Route element={<RutaProtegida />}>
        <Route element={<MainLayout />}>
          {/* Inicio después del login: solo exige la sesión iniciada. */}
          <Route path={RUTAS.inicio} element={<InicioPage />} />
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
          {/* La raíz y las direcciones desconocidas llevan al inicio. */}
          <Route path="*" element={<Navigate to={RUTAS.inicio} replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
