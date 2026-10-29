import { useEffect, useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import CampoFecha from '../CampoFecha'
import ErrorConReintento from '../monitoreo/ErrorConReintento'
import type { ErrorCarga } from '../monitoreo/errores'
import { ApiError } from '../../services/apiClient'
import { obtenerLote, registrarFechaSiembra } from '../../services/catalogoService'
import { obtenerObservacionesPaginadas } from '../../services/monitoreoService'
import type { Paginado } from '../../types/api'
import type { LoteApi } from '../../types/catalogo'
import type { ObservacionApi } from '../../types/monitoreoApi'
import { formatearFecha, formatearFechaLarga } from '../../utils/format'
import { mensajeErrorGuardado } from './errores'
import { errorFechaObligatoria, esFechaIsoValida } from './validacion'
import { useGuardado } from './useGuardado'

interface FechaSiembraFormProps {
  lote: LoteApi
  /** Hace falta MONITOREO_GET para comprobar si el lote ya tiene observaciones. */
  puedeVerificarObservaciones: boolean
  onCancel: () => void
  onSaved: (lote: LoteApi) => void
  /** El backend informó datos más recientes del lote (por ejemplo, una fecha ya registrada). */
  onLoteActualizado: (lote: LoteApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

/** Observaciones que ya tiene el lote: cuántas y la fecha de la más antigua. */
interface ObservacionesPrevias {
  total: number
  primeraFecha: string | null
}

type Verificacion =
  | { estado: 'error'; intento: number; error: ErrorCarga }
  | { estado: 'yaRegistrada'; intento: number; fechaSiembra: string }
  | { estado: 'lista'; intento: number; observaciones: ObservacionesPrevias }

const MENSAJE_BLOQUEO =
  'Para evitar un cambio sin control, la fecha de siembra no se puede registrar desde aquí.'

const MENSAJE_SIN_VERIFICACION = `No se pudo verificar de forma fiable si el lote tiene observaciones registradas. ${MENSAJE_BLOQUEO}`

/** El otro usuario (o Swagger) registró la fecha mientras el formulario estaba abierto. */
class FechaYaRegistrada extends Error {
  readonly lote: LoteApi

  constructor(lote: LoteApi) {
    super('La fecha de siembra ya fue registrada')
    this.lote = lote
  }
}

/** Comprueba que la respuesta tenga el formato paginado del backend (commit f238582 o posterior). */
function esPaginaValida(pagina: Paginado<ObservacionApi> | null): pagina is Paginado<ObservacionApi> {
  return (
    !!pagina &&
    Array.isArray(pagina.data) &&
    Number.isInteger(pagina.total) &&
    Number.isInteger(pagina.totalPages)
  )
}

/** Cantidad de observaciones del lote y la fecha de la más antigua, con los endpoints paginados. */
async function consultarObservaciones(loteId: number, signal: AbortSignal): Promise<ObservacionesPrevias> {
  const primera = await obtenerObservacionesPaginadas(loteId, 1, 1, signal)
  if (!esPaginaValida(primera)) throw new Error(MENSAJE_SIN_VERIFICACION)
  if (primera.total === 0) return { total: 0, primeraFecha: null }

  // Vienen de la más reciente a la más antigua: con una por página, la última es la más antigua.
  const ultima = await obtenerObservacionesPaginadas(loteId, primera.total, 1, signal)
  const fecha = esPaginaValida(ultima) ? ultima.data[0]?.fecha : undefined
  if (!fecha || !esFechaIsoValida(fecha)) throw new Error(MENSAJE_SIN_VERIFICACION)
  return { total: primera.total, primeraFecha: fecha }
}

function errorDeVerificacion(error: unknown): ErrorCarga {
  if (!(error instanceof ApiError)) {
    const mensaje = error instanceof Error ? error.message : MENSAJE_SIN_VERIFICACION
    return { mensaje, reintentable: false }
  }
  switch (error.status) {
    case 0:
      return { mensaje: `${error.mensajes.join(' ')} ${MENSAJE_SIN_VERIFICACION}`, reintentable: true }
    case 401:
      return { mensaje: 'La sesión expiró. Iniciá sesión nuevamente.', reintentable: false }
    case 403:
      return {
        mensaje: `Tu usuario no tiene permiso para consultar este lote o sus observaciones. ${MENSAJE_SIN_VERIFICACION}`,
        reintentable: false,
      }
    case 404:
      return {
        mensaje: 'El lote ya no existe. Cerrá el formulario y recargá la página.',
        reintentable: false,
      }
    default:
      return { mensaje: `${error.mensajes.join(' ')} ${MENSAJE_SIN_VERIFICACION}`, reintentable: true }
  }
}

function FechaSiembraForm({
  lote,
  puedeVerificarObservaciones,
  onCancel,
  onSaved,
  onLoteActualizado,
  onGuardandoChange,
}: FechaSiembraFormProps) {
  const [intento, setIntento] = useState(0)
  const [verificacion, setVerificacion] = useState<Verificacion | null>(null)
  const [fecha, setFecha] = useState('')
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)

  // Antes de mostrar el formulario se confirma que el lote siga sin fecha y se consultan sus observaciones.
  useEffect(() => {
    if (!puedeVerificarObservaciones) return
    const controller = new AbortController()
    obtenerLote(lote.id, controller.signal)
      .then(async (actual) => {
        if (actual.fechaSiembra) {
          onLoteActualizado(actual)
          setVerificacion({ estado: 'yaRegistrada', intento, fechaSiembra: actual.fechaSiembra })
          return
        }
        const observaciones = await consultarObservaciones(lote.id, controller.signal)
        setVerificacion({ estado: 'lista', intento, observaciones })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setVerificacion({ estado: 'error', intento, error: errorDeVerificacion(error) })
      })
    return () => controller.abort()
  }, [lote.id, intento, puedeVerificarObservaciones, onLoteActualizado])

  const encabezado = (
    <div className="form-field">
      <span className="form-field__label">Lote</span>
      <div className="form-field__readonly">
        {lote.nombre}{' '}
        <small>
          · {lote.campania.nombre} · {lote.provincia.nombre}
        </small>
      </div>
    </div>
  )

  const botonCerrar = (
    <div className="form__actions">
      <button type="button" className="btn btn--secondary" onClick={onCancel}>
        Cerrar
      </button>
    </div>
  )

  if (!puedeVerificarObservaciones) {
    return (
      <div className="form">
        {encabezado}
        <StatusMessage
          type="error"
          message={`Tu usuario no tiene permiso para consultar el Monitoreo, por lo que no se puede comprobar si el lote ya tiene observaciones registradas. ${MENSAJE_BLOQUEO}`}
        />
        {botonCerrar}
      </div>
    )
  }

  const vigente = verificacion?.intento === intento ? verificacion : null

  if (!vigente) {
    return (
      <div className="form">
        {encabezado}
        <StatusMessage type="loading" message="Verificando el lote y sus observaciones..." />
      </div>
    )
  }

  if (vigente.estado === 'error') {
    return (
      <div className="form">
        {encabezado}
        <ErrorConReintento error={vigente.error} onReintentar={() => setIntento((n) => n + 1)} />
        {botonCerrar}
      </div>
    )
  }

  if (vigente.estado === 'yaRegistrada') {
    return (
      <div className="form">
        {encabezado}
        <StatusMessage
          type="empty"
          message={`Este lote ya tiene registrada la fecha de siembra del ${formatearFecha(vigente.fechaSiembra)}. No se puede modificar desde SID-Agro. No se guardó ningún cambio.`}
        />
        {botonCerrar}
      </div>
    )
  }

  const { total, primeraFecha } = vigente.observaciones
  const validar = (): string | undefined => {
    const error = errorFechaObligatoria(fecha, 'fecha de siembra')
    if (error) return error
    // Mismo criterio que el backend al registrar observaciones: no pueden ser anteriores a la siembra.
    if (primeraFecha && fecha > primeraFecha) {
      return `La siembra no puede ser posterior a la primera observación registrada (${formatearFecha(primeraFecha)}).`
    }
    return undefined
  }
  const errorFecha = intentoEnvio ? validar() : undefined

  const avisoObservaciones = total > 0 && primeraFecha && (
    <p className="gestion-aviso">
      Este lote ya tiene {total} {total === 1 ? 'observación registrada' : 'observaciones registradas'}{' '}
      (la primera del {formatearFecha(primeraFecha)}). Las observaciones guardadas sin fecha de siembra
      no tienen etapa fenológica ni GDDA estimados, y no se recalcularán al registrarla. El cálculo de
      riesgo del Monitoreo sí las va a tener en cuenta.
    </p>
  )

  function handleContinuar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntentoEnvio(true)
    if (validar()) return
    setConfirmando(true)
  }

  function handleConfirmar() {
    guardar(
      async () => {
        // Se vuelve a consultar justo antes de guardar para no pisar una fecha registrada por otro usuario.
        const actual = await obtenerLote(lote.id)
        if (actual.fechaSiembra) throw new FechaYaRegistrada(actual)
        return registrarFechaSiembra(lote.id, { fechaSiembra: fecha })
      },
      onSaved,
      (error) => {
        if (error instanceof FechaYaRegistrada && error.lote.fechaSiembra) {
          onLoteActualizado(error.lote)
          setVerificacion({ estado: 'yaRegistrada', intento, fechaSiembra: error.lote.fechaSiembra })
          return ''
        }
        return mensajeErrorGuardado(error, {
          accion: 'registrar fechas de siembra',
          noEncontrado: 'El lote ya no existe. Cerrá el formulario y recargá la página.',
        })
      },
    )
  }

  if (confirmando) {
    return (
      <div className="form">
        {encabezado}
        <div className="gestion-confirmar" role="alertdialog" aria-labelledby="siembra-confirmar-titulo">
          <strong id="siembra-confirmar-titulo">
            ¿Registrar el {formatearFechaLarga(fecha)} como fecha de siembra?
          </strong>
          <ul>
            <li>
              El Monitoreo de chinche verde calculará desde esta fecha los grados día, la etapa
              fenológica, el riesgo y las fechas de monitoreo del lote.
            </li>
            <li>Una vez registrada, no podrá modificarse desde SID-Agro.</li>
          </ul>
        </div>
        {avisoObservaciones}

        {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}

        <div className="form__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setConfirmando(false)}
            disabled={guardando}
          >
            Volver
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleConfirmar}
            disabled={guardando}
            aria-busy={guardando}
          >
            {guardando && <span className="btn__spinner gestion-form__spinner" aria-hidden="true" />}
            {guardando ? 'Guardando...' : 'Confirmar y registrar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleContinuar} noValidate>
      {encabezado}
      {avisoObservaciones}

      <label className="form-field">
        <span className="form-field__label">Fecha de siembra *</span>
        <CampoFecha
          value={fecha}
          max={primeraFecha ?? undefined}
          onChange={(valor) => setFecha(valor)}
          invalid={!!errorFecha}
        />
        {errorFecha && <span className="form-field__error">{errorFecha}</span>}
      </label>

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary">
          Continuar
        </button>
      </div>
    </form>
  )
}

export default FechaSiembraForm
