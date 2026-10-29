import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import StatusMessage from '../components/StatusMessage'
import EmptyState from '../components/EmptyState'
import ErrorConReintento from '../components/monitoreo/ErrorConReintento'
import type { ErrorCarga } from '../components/monitoreo/errores'
import ListaLotes from '../components/gestion/ListaLotes'
import ListaCampanias from '../components/gestion/ListaCampanias'
import LoteForm from '../components/gestion/LoteForm'
import CampaniaForm from '../components/gestion/CampaniaForm'
import FechaSiembraForm from '../components/gestion/FechaSiembraForm'
import DatosProductivosForm from '../components/gestion/DatosProductivosForm'
import DepartamentoForm from '../components/gestion/DepartamentoForm'
import { errorDeCarga } from '../components/gestion/errores'
import { lotesPorCampania, ordenarCampanias, ordenarLotes } from '../components/gestion/presentacion'
import { IconCalendar, IconMap, IconPlus } from '../components/icons/Icons'
import { useAuth } from '../auth/useAuth'
import { PERMISOS } from '../auth/permisos'
import type { EstadoCompletarDatos } from '../config/navigation'
import { obtenerCampanias, obtenerLotes, obtenerProvincias } from '../services/catalogoService'
import type { CampaniaApi, LoteApi, ProvinciaApi } from '../types/catalogo'
import { formatearFecha, formatearNumero, parsearDecimal } from '../utils/format'
import '../components/gestion/Gestion.css'

type Pestania = 'lotes' | 'campanias'

const PESTANIAS: { id: Pestania; texto: string }[] = [
  { id: 'lotes', texto: 'Lotes' },
  { id: 'campanias', texto: 'Campañas' },
]

type ModalActivo =
  | { tipo: 'lote' }
  | { tipo: 'campania' }
  | { tipo: 'siembra'; lote: LoteApi }
  | { tipo: 'datos'; lote: LoteApi }
  | { tipo: 'departamento'; lote: LoteApi }
  | null

interface Datos {
  lotes: LoteApi[]
  campanias: CampaniaApi[]
  provincias: ProvinciaApi[]
}

interface Resultado {
  intento: number
  datos: Datos | null
  error: ErrorCarga | null
}

const TODAS = ''

function LotesCampaniasPage() {
  const { tienePermiso } = useAuth()
  const puedeConsultar = tienePermiso(PERMISOS.consultarCatalogo)
  const puedeCrearLote = tienePermiso(PERMISOS.crearLote)
  const puedeCrearCampania = tienePermiso(PERMISOS.crearCampania)
  const puedeVerificarObservaciones = tienePermiso(PERMISOS.consultarMonitoreo)
  // Completar la siembra exige comprobar antes las observaciones del lote (MONITOREO_GET).
  const puedeCompletarSiembra = tienePermiso(PERMISOS.modificarLote) && puedeVerificarObservaciones
  const puedeCompletarDatos = tienePermiso(PERMISOS.modificarLote)
  const puedeCompletarDepartamento = tienePermiso(PERMISOS.modificarLote)

  // El Dashboard económico puede abrir esta pantalla para completar los datos de un lote.
  const location = useLocation()
  const navigate = useNavigate()
  const [loteACompletar, setLoteACompletar] = useState(
    () => (location.state as EstadoCompletarDatos | null)?.completarDatosLoteId ?? null,
  )

  const [pestania, setPestania] = useState<Pestania>('lotes')
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [campaniaFiltro, setCampaniaFiltro] = useState(TODAS)
  const [modal, setModal] = useState<ModalActivo>(null)
  const [guardando, setGuardando] = useState(false)
  const [confirmacion, setConfirmacion] = useState<{ id: number; texto: string } | null>(null)

  useEffect(() => {
    if (!puedeConsultar) return
    const controller = new AbortController()
    Promise.all([
      obtenerLotes(controller.signal),
      obtenerCampanias(controller.signal),
      obtenerProvincias(controller.signal),
    ])
      .then(([lotes, campanias, provincias]) =>
        setResultado({
          intento,
          datos: { lotes: ordenarLotes(lotes), campanias: ordenarCampanias(campanias), provincias },
          error: null,
        }),
      )
      .catch((error) => {
        if (controller.signal.aborted) return
        setResultado({ intento, datos: null, error: errorDeCarga(error, 'los lotes y campañas') })
      })
    return () => controller.abort()
  }, [intento, puedeConsultar])

  const vigente = resultado?.intento === intento ? resultado : null
  const datos = vigente?.datos ?? null

  // Cuando llegan los lotes, se abre el formulario del lote pedido desde el Dashboard.
  if (loteACompletar !== null && datos) {
    setLoteACompletar(null)
    const lote = datos.lotes.find((l) => l.id === loteACompletar)
    if (lote && puedeCompletarDatos) {
      setModal({ tipo: 'datos', lote })
      setCampaniaFiltro(TODAS)
    }
  }

  // El pedido del Dashboard se usa una sola vez: no vuelve a abrirse al recargar la página.
  useEffect(() => {
    if ((location.state as EstadoCompletarDatos | null)?.completarDatosLoteId) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  function actualizarDatos(cambio: (datos: Datos) => Datos) {
    setResultado((prev) => (prev?.datos ? { ...prev, datos: cambio(prev.datos) } : prev))
  }

  function cerrarModal() {
    if (!guardando) setModal(null)
  }

  function avisar(texto: string) {
    setConfirmacion({ id: Date.now(), texto })
    setModal(null)
  }

  function handleCampaniaCreada(campania: CampaniaApi) {
    actualizarDatos((d) => ({ ...d, campanias: ordenarCampanias([...d.campanias, campania]) }))
    avisar(`Se creó la campaña «${campania.nombre}».`)
  }

  function handleLoteCreado(lote: LoteApi) {
    actualizarDatos((d) => ({ ...d, lotes: ordenarLotes([...d.lotes, lote]) }))
    // Si el filtro ocultaría el lote nuevo, se muestran todas las campañas.
    if (campaniaFiltro !== TODAS && campaniaFiltro !== String(lote.campania.id)) {
      setCampaniaFiltro(TODAS)
    }
    avisar(`Se creó el lote «${lote.nombre}» en la campaña ${lote.campania.nombre}.`)
  }

  /** Reemplaza el lote en el listado: tras registrar la fecha o si el backend ya tenía una. */
  // Estable entre renders: el formulario de siembra la usa dentro de un efecto.
  const handleLoteActualizado = useCallback((lote: LoteApi) => {
    setResultado((prev) =>
      prev?.datos
        ? {
            ...prev,
            datos: { ...prev.datos, lotes: prev.datos.lotes.map((l) => (l.id === lote.id ? lote : l)) },
          }
        : prev,
    )
  }, [])

  function handleSiembraRegistrada(lote: LoteApi) {
    handleLoteActualizado(lote)
    avisar(
      lote.fechaSiembra
        ? `Se registró el ${formatearFecha(lote.fechaSiembra)} como fecha de siembra de «${lote.nombre}».`
        : `Se actualizó el lote «${lote.nombre}».`,
    )
  }

  function handleDatosRegistrados(lote: LoteApi) {
    handleLoteActualizado(lote)
    const partes: string[] = []
    const superficie = parsearDecimal(lote.superficie)
    const rendimiento = parsearDecimal(lote.rendimiento)
    if (superficie !== null) partes.push(`superficie ${formatearNumero(superficie, 2)} ha`)
    if (rendimiento !== null) partes.push(`rendimiento esperado ${formatearNumero(rendimiento, 2)} t/ha`)
    avisar(
      `Se actualizaron los datos productivos de «${lote.nombre}»${partes.length ? `: ${partes.join(' y ')}` : ''}. El Dashboard económico los usará en su próxima consulta.`,
    )
  }

  function handleDepartamentoAsignado(lote: LoteApi) {
    handleLoteActualizado(lote)
    avisar(
      lote.departamento
        ? `Se asignó el departamento ${lote.departamento.nombre} a «${lote.nombre}». El Monitoreo usará el clima de ese departamento.`
        : `Se actualizó el lote «${lote.nombre}».`,
    )
  }

  function handleTeclaPestania(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const siguiente = pestania === 'lotes' ? 'campanias' : 'lotes'
    setPestania(siguiente)
    document.getElementById(`pestania-${siguiente}`)?.focus()
  }

  const header = (
    <PageHeader
      title="Lotes y campañas"
      description="Consultá y registrá las campañas agrícolas y los lotes que usan el Monitoreo y el Simulador."
    />
  )

  if (!puedeConsultar) {
    return (
      <>
        {header}
        <StatusMessage
          type="error"
          message="Tu usuario no tiene permiso para consultar los lotes y campañas."
        />
      </>
    )
  }

  let contenido
  if (!vigente) {
    contenido = <StatusMessage type="loading" message="Cargando lotes y campañas..." />
  } else if (vigente.error || !datos) {
    contenido = (
      <ErrorConReintento
        error={vigente.error ?? { mensaje: 'No se pudieron cargar los datos.', reintentable: true }}
        onReintentar={() => setIntento((n) => n + 1)}
      />
    )
  } else if (pestania === 'lotes') {
    const visibles =
      campaniaFiltro === TODAS
        ? datos.lotes
        : datos.lotes.filter((l) => String(l.campania.id) === campaniaFiltro)
    const sinSiembra = visibles.filter((l) => !l.fechaSiembra).length

    contenido = (
      <>
        <div className="gestion-barra">
          {datos.lotes.length > 0 && (
            <label className="form-field gestion-barra__filtro">
              <span className="form-field__label">Campaña</span>
              <select value={campaniaFiltro} onChange={(e) => setCampaniaFiltro(e.target.value)}>
                <option value={TODAS}>Todas las campañas</option>
                {datos.campanias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}
          {puedeCrearLote && (
            <button type="button" className="btn btn--primary" onClick={() => setModal({ tipo: 'lote' })}>
              <IconPlus />
              Nuevo lote
            </button>
          )}
        </div>

        {datos.lotes.length === 0 ? (
          <EmptyState
            icon={IconMap}
            title="Todavía no hay lotes registrados"
            description={
              puedeCrearLote
                ? 'Creá el primer lote para usarlo en el Monitoreo y en el Simulador.'
                : 'Cuando se registren lotes aparecerán aquí.'
            }
          />
        ) : visibles.length === 0 ? (
          <StatusMessage type="empty" message="No hay lotes registrados en esta campaña." />
        ) : (
          <>
            <p className="gestion-resumen" aria-live="polite">
              {visibles.length} {visibles.length === 1 ? 'lote' : 'lotes'}
              {sinSiembra > 0 && ` · ${sinSiembra} sin fecha de siembra`}
            </p>
            <ListaLotes
              lotes={visibles}
              puedeCompletarSiembra={puedeCompletarSiembra}
              onCompletarSiembra={(lote) => setModal({ tipo: 'siembra', lote })}
              puedeCompletarDatos={puedeCompletarDatos}
              onCompletarDatos={(lote) => setModal({ tipo: 'datos', lote })}
              puedeCompletarDepartamento={puedeCompletarDepartamento}
              onCompletarDepartamento={(lote) => setModal({ tipo: 'departamento', lote })}
            />
          </>
        )}
      </>
    )
  } else {
    contenido = (
      <>
        <div className="gestion-barra">
          <p className="gestion-resumen">
            {datos.campanias.length} {datos.campanias.length === 1 ? 'campaña' : 'campañas'}
          </p>
          {puedeCrearCampania && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setModal({ tipo: 'campania' })}
            >
              <IconPlus />
              Nueva campaña
            </button>
          )}
        </div>
        {datos.campanias.length === 0 ? (
          <EmptyState
            icon={IconCalendar}
            title="Todavía no hay campañas registradas"
            description={
              puedeCrearCampania
                ? 'Creá una campaña para poder registrar lotes.'
                : 'Cuando se registren campañas aparecerán aquí.'
            }
          />
        ) : (
          <ListaCampanias campanias={datos.campanias} cantidadLotes={lotesPorCampania(datos.lotes)} />
        )}
      </>
    )
  }

  return (
    <>
      {header}

      {confirmacion && (
        <div className="gestion-confirmacion">
          <StatusMessage key={confirmacion.id} type="success" message={confirmacion.texto} />
        </div>
      )}

      <div className="gestion-pestanias" role="tablist" aria-label="Lotes y campañas">
        {PESTANIAS.map(({ id, texto }) => (
          <button
            key={id}
            id={`pestania-${id}`}
            type="button"
            role="tab"
            className={`gestion-pestanias__tab${pestania === id ? ' gestion-pestanias__tab--activa' : ''}`}
            aria-selected={pestania === id}
            aria-controls="panel-gestion"
            tabIndex={pestania === id ? 0 : -1}
            onClick={() => setPestania(id)}
            onKeyDown={handleTeclaPestania}
          >
            {texto}
            {datos && (
              <span className="gestion-pestanias__cantidad">
                {id === 'lotes' ? datos.lotes.length : datos.campanias.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <section
        id="panel-gestion"
        role="tabpanel"
        aria-labelledby={`pestania-${pestania}`}
        className="card section-card gestion-panel"
      >
        {contenido}
      </section>

      {datos && (
        <>
          <Modal
            open={modal?.tipo === 'campania'}
            title="Nueva campaña"
            onClose={cerrarModal}
            bloqueado={guardando}
          >
            <CampaniaForm
              onCancel={cerrarModal}
              onSaved={handleCampaniaCreada}
              onGuardandoChange={setGuardando}
            />
          </Modal>

          <Modal open={modal?.tipo === 'lote'} title="Nuevo lote" onClose={cerrarModal} bloqueado={guardando}>
            <LoteForm
              campanias={datos.campanias}
              provincias={datos.provincias}
              campaniaInicial={campaniaFiltro === TODAS ? null : Number(campaniaFiltro)}
              onCancel={cerrarModal}
              onSaved={handleLoteCreado}
              onGuardandoChange={setGuardando}
            />
          </Modal>

          <Modal
            open={modal?.tipo === 'siembra'}
            title="Completar fecha de siembra"
            onClose={cerrarModal}
            bloqueado={guardando}
          >
            {modal?.tipo === 'siembra' && (
              <FechaSiembraForm
                key={modal.lote.id}
                lote={modal.lote}
                puedeVerificarObservaciones={puedeVerificarObservaciones}
                onCancel={cerrarModal}
                onSaved={handleSiembraRegistrada}
                onLoteActualizado={handleLoteActualizado}
                onGuardandoChange={setGuardando}
              />
            )}
          </Modal>

          <Modal
            open={modal?.tipo === 'datos'}
            title="Completar datos productivos"
            onClose={cerrarModal}
            bloqueado={guardando}
          >
            {modal?.tipo === 'datos' && (
              <DatosProductivosForm
                key={modal.lote.id}
                // Se usa la versión del listado, que se actualiza si otro usuario cargó datos.
                lote={datos.lotes.find((l) => l.id === modal.lote.id) ?? modal.lote}
                onCancel={cerrarModal}
                onSaved={handleDatosRegistrados}
                onLoteActualizado={handleLoteActualizado}
                onGuardandoChange={setGuardando}
              />
            )}
          </Modal>

          <Modal
            open={modal?.tipo === 'departamento'}
            title="Completar departamento"
            onClose={cerrarModal}
            bloqueado={guardando}
          >
            {modal?.tipo === 'departamento' && (
              <DepartamentoForm
                key={modal.lote.id}
                // Se usa la versión del listado, que se actualiza si otro usuario asignó el departamento.
                lote={datos.lotes.find((l) => l.id === modal.lote.id) ?? modal.lote}
                onCancel={cerrarModal}
                onSaved={handleDepartamentoAsignado}
                onLoteActualizado={handleLoteActualizado}
                onGuardandoChange={setGuardando}
              />
            )}
          </Modal>
        </>
      )}
    </>
  )
}

export default LotesCampaniasPage
