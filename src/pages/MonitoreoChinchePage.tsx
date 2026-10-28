import { useEffect, useRef, useState } from 'react'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusMessage from '../components/StatusMessage'
import LoteSelector from '../components/monitoreo/LoteSelector'
import AlertasPanel from '../components/monitoreo/AlertasPanel'
import ClimaPanel from '../components/monitoreo/ClimaPanel'
import ProximoMonitoreoCard from '../components/monitoreo/ProximoMonitoreoCard'
import HistorialObservaciones from '../components/monitoreo/HistorialObservaciones'
import ObservacionForm from '../components/monitoreo/ObservacionForm'
import ErrorConReintento from '../components/monitoreo/ErrorConReintento'
import { describirError, type ErrorCarga } from '../components/monitoreo/errores'
import { tonoRiesgo } from '../components/monitoreo/riesgo'
import {
  IconClipboard,
  IconHistory,
  IconLeaf,
  IconRefresh,
  IconShield,
  IconSprout,
  IconTrend,
} from '../components/icons/Icons'
import { obtenerLotes } from '../services/catalogoService'
import { obtenerMonitoreo } from '../services/monitoreoService'
import type { LoteApi } from '../types/catalogo'
import type { Monitoreo, ObservacionApi } from '../types/monitoreoApi'
import { fechaHoyIso, formatearFecha, formatearFechaHora, formatearNumero } from '../utils/format'
import '../components/monitoreo/Monitoreo.css'

const DURACION_CONFIRMACION_MS = 5000

type ModalActivo = 'observacion' | 'historial' | null

interface Confirmacion {
  id: number
  texto: string
}

interface ResultadoMonitoreo {
  loteId: number
  /** Intento (consulta inicial o actualización) al que corresponde el resultado. */
  intento: number
  /** Últimos datos obtenidos del lote. Se conservan si falla una actualización. */
  datos: Monitoreo | null
  /** Fecha y hora ISO en que se obtuvieron los datos. */
  obtenidoEn: string | null
  error: ErrorCarga | null
}

function UnidadGradosDia() {
  return <small className="monitoreo__unidad">°C día</small>
}

/** Prioriza un lote con fecha de siembra para mostrar datos desde el inicio. */
function loteInicial(lotes: LoteApi[], hoy: string): LoteApi | undefined {
  return lotes.find((l) => l.fechaSiembra && l.fechaSiembra <= hoy) ?? lotes[0]
}

function MonitoreoChinchePage() {
  const hoy = fechaHoyIso()

  const [lotes, setLotes] = useState<LoteApi[]>([])
  const [cargandoLotes, setCargandoLotes] = useState(true)
  const [errorLotes, setErrorLotes] = useState<ErrorCarga | null>(null)
  const [intentoLotes, setIntentoLotes] = useState(0)

  const [loteId, setLoteId] = useState<number | null>(null)
  const [intentoMonitoreo, setIntentoMonitoreo] = useState(0)
  const [resultado, setResultado] = useState<ResultadoMonitoreo | null>(null)
  const [modalActivo, setModalActivo] = useState<ModalActivo>(null)
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)
  const [guardandoObservacion, setGuardandoObservacion] = useState(false)
  // Lote seleccionado en este momento, para descartar respuestas tardías de otro lote.
  const loteIdRef = useRef<number | null>(null)

  const lote = lotes.find((l) => l.id === loteId)
  const sinSiembra = !!lote && !lote.fechaSiembra
  const siembraFutura = !!lote?.fechaSiembra && lote.fechaSiembra > hoy
  const puedeCalcular = !!lote && !sinSiembra && !siembraFutura

  // Solo se usa el resultado del lote seleccionado. Si corresponde a un intento anterior,
  // hay una consulta en curso: se muestran los datos previos mientras se actualizan.
  const resultadoLote = puedeCalcular && resultado?.loteId === loteId ? resultado : null
  const consultando = puedeCalcular && resultadoLote?.intento !== intentoMonitoreo
  const monitoreo = resultadoLote?.datos ?? null
  const errorMonitoreo = consultando ? null : resultadoLote?.error ?? null

  useEffect(() => {
    loteIdRef.current = loteId
  }, [loteId])

  useEffect(() => {
    if (!confirmacion) return
    const timer = setTimeout(() => setConfirmacion(null), DURACION_CONFIRMACION_MS)
    return () => clearTimeout(timer)
  }, [confirmacion])

  useEffect(() => {
    const controller = new AbortController()
    obtenerLotes(controller.signal)
      .then((datos) => {
        setLotes(datos)
        setLoteId(loteInicial(datos, fechaHoyIso())?.id ?? null)
      })
      .catch((error) => {
        if (!controller.signal.aborted) setErrorLotes(describirError(error, 'los lotes'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargandoLotes(false)
      })
    return () => controller.abort()
  }, [intentoLotes])

  useEffect(() => {
    if (loteId === null || !puedeCalcular) return
    const controller = new AbortController()
    obtenerMonitoreo(loteId, controller.signal)
      .then((datos) =>
        setResultado({
          loteId,
          intento: intentoMonitoreo,
          datos,
          obtenidoEn: new Date().toISOString(),
          error: null,
        }),
      )
      .catch((error) => {
        if (controller.signal.aborted) return
        // Si falla una actualización, se conservan los últimos datos del mismo lote.
        setResultado((prev) => {
          const anterior = prev?.loteId === loteId ? prev : null
          return {
            loteId,
            intento: intentoMonitoreo,
            datos: anterior?.datos ?? null,
            obtenidoEn: anterior?.obtenidoEn ?? null,
            error: describirError(error, 'el monitoreo del lote'),
          }
        })
      })
    return () => controller.abort()
  }, [loteId, intentoMonitoreo, puedeCalcular])

  function reintentarLotes() {
    setErrorLotes(null)
    setCargandoLotes(true)
    setIntentoLotes((n) => n + 1)
  }

  function actualizarDatos() {
    if (!puedeCalcular || consultando) return
    setIntentoMonitoreo((n) => n + 1)
  }

  function handleObservacionGuardada(observacion: ObservacionApi, loteGuardadoId: number) {
    const nombre = lotes.find((l) => l.id === loteGuardadoId)?.nombre ?? 'el lote'
    setConfirmacion({
      id: Date.now(),
      texto: `Observación del ${formatearFecha(observacion.fecha)} registrada para ${nombre}.`,
    })
    // Si mientras se guardaba se eligió otro lote, no se toca su información.
    if (loteGuardadoId !== loteIdRef.current) return
    setModalActivo(null)
    // El backend recalcula el riesgo y el próximo monitoreo con la nueva observación.
    if (puedeCalcular) setIntentoMonitoreo((n) => n + 1)
  }

  const diaActual = monitoreo?.fechasMonitoreo.find((d) => d.fecha === monitoreo.fecha) ?? null
  const actualizando = consultando && !!monitoreo

  const acciones = (
    <>
      <button
        type="button"
        className="btn btn--secondary"
        disabled={!puedeCalcular || consultando}
        onClick={actualizarDatos}
        aria-busy={actualizando}
      >
        {actualizando ? <span className="btn__spinner" aria-hidden="true" /> : <IconRefresh />}
        {actualizando ? 'Actualizando...' : 'Actualizar datos'}
      </button>
      <button
        type="button"
        className="btn btn--secondary"
        disabled={!lote}
        onClick={() => setModalActivo('historial')}
      >
        <IconHistory />
        Ver historial de observaciones
      </button>
      <button
        type="button"
        className="btn btn--primary"
        disabled={!lote}
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

      {confirmacion && (
        <div className="monitoreo__confirmacion">
          <StatusMessage type="success" message={confirmacion.texto} />
        </div>
      )}

      {lote && (
        <>
          <Modal
            open={modalActivo === 'observacion'}
            title="Registrar observación de campo"
            onClose={() => setModalActivo(null)}
            bloqueado={guardandoObservacion}
          >
            <ObservacionForm
              key={lote.id}
              lote={lote}
              onCancel={() => setModalActivo(null)}
              onSaved={handleObservacionGuardada}
              onGuardandoChange={setGuardandoObservacion}
            />
          </Modal>

          <Modal
            open={modalActivo === 'historial'}
            title="Historial de observaciones"
            onClose={() => setModalActivo(null)}
          >
            <HistorialObservaciones key={lote.id} loteId={lote.id} loteNombre={lote.nombre} />
          </Modal>
        </>
      )}

      {cargandoLotes && <StatusMessage type="loading" message="Cargando lotes..." />}
      {errorLotes && <ErrorConReintento error={errorLotes} onReintentar={reintentarLotes} />}
      {!cargandoLotes && !errorLotes && lotes.length === 0 && (
        <StatusMessage type="empty" message="No hay lotes registrados." />
      )}

      {lotes.length > 0 && (
        <div className="monitoreo">
          <LoteSelector lotes={lotes} loteSeleccionadoId={loteId} onChange={setLoteId} />

          {sinSiembra && (
            <StatusMessage
              type="empty"
              message="Este lote no tiene fecha de siembra cargada. El monitoreo se calcula con los grados día acumulados desde la siembra, por lo que estará disponible cuando se registre esa fecha."
            />
          )}
          {siembraFutura && lote?.fechaSiembra && (
            <StatusMessage
              type="empty"
              message={`La siembra de este lote está prevista para el ${formatearFecha(lote.fechaSiembra)}. El monitoreo estará disponible a partir de esa fecha.`}
            />
          )}

          {consultando && !monitoreo && (
            <StatusMessage type="loading" message="Calculando el estado del cultivo..." />
          )}
          {actualizando && (
            <StatusMessage type="loading" message="Actualizando el estado del cultivo..." />
          )}
          {errorMonitoreo && !monitoreo && (
            <ErrorConReintento
              error={errorMonitoreo}
              onReintentar={() => setIntentoMonitoreo((n) => n + 1)}
            />
          )}
          {errorMonitoreo && monitoreo && (
            <ErrorConReintento
              error={{
                ...errorMonitoreo,
                mensaje: `No se pudieron actualizar los datos. ${errorMonitoreo.mensaje} Se muestran los últimos datos obtenidos.`,
              }}
              onReintentar={() => setIntentoMonitoreo((n) => n + 1)}
            />
          )}

          {monitoreo && (
            <>
              <p className="monitoreo__origen">
                Estado calculado para el {formatearFecha(monitoreo.fecha)} ·{' '}
                {monitoreo.diasDesdeSiembra} días desde la siembra
                {resultadoLote?.obtenidoEn &&
                  ` · Consultado el ${formatearFechaHora(resultadoLote.obtenidoEn)}`}
              </p>

              {/* Incluye CICLO_CUMPLIDO cuando corresponde, por lo que no se repite ese aviso. */}
              <AlertasPanel alertas={monitoreo.alertas} />

              <div className="stat-grid">
                <StatCard
                  icon={IconLeaf}
                  label="GDDA acumulado"
                  value={
                    <>
                      {formatearNumero(monitoreo.gddaAcumulado)} <UnidadGradosDia />
                    </>
                  }
                  caption="Grados día acumulados desde la siembra"
                />
                <StatCard
                  icon={IconTrend}
                  label="GDD de hoy"
                  value={
                    <>
                      {formatearNumero(monitoreo.gddHoy)} <UnidadGradosDia />
                    </>
                  }
                  caption={`Temperatura base: ${formatearNumero(monitoreo.temperaturaBase, 0)} °C`}
                />
                <StatCard
                  icon={IconSprout}
                  label="Etapa fenológica estimada"
                  value={monitoreo.etapaActual.nombre}
                  caption={`Monitoreo: ${monitoreo.etapaActual.frecuenciaMonitoreo.toLowerCase()}`}
                />
                <StatCard
                  icon={IconShield}
                  label="Riesgo de chinche verde"
                  value={monitoreo.nivelRiesgo}
                  caption={monitoreo.motivoRiesgo}
                  tone={tonoRiesgo(monitoreo.nivelRiesgo)}
                />
              </div>

              <div className="monitoreo__detalle">
                <ClimaPanel dia={diaActual} proveedor={monitoreo.proveedorClimatico} />
                <ProximoMonitoreoCard
                  fecha={monitoreo.proximoMonitoreo.fecha}
                  motivo={monitoreo.proximoMonitoreo.motivo}
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default MonitoreoChinchePage
