import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardEconomicoPage from './pages/DashboardEconomicoPage'
import SimuladorEscenariosPage from './pages/SimuladorEscenariosPage'
import MonitoreoChinchePage from './pages/MonitoreoChinchePage'
import { RUTAS } from './config/navigation'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={RUTAS.dashboard} element={<DashboardEconomicoPage />} />
        <Route path={RUTAS.simulador} element={<SimuladorEscenariosPage />} />
        <Route path={RUTAS.monitoreo} element={<MonitoreoChinchePage />} />
        <Route path="*" element={<Navigate to={RUTAS.dashboard} replace />} />
      </Route>
    </Routes>
  )
}

export default App
