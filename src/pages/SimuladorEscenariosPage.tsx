import { useEffect, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader'
import StatusMessage from '../components/StatusMessage'
import ErrorConReintento from '../components/monitoreo/ErrorConReintento'
import { describirError, type ErrorCarga } from '../components/monitoreo/errores'
import ConfiguracionEscenarioPanel from '../components/simulador/ConfiguracionEscenarioPanel'
import HistorialSimulaciones from '../components/simulador/HistorialSimulaciones'
import OverlayProcesando from '../components/simulador/OverlayProcesando'
import ResultadosSimulacionPanel from '../components/simulador/ResultadosSimulacionPanel'
import RecomendacionPanel from '../components/simulador/RecomendacionPanel'
import { mensajeErrorSimulacion } from '../components/simulador/errores'
import { actualizarHistorial, ordenarHistorial } from '../components/simulador/historial'
import { ApiError } from '../services/apiClient'
import { obtenerEtapas, obtenerLotes } from '../services/catalogoService'
import {
  crearSimulacion,
  obtenerSimulacion,
  obtenerSimulaciones,
  reintentarRecomendacion,
} from '../services/simuladorService'
import type { EtapaFenologicaApi, LoteApi } from '../types/catalogo'
import type {
  NuevaSimulacionApi,
  SimulacionApi,
  SimulacionResumenApi,
} from '../types/simulacionApi'
import '../components/simulador/Simulador.css'

interface Catalogo {
  /** Solo lotes activos: el backend no permite simular lotes inactivos. */
  lotes: LoteApi[]
  etapas: EtapaFenologicaApi[]
}

type Proceso = 'crear' | 'reintentar'

/**
 * Límite de espera de la recomendación. El backend corta cada llamada a Mistral a los 60 s
 * (MISTRAL_TIMEOUT_MS) y reintenta una vez ante un 429; este margen solo evita que el overlay
 * quede bloqueando la pantalla si el servidor nunca responde.
 */
const LIMITE_RECOMENDACION_MS = 5 * 60 * 1000

function SimuladorEscenariosPage() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null)
  const [error, setError] = useState<ErrorCarga | null>(null)
  const [intento, setIntento] = useState(0)

  const [simulacion, setSimulacion] = useState<SimulacionApi | null>(null)
  const [proceso, setProceso] = useState<Proceso | null>(null)
  const [errorCrear, setErrorCrear] = useState<string | null>(null)
  const [errorReintento, setErrorReintento] = useState<string | null>(null)
  // Evita pedidos duplicados aunque se presione varias veces antes de volver a renderizar.
  const procesandoRef = useRef(false)
  const resultadosRef = useRef<HTMLDivElement>(null)

  const [historial, setHistorial] = useState<SimulacionResumenApi[] | null>(null)
  const [errorHistorial, setErrorHistorial] = useState<ErrorCarga | null>(null)
  const [intentoHistorial, setIntentoHistorial] = useState(0)
  // Consulta del detalle de una simulación elegida en el historial.
  const [consultandoId, setConsultandoId] = useState<number | null>(null)
  const [errorConsulta, setErrorConsulta] = useState<string | null>(null)
  const consultaRef = useRef<AbortController | null>(null)

  /**
   * Lleva los resultados a la vista si quedaron fuera de pantalla: debajo del formulario en
   * pantallas angostas, o arriba cuando se elige una simulación del historial.
   */
  function mostrarResultados() {
    const resultados = resultadosRef.current
    if (!resultados) return
    const { top } = resultados.getBoundingClientRect()
    if (top < 0 || top > window.innerHeight) {
      resultados.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  /** Refleja en el historial una simulación creada, reintentada o consultada. */
  function registrarEnHistorial(actual: SimulacionApi) {
    setHistorial((lista) => (lista ? actualizarHistorial(lista, actual) : lista))
  }

  function cancelarConsulta() {
    consultaRef.current?.abort()
    consultaRef.current = null
    setConsultandoId(null)
  }

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([obtenerLotes(controller.signal), obtenerEtapas(controller.signal)])
      .then(([lotes, etapas]) =>
        setCatalogo({ lotes: lotes.filter((l) => l.estado === 'ACTIVO'), etapas }),
      )
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(describirError(err, 'los lotes y las etapas fenológicas'))
        }
      })
    return () => controller.abort()
  }, [intento])

  function reintentarCarga() {
    setError(null)
    setIntento((n) => n + 1)
  }

  useEffect(() => {
    const controller = new AbortController()
    obtenerSimulaciones(controller.signal)
      .then((simulaciones) => setHistorial(ordenarHistorial(simulaciones)))
      .catch((err) => {
        if (!controller.signal.aborted) {
          setErrorHistorial(describirError(err, 'las simulaciones guardadas'))
        }
      })
    return () => controller.abort()
  }, [intentoHistorial])

  // Al salir de la página se cancela la consulta de detalle pendiente.
  useEffect(() => () => consultaRef.current?.abort(), [])

  function recargarHistorial() {
    setHistorial(null)
    setErrorHistorial(null)
    setIntentoHistorial((n) => n + 1)
  }

  async function seleccionarSimulacion(id: number) {
    if (procesandoRef.current || id === consultandoId) return
    // Ya se está mostrando: no hace falta volver a pedirla.
    if (id === simulacion?.id && consultandoId === null) {
      setErrorConsulta(null)
      mostrarResultados()
      return
    }
    consultaRef.current?.abort()
    const controller = new AbortController()
    consultaRef.current = controller
    setConsultandoId(id)
    setErrorConsulta(null)
    try {
      const detalle = await obtenerSimulacion(id, controller.signal)
      setSimulacion(detalle)
      setErrorReintento(null)
      registrarEnHistorial(detalle)
      mostrarResultados()
    } catch (err) {
      if (!controller.signal.aborted) setErrorConsulta(mensajeErrorSimulacion(err, 'consultar'))
    } finally {
      if (consultaRef.current === controller) {
        consultaRef.current = null
        setConsultandoId(null)
      }
    }
  }

  // Los pedidos no se cancelan al salir de la página: el backend guarda el escenario igual.
  async function simular(nueva: NuevaSimulacionApi) {
    if (procesandoRef.current) return
    procesandoRef.current = true
    cancelarConsulta()
    setProceso('crear')
    setErrorCrear(null)
    setErrorReintento(null)
    setErrorConsulta(null)
    mostrarResultados()
    try {
      const creada = await crearSimulacion(nueva, AbortSignal.timeout(LIMITE_RECOMENDACION_MS))
      setSimulacion(creada)
      registrarEnHistorial(creada)
    } catch (err) {
      // Se conserva el resultado anterior y los datos del formulario para corregir o reintentar.
      setErrorCrear(mensajeErrorSimulacion(err, 'crear'))
    } finally {
      procesandoRef.current = false
      setProceso(null)
    }
  }

  async function reintentarRecomendacionActual() {
    if (!simulacion || procesandoRef.current) return
    const { id } = simulacion
    procesandoRef.current = true
    cancelarConsulta()
    setProceso('reintentar')
    setErrorReintento(null)
    try {
      const actualizada = await reintentarRecomendacion(
        id,
        AbortSignal.timeout(LIMITE_RECOMENDACION_MS),
      )
      setSimulacion(actualizada)
      registrarEnHistorial(actualizada)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // La simulación ya tenía recomendación (por ejemplo, desde otra pestaña): se muestra.
        try {
          const detalle = await obtenerSimulacion(id)
          setSimulacion(detalle)
          registrarEnHistorial(detalle)
        } catch (errDetalle) {
          setErrorReintento(mensajeErrorSimulacion(errDetalle, 'consultar'))
        }
      } else {
        setErrorReintento(mensajeErrorSimulacion(err, 'reintentar'))
      }
    } finally {
      procesandoRef.current = false
      setProceso(null)
    }
  }

  const cargando = !catalogo && !error

  return (
    <>
      <PageHeader
        title="Simulador de escenarios"
        description="Planteá un escenario para un lote (etapa, riesgo observado y clima esperado) y obtené una recomendación agronómica."
      />

      {proceso !== null && <OverlayProcesando titulo="Generando recomendación..." />}

      {cargando && <StatusMessage type="loading" message="Cargando lotes y etapas fenológicas..." />}
      {error && <ErrorConReintento error={error} onReintentar={reintentarCarga} />}

      {catalogo && catalogo.lotes.length === 0 && (
        <StatusMessage
          type="empty"
          message="No hay lotes activos para simular. Registrá un lote o activá uno existente en el backend."
        />
      )}
      {catalogo && catalogo.lotes.length > 0 && catalogo.etapas.length === 0 && (
        <StatusMessage
          type="empty"
          message="No hay etapas fenológicas cargadas en el backend, por lo que no es posible configurar un escenario."
        />
      )}

      {catalogo && catalogo.lotes.length > 0 && catalogo.etapas.length > 0 && (
        <>
          <div className="simulador">
            <ConfiguracionEscenarioPanel
              lotes={catalogo.lotes}
              etapas={catalogo.etapas}
              procesando={proceso !== null}
              error={errorCrear}
              onSimular={simular}
            />
            <div className="simulador__resultados" ref={resultadosRef}>
              <ResultadosSimulacionPanel simulacion={simulacion} creando={proceso === 'crear'} />
              <RecomendacionPanel
                simulacion={simulacion}
                creando={proceso === 'crear'}
                reintentando={proceso === 'reintentar'}
                errorReintento={errorReintento}
                onReintentar={reintentarRecomendacionActual}
              />
            </div>
          </div>
          <HistorialSimulaciones
            simulaciones={historial}
            error={errorHistorial}
            seleccionadaId={simulacion?.id ?? null}
            consultandoId={consultandoId}
            errorConsulta={errorConsulta}
            bloqueado={proceso !== null}
            onSeleccionar={seleccionarSimulacion}
            onRecargar={recargarHistorial}
          />
        </>
      )}
    </>
  )
}

export default SimuladorEscenariosPage
