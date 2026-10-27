import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusMessage from '../components/StatusMessage'
import LoteSelector from '../components/monitoreo/LoteSelector'
import ClimaPanel from '../components/monitoreo/ClimaPanel'
import ProximoMonitoreoCard from '../components/monitoreo/ProximoMonitoreoCard'
import ObservacionForm from '../components/monitoreo/ObservacionForm'
import HistorialObservaciones from '../components/monitoreo/HistorialObservaciones'
import HistorialAnalisis from '../components/monitoreo/HistorialAnalisis'
import { TONO_RIESGO } from '../components/monitoreo/riesgo'
import Modal from '../components/Modal'
import {
  IconClipboard,
  IconHistory,
  IconLeaf,
  IconRefresh,
  IconShield,
  IconSprout,
  IconTrend,
} from '../components/icons/Icons'
import {
  ejecutarAnalisis,
  obtenerLotes,
  obtenerMonitoreoPorLote,
} from '../services/monitoreoService'
import type { Lote, MonitoreoLote } from '../types/monitoreo'
import { formatearFechaHora, formatearNumero } from '../utils/format'
import '../components/monitoreo/Monitoreo.css'

const DURACION_CONFIRMACION_MS = 5000

interface ResultadoMonitoreo {
  loteId: string
  datos: MonitoreoLote | null
  error: boolean
}

interface Confirmacion {
  id: number
  texto: string
}

type ModalActivo = 'observacion' | 'historialObservaciones' | 'historialAnalisis' | null

function MonitoreoChinchePage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loteId, setLoteId] = useState('')
  const [cargandoLotes, setCargandoLotes] = useState(true)
  const [errorLotes, setErrorLotes] = useState(false)

  // Resultado de la última consulta; mientras no corresponda al lote seleccionado, se está cargando.
  const [resultado, setResultado] = useState<ResultadoMonitoreo | null>(null)
  const cargandoMonitoreo = resultado?.loteId !== loteId
  const errorMonitoreo = !cargandoMonitoreo && resultado.error
  const monitoreo = cargandoMonitoreo ? null : resultado.datos

  const loteSeleccionado = lotes.find((l) => l.id === loteId)
  const [modalActivo, setModalActivo] = useState<ModalActivo>(null)
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)
  const [ejecutandoAnalisis, setEjecutandoAnalisis] = useState(false)
  const [errorAnalisis, setErrorAnalisis] = useState(false)

  const cerrarModal = () => setModalActivo(null)
  const confirmar = (texto: string) => setConfirmacion({ id: Date.now(), texto })

  useEffect(() => {
    if (!confirmacion) return
    const timer = setTimeout(() => setConfirmacion(null), DURACION_CONFIRMACION_MS)
    return () => clearTimeout(timer)
  }, [confirmacion])

  useEffect(() => {
    obtenerLotes()
      .then((datos) => {
        setLotes(datos)
        if (datos.length > 0) setLoteId(datos[0].id)
      })
      .catch(() => setErrorLotes(true))
      .finally(() => setCargandoLotes(false))
  }, [])

  useEffect(() => {
    if (!loteId) return
    let vigente = true
    obtenerMonitoreoPorLote(loteId)
      .then((datos) => vigente && setResultado({ loteId, datos, error: false }))
      .catch(() => vigente && setResultado({ loteId, datos: null, error: true }))
    return () => {
      vigente = false
    }
  }, [loteId])

  async function handleEjecutarAnalisis() {
    if (!loteSeleccionado || ejecutandoAnalisis) return
    const lote = loteSeleccionado
    setEjecutandoAnalisis(true)
    setErrorAnalisis(false)
    try {
      const analisis = await ejecutarAnalisis(lote.id)
      // Reemplaza solo los resultados predictivos; el clima y las observaciones no cambian.
      setResultado((prev) =>
        prev?.loteId === analisis.loteId && prev.datos
          ? {
              ...prev,
              datos: {
                ...prev.datos,
                indicadores: analisis.indicadores,
                proximoMonitoreo: analisis.proximoMonitoreo,
                fechaUltimoAnalisis: analisis.fechaEjecucion,
              },
            }
          : prev,
      )
      confirmar(`Análisis ejecutado para ${lote.nombre}. Los resultados son simulados.`)
    } catch {
      setErrorAnalisis(true)
    } finally {
      setEjecutandoAnalisis(false)
    }
  }

  const acciones = (
    <>
      <button
        type="button"
        className="btn btn--secondary"
        disabled={!monitoreo || ejecutandoAnalisis}
        onClick={handleEjecutarAnalisis}
        aria-busy={ejecutandoAnalisis}
      >
        {ejecutandoAnalisis ? <span className="btn__spinner" aria-hidden="true" /> : <IconRefresh />}
        {ejecutandoAnalisis ? 'Ejecutando análisis...' : 'Ejecutar nuevo análisis'}
      </button>
      <button
        type="button"
        className="btn btn--secondary"
        disabled={!loteSeleccionado}
        onClick={() => setModalActivo('historialAnalisis')}
      >
        <IconHistory />
        Ver historial de análisis
      </button>
      <button
        type="button"
        className="btn btn--secondary"
        disabled={!loteSeleccionado}
        onClick={() => setModalActivo('historialObservaciones')}
      >
        <IconHistory />
        Ver historial de observaciones
      </button>
      <button
        type="button"
        className="btn btn--primary"
        disabled={!loteSeleccionado}
        onClick={() => setModalActivo('observacion')}
      >
        <IconClipboard />
        Registrar observación
      </button>
    </>
  )

  return (
    <>
      <PageHeader
        title="Monitoreo de chinche verde"
        description="Seguimiento del cultivo y de las condiciones climáticas para planificar el monitoreo del lote."
        actions={acciones}
      />
      <p className="monitoreo__aviso">
        Datos simulados con fines de desarrollo. Los análisis y las observaciones se guardan solo
        durante la sesión.
      </p>

      {confirmacion && (
        <div className="monitoreo__confirmacion">
          <StatusMessage type="success" message={confirmacion.texto} />
        </div>
      )}

      {loteSeleccionado && (
        <>
          <Modal
            open={modalActivo === 'observacion'}
            title="Registrar observación de campo"
            onClose={cerrarModal}
          >
            <ObservacionForm
              lote={loteSeleccionado}
              onCancel={cerrarModal}
              onSaved={() => {
                cerrarModal()
                confirmar(`Observación registrada correctamente para ${loteSeleccionado.nombre}.`)
              }}
            />
          </Modal>

          <Modal
            open={modalActivo === 'historialObservaciones'}
            title="Historial de observaciones"
            onClose={cerrarModal}
          >
            <HistorialObservaciones lote={loteSeleccionado} />
          </Modal>

          <Modal
            open={modalActivo === 'historialAnalisis'}
            title="Historial de análisis"
            onClose={cerrarModal}
          >
            <HistorialAnalisis lote={loteSeleccionado} />
          </Modal>
        </>
      )}

      {cargandoLotes && <StatusMessage type="loading" message="Cargando lotes..." />}
      {errorLotes && <StatusMessage type="error" message="No se pudieron cargar los lotes." />}
      {!cargandoLotes && !errorLotes && lotes.length === 0 && (
        <StatusMessage type="empty" message="No hay lotes disponibles." />
      )}

      {lotes.length > 0 && (
        <div className="monitoreo">
          <LoteSelector
            lotes={lotes}
            loteSeleccionadoId={loteId}
            onChange={setLoteId}
            disabled={ejecutandoAnalisis}
          />

          {cargandoMonitoreo && (
            <StatusMessage type="loading" message="Cargando datos de monitoreo..." />
          )}
          {!cargandoMonitoreo && errorMonitoreo && (
            <StatusMessage type="error" message="No se pudieron cargar los datos del lote." />
          )}
          {!cargandoMonitoreo && !errorMonitoreo && !monitoreo && (
            <StatusMessage type="empty" message="No hay datos de monitoreo para este lote." />
          )}

          {!cargandoMonitoreo && !errorMonitoreo && monitoreo && (
            <>
              {ejecutandoAnalisis && loteSeleccionado && (
                <StatusMessage
                  type="loading"
                  message={`Ejecutando análisis simulado para ${loteSeleccionado.nombre}...`}
                />
              )}
              {errorAnalisis && (
                <StatusMessage type="error" message="No se pudo ejecutar el análisis. Intentá nuevamente." />
              )}

              <p className="monitoreo__origen">
                {monitoreo.fechaUltimoAnalisis
                  ? `Resultado simulado del último análisis · Ejecutado el ${formatearFechaHora(monitoreo.fechaUltimoAnalisis)}`
                  : 'Valores iniciales simulados. Todavía no se ejecutaron análisis para este lote.'}
              </p>

              <div className="stat-grid">
                <StatCard
                  icon={IconLeaf}
                  label="GDD acumulado"
                  value={formatearNumero(monitoreo.indicadores.gdd)}
                  caption="Grados día acumulados"
                />
                <StatCard
                  icon={IconTrend}
                  label="GDDA"
                  value={formatearNumero(monitoreo.indicadores.gdda)}
                  caption="Grados día promedio"
                />
                <StatCard
                  icon={IconSprout}
                  label="Etapa fenológica estimada"
                  value={monitoreo.indicadores.etapaFenologica}
                  caption={monitoreo.indicadores.descripcionEtapa}
                />
                <StatCard
                  icon={IconShield}
                  label="Riesgo de chinche verde"
                  value={monitoreo.indicadores.riesgo}
                  tone={TONO_RIESGO[monitoreo.indicadores.riesgo]}
                />
              </div>

              <div className="monitoreo__detalle">
                <ClimaPanel clima={monitoreo.clima} />
                <ProximoMonitoreoCard fecha={monitoreo.proximoMonitoreo} />
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default MonitoreoChinchePage
