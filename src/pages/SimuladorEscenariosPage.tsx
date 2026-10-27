import { useEffect, useState } from 'react'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import StatusMessage from '../components/StatusMessage'
import ConfiguracionEscenarioPanel from '../components/simulador/ConfiguracionEscenarioPanel'
import ResultadosSimulacionPanel from '../components/simulador/ResultadosSimulacionPanel'
import RecomendacionPanel from '../components/simulador/RecomendacionPanel'
import SimulacionesGuardadas from '../components/simulador/SimulacionesGuardadas'
import { IconHistory } from '../components/icons/Icons'
import { obtenerLotes } from '../services/monitoreoService'
import type { Lote } from '../types/monitoreo'
import type { ConfiguracionEscenario } from '../types/simulador'
import { fechaHoyIso } from '../utils/format'
import '../components/simulador/Simulador.css'

function SimuladorEscenariosPage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [cargandoLotes, setCargandoLotes] = useState(true)
  const [errorLotes, setErrorLotes] = useState(false)
  const [configuracion, setConfiguracion] = useState<ConfiguracionEscenario>({
    loteId: '',
    fecha: fechaHoyIso(),
  })
  const [historialAbierto, setHistorialAbierto] = useState(false)

  const loteSeleccionado = lotes.find((l) => l.id === configuracion.loteId)

  useEffect(() => {
    obtenerLotes()
      .then((datos) => {
        setLotes(datos)
        if (datos.length > 0) setConfiguracion((prev) => ({ ...prev, loteId: datos[0].id }))
      })
      .catch(() => setErrorLotes(true))
      .finally(() => setCargandoLotes(false))
  }, [])

  return (
    <>
      <PageHeader
        title="Simulador de escenarios"
        description="Evaluá el riesgo de chinche verde de un lote bajo condiciones hipotéticas para una fecha específica."
        actions={
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setHistorialAbierto(true)}
            disabled={!loteSeleccionado}
          >
            <IconHistory />
            Ver simulaciones guardadas
          </button>
        }
      />

      {cargandoLotes && <StatusMessage type="loading" message="Cargando lotes..." />}
      {errorLotes && <StatusMessage type="error" message="No se pudieron cargar los lotes." />}
      {!cargandoLotes && !errorLotes && lotes.length === 0 && (
        <StatusMessage type="empty" message="No hay lotes disponibles para simular." />
      )}

      {lotes.length > 0 && (
        <div className="simulador">
          <ConfiguracionEscenarioPanel
            lotes={lotes}
            configuracion={configuracion}
            onChange={setConfiguracion}
          />
          <ResultadosSimulacionPanel />
          <RecomendacionPanel />
        </div>
      )}

      {loteSeleccionado && (
        <Modal
          open={historialAbierto}
          title="Simulaciones guardadas"
          onClose={() => setHistorialAbierto(false)}
        >
          <SimulacionesGuardadas lote={loteSeleccionado} />
        </Modal>
      )}
    </>
  )
}

export default SimuladorEscenariosPage
