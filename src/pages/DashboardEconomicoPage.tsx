import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import StatusMessage from '../components/StatusMessage'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ErrorConReintento from '../components/monitoreo/ErrorConReintento'
import type { ErrorCarga } from '../components/monitoreo/errores'
import { errorDeCarga } from '../components/gestion/errores'
import { ordenarCampanias } from '../components/gestion/presentacion'
import FiltrosDashboard, { TODAS, type ValoresFiltros } from '../components/economico/FiltrosDashboard'
import ReferenciasMercado from '../components/economico/ReferenciasMercado'
import ResultadosGenerales from '../components/economico/ResultadosGenerales'
import ListaLotesEconomicos from '../components/economico/ListaLotesEconomicos'
import DetalleLoteEconomico from '../components/economico/DetalleLoteEconomico'
import Proximamente from '../components/economico/Proximamente'
import CostosProduccion from '../components/economico/CostosProduccion'
import CostoForm from '../components/economico/CostoForm'
import { textoFecha, textoUsd } from '../components/economico/formato'
import {
  MENSAJE_SIN_PERMISO,
  describirErrorDashboard,
  type ErrorDashboard,
} from '../components/economico/errores'
import { IconAlert, IconMap, IconRefresh } from '../components/icons/Icons'
import { useAuth } from '../auth/useAuth'
import { PERMISOS } from '../auth/permisos'
import { obtenerDashboardEconomico } from '../services/economicoService'
import { obtenerCampanias, obtenerProvincias } from '../services/catalogoService'
import type { CampaniaApi, ProvinciaApi } from '../types/catalogo'
import type {
  DashboardEconomicoApi,
  FiltrosDashboardEconomico,
  LoteEconomicoApi,
  NuevoCostoApi,
} from '../types/economico'
import '../components/economico/Economico.css'

const DESCRIPCION =
  'Estimación de ingresos, costos y resultados de los lotes de soja con el precio de referencia y el costo de producción vigentes.'

/** Filtros pedidos al backend. Cada cambio o reintento dispara una nueva consulta. */
interface Consulta {
  filtros: ValoresFiltros
  intento: number
}

type Resultado =
  | { consulta: Consulta; dashboard: DashboardEconomicoApi; error: null }
  | { consulta: Consulta; dashboard: null; error: ErrorDashboard }

interface Opciones {
  campanias: CampaniaApi[]
  provincias: ProvinciaApi[]
}

function aParametros(filtros: ValoresFiltros): FiltrosDashboardEconomico {
  // «Todas» no se envía.
  return {
    campaniaId: filtros.campaniaId === TODAS ? undefined : Number(filtros.campaniaId),
    provinciaId: filtros.provinciaId === TODAS ? undefined : Number(filtros.provinciaId),
  }
}

function DashboardEconomicoPage() {
  const { tienePermiso } = useAuth()

  if (!tienePermiso(PERMISOS.consultarEconomico)) {
    return (
      <>
        <PageHeader title="Dashboard Económico" description={DESCRIPCION} />
        <StatusMessage type="error" message={MENSAJE_SIN_PERMISO} />
      </>
    )
  }
  return <DashboardEconomico />
}

function DashboardEconomico() {
  const { tienePermiso } = useAuth()
  const puedeRegistrarCosto = tienePermiso(PERMISOS.registrarCosto)
  // Completar datos productivos se hace en «Lotes y campañas»: requiere ver el catálogo y LOTE_PUT.
  const puedeCompletarDatos =
    tienePermiso(PERMISOS.modificarLote) && tienePermiso(PERMISOS.consultarCatalogo)

  const [consulta, setConsulta] = useState<Consulta>({
    filtros: { campaniaId: TODAS, provinciaId: TODAS },
    intento: 0,
  })
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [opciones, setOpciones] = useState<Opciones | null>(null)
  const [errorOpciones, setErrorOpciones] = useState<ErrorCarga | null>(null)
  const [intentoOpciones, setIntentoOpciones] = useState(0)
  const [seleccionado, setSeleccionado] = useState<LoteEconomicoApi | null>(null)
  const [versionCostos, setVersionCostos] = useState(0)
  const [registrandoCosto, setRegistrandoCosto] = useState(false)
  const [guardandoCosto, setGuardandoCosto] = useState(false)
  const [confirmacion, setConfirmacion] = useState<{ id: number; texto: string } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    obtenerDashboardEconomico(aParametros(consulta.filtros), controller.signal)
      .then((dashboard) => setResultado({ consulta, dashboard, error: null }))
      .catch((error) => {
        if (controller.signal.aborted) return
        setResultado({ consulta, dashboard: null, error: describirErrorDashboard(error) })
      })
    return () => controller.abort()
  }, [consulta])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([obtenerCampanias(controller.signal), obtenerProvincias(controller.signal)])
      .then(([campanias, provincias]) => {
        setOpciones({
          campanias: ordenarCampanias(campanias),
          provincias: [...provincias].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
        })
        setErrorOpciones(null)
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setErrorOpciones(errorDeCarga(error, 'las campañas y provincias'))
      })
    return () => controller.abort()
  }, [intentoOpciones])

  const cargando = resultado?.consulta !== consulta
  // Al actualizar o reintentar con los mismos filtros se mantienen los datos, atenuados. Con
  // filtros nuevos no se muestran los anteriores, porque no les corresponden.
  const mismosFiltros = resultado?.consulta.filtros === consulta.filtros

  function actualizar() {
    setConsulta((c) => ({ ...c, intento: c.intento + 1 }))
  }

  function cambiarFiltros(filtros: ValoresFiltros) {
    setConsulta({ filtros, intento: 0 })
  }

  function cerrarFormularioCosto() {
    if (!guardandoCosto) setRegistrandoCosto(false)
  }

  function handleCostoRegistrado(costo: NuevoCostoApi) {
    setRegistrandoCosto(false)
    // El costo vigente pudo cambiar: se vuelven a consultar el historial y los indicadores.
    setVersionCostos((n) => n + 1)
    actualizar()
    setConfirmacion({
      id: Date.now(),
      texto: `Se registró el costo de ${textoUsd(costo.costoPorHectarea, 'USD/ha')} vigente desde el ${textoFecha(costo.vigenciaDesde)}.`,
    })
  }

  let contenido
  if (!resultado || (cargando && !(mismosFiltros && resultado.dashboard))) {
    contenido = (
      <StatusMessage
        type="loading"
        message={resultado ? 'Actualizando el dashboard con los filtros seleccionados...' : 'Cargando el dashboard económico...'}
      />
    )
  } else if (resultado.error) {
    contenido = (
      <div className="economico-error">
        <ErrorConReintento error={resultado.error} onReintentar={actualizar} />
        {resultado.error.sinCostoVigente && puedeRegistrarCosto && (
          <p className="economico-seccion__nota">
            Podés registrarlo desde la sección «Costos de producción», más abajo.
          </p>
        )}
      </div>
    )
  } else {
    contenido = (
      <ContenidoDashboard
        dashboard={resultado.dashboard}
        hayFiltros={consulta.filtros.campaniaId !== TODAS || consulta.filtros.provinciaId !== TODAS}
        cargando={cargando}
        puedeCompletarDatos={puedeCompletarDatos}
        onSeleccionar={setSeleccionado}
      />
    )
  }

  return (
    <>
      <PageHeader
        title="Dashboard Económico"
        description={DESCRIPCION}
        actions={
          <button type="button" className="btn btn--secondary" onClick={actualizar} disabled={cargando}>
            <IconRefresh />
            Actualizar
          </button>
        }
      />

      {confirmacion && (
        <div className="economico-confirmacion">
          <StatusMessage key={confirmacion.id} type="success" message={confirmacion.texto} />
        </div>
      )}

      <div className="economico">
        <FiltrosDashboard
          valores={consulta.filtros}
          campanias={opciones?.campanias ?? null}
          provincias={opciones?.provincias ?? null}
          errorOpciones={errorOpciones}
          onChange={cambiarFiltros}
          onReintentarOpciones={() => {
            setErrorOpciones(null)
            setIntentoOpciones((n) => n + 1)
          }}
        />

        {contenido}

        <CostosProduccion
          version={versionCostos}
          puedeRegistrar={puedeRegistrarCosto}
          onRegistrar={() => setRegistrandoCosto(true)}
        />

        <Proximamente />
      </div>

      <Modal
        open={seleccionado !== null}
        title={seleccionado ? `Detalle económico · ${seleccionado.lote.nombre}` : ''}
        onClose={() => setSeleccionado(null)}
      >
        {seleccionado && (
          <DetalleLoteEconomico
            item={seleccionado}
            puedeCompletarDatos={puedeCompletarDatos}
            onClose={() => setSeleccionado(null)}
          />
        )}
      </Modal>

      {puedeRegistrarCosto && (
        <Modal
          open={registrandoCosto}
          title="Registrar costo de producción"
          onClose={cerrarFormularioCosto}
          bloqueado={guardandoCosto}
        >
          <CostoForm
            onCancel={cerrarFormularioCosto}
            onSaved={handleCostoRegistrado}
            onGuardandoChange={setGuardandoCosto}
          />
        </Modal>
      )}
    </>
  )
}

interface ContenidoDashboardProps {
  dashboard: DashboardEconomicoApi
  hayFiltros: boolean
  /** Se está actualizando con los mismos filtros: los datos se muestran atenuados. */
  cargando: boolean
  /** Permisos para completar datos productivos en «Lotes y campañas». */
  puedeCompletarDatos: boolean
  onSeleccionar: (lote: LoteEconomicoApi) => void
}

function ContenidoDashboard({
  dashboard,
  hayFiltros,
  cargando,
  puedeCompletarDatos,
  onSeleccionar,
}: ContenidoDashboardProps) {
  const { precioSoja, costoProduccion, rendimientoIndiferencia, totales, lotes, avisos } = dashboard
  // El backend ya incluye el aviso del precio en avisos[]; se agrega solo si faltara.
  const mensajes = [...avisos]
  if (precioSoja.aviso && !mensajes.includes(precioSoja.aviso)) mensajes.unshift(precioSoja.aviso)
  if (precioSoja.desactualizado && !precioSoja.aviso) {
    mensajes.unshift('El precio de referencia de la soja está desactualizado.')
  }
  const incompletos = lotes.filter((l) => !l.indicadores).length

  return (
    <div className={`economico__datos${cargando ? ' economico__datos--cargando' : ''}`} aria-busy={cargando}>
      {cargando && <StatusMessage type="loading" message="Actualizando el dashboard..." />}

      {mensajes.length > 0 && (
        <div className="economico-avisos" role="status">
          <IconAlert />
          <ul>
            {mensajes.map((mensaje) => (
              <li key={mensaje}>{mensaje}</li>
            ))}
          </ul>
        </div>
      )}

      <ReferenciasMercado
        precio={precioSoja}
        costo={costoProduccion}
        rendimientoIndiferencia={rendimientoIndiferencia}
      />

      <ResultadosGenerales totales={totales} />

      <section className="card section-card economico-seccion" aria-labelledby="economico-lotes">
        <h2 id="economico-lotes" className="section-card__title">
          Lotes
        </h2>
        <p className="section-card__subtitle">
          {lotes.length} {lotes.length === 1 ? 'lote' : 'lotes'}
          {hayFiltros ? ' con los filtros seleccionados' : ''}. Seleccioná un lote para ver su detalle.
        </p>
        {incompletos > 0 && (
          <p className="economico-seccion__nota economico-seccion__nota--aviso">
            Los lotes con datos incompletos se listan, pero no se incluyen en los totales económicos.
            {puedeCompletarDatos &&
              ' Abrí uno de esos lotes para ir a completar su superficie o rendimiento en «Lotes y campañas».'}
          </p>
        )}
        {lotes.length === 0 ? (
          <EmptyState
            icon={IconMap}
            title={hayFiltros ? 'No hay lotes para estos filtros' : 'Todavía no hay lotes'}
            description={
              hayFiltros
                ? 'Probá con otra campaña o provincia, o elegí «Todas».'
                : 'Cuando se registren lotes aparecerán aquí con sus indicadores económicos.'
            }
          />
        ) : (
          <ListaLotesEconomicos lotes={lotes} onSeleccionar={onSeleccionar} />
        )}
      </section>
    </div>
  )
}

export default DashboardEconomicoPage
