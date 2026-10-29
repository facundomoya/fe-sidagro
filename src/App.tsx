import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import RutaProtegida from './components/auth/RutaProtegida'
import LoginPage from './pages/LoginPage'
import DashboardEconomicoPage from './pages/DashboardEconomicoPage'
import SimuladorEscenariosPage from './pages/SimuladorEscenariosPage'
import MonitoreoChinchePage from './pages/MonitoreoChinchePage'
import LotesCampaniasPage from './pages/LotesCampaniasPage'
import { RUTAS } from './config/navigation'

function App() {
  return (
    <Routes>
      <Route path={RUTAS.login} element={<LoginPage />} />
      <Route element={<RutaProtegida />}>
        <Route element={<MainLayout />}>
          <Route path={RUTAS.dashboard} element={<DashboardEconomicoPage />} />
          <Route path={RUTAS.simulador} element={<SimuladorEscenariosPage />} />
          <Route path={RUTAS.monitoreo} element={<MonitoreoChinchePage />} />
          <Route path={RUTAS.lotesCampanias} element={<LotesCampaniasPage />} />
          <Route path="*" element={<Navigate to={RUTAS.dashboard} replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
