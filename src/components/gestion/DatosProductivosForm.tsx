import { useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import { obtenerLote, completarDatosProductivos } from '../../services/catalogoService'
import type { DatosProductivosApi, LoteApi } from '../../types/catalogo'
import { mensajeErrorGuardado } from './errores'
import { textoRendimiento, textoSuperficie } from './presentacion'
import { leerRendimiento, leerSuperficie } from './validacion'
import { useGuardado } from './useGuardado'

interface DatosProductivosFormProps {
  lote: LoteApi
  onCancel: () => void
  onSaved: (lote: LoteApi) => void
  /** El backend informó datos más recientes del lote (otro usuario los cargó). */
  onLoteActualizado: (lote: LoteApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

type Campo = 'superficie' | 'rendimiento'

type Errores = Partial<Record<Campo | 'general', string>>

/** Datos productivos que le faltan al lote. */
function datosFaltantes(lote: LoteApi): Campo[] {
  const faltantes: Campo[] = []
  if (lote.superficie === null) faltantes.push('superficie')
  if (lote.rendimiento === null) faltantes.push('rendimiento')
  return faltantes
}

const LEER: Record<Campo, typeof leerSuperficie> = {
  superficie: leerSuperficie,
  rendimiento: leerRendimiento,
}

/** Otro usuario cargó alguno de los datos mientras el formulario estaba abierto. */
class DatosYaCargados extends Error {
  readonly lote: LoteApi

  constructor(lote: LoteApi) {
    super('El lote ya tiene cargados esos datos')
    this.lote = lote
  }
}

function validar(faltantes: Campo[], valores: Record<Campo, string>): Errores {
  const errores: Errores = {}
  let cargados = 0
  faltantes.forEach((campo) => {
    const lectura = LEER[campo](valores[campo])
    if ('error' in lectura) errores[campo] = lectura.error
    else if (lectura.valor !== null) cargados++
  })
  if (cargados === 0 && Object.keys(errores).length === 0) {
    errores.general =
      faltantes.length === 1
        ? `Ingresá ${faltantes[0] === 'superficie' ? 'la superficie' : 'el rendimiento esperado'}.`
        : 'Ingresá al menos uno de los dos datos.'
  }
  return errores
}

/** Solo los campos que faltaban y se completaron; nunca null. */
function aCambios(faltantes: Campo[], valores: Record<Campo, string>): DatosProductivosApi {
  const cambios: DatosProductivosApi = {}
  faltantes.forEach((campo) => {
    const lectura = LEER[campo](valores[campo])
    if ('valor' in lectura && lectura.valor !== null) cambios[campo] = lectura.valor
  })
  return cambios
}

/**
 * Carga la superficie y/o el rendimiento esperado de un lote que no los tiene. Solo muestra los
 * campos que faltan y nunca modifica un dato ya cargado.
 */
function DatosProductivosForm({
  lote,
  onCancel,
  onSaved,
  onLoteActualizado,
  onGuardandoChange,
}: DatosProductivosFormProps) {
  const [valores, setValores] = useState<Record<Campo, string>>({ superficie: '', rendimiento: '' })
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [avisoConcurrencia, setAvisoConcurrencia] = useState<string | null>(null)
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)

  const faltantes = datosFaltantes(lote)
  const errores = intentoEnvio ? validar(faltantes, valores) : {}

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

  // Ya no falta nada (por ejemplo, otro usuario completó los datos): solo se muestran.
  if (faltantes.length === 0) {
    return (
      <div className="form">
        {encabezado}
        <StatusMessage
          type="empty"
          message={`${avisoConcurrencia ?? 'Este lote ya tiene cargados sus datos productivos.'} Superficie: ${textoSuperficie(lote.superficie)}. Rendimiento esperado: ${textoRendimiento(lote.rendimiento)}. No se guardó ningún cambio.`}
        />
        <div className="form__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntentoEnvio(true)
    if (Object.keys(validar(faltantes, valores)).length > 0) return
    const cambios = aCambios(faltantes, valores)

    guardar(
      async () => {
        // Se vuelve a consultar justo antes de guardar para no pisar datos cargados por otro usuario.
        const actual = await obtenerLote(lote.id)
        const yaCargados = (Object.keys(cambios) as Campo[]).filter((campo) => actual[campo] !== null)
        if (yaCargados.length > 0) throw new DatosYaCargados(actual)
        return completarDatosProductivos(lote.id, cambios)
      },
      onSaved,
      (error) => {
        if (error instanceof DatosYaCargados) {
          // El formulario se adapta a lo que sigue faltando y no se envía nada.
          onLoteActualizado(error.lote)
          setAvisoConcurrencia('Otro usuario cargó datos de este lote mientras el formulario estaba abierto.')
          return 'Otro usuario cargó datos de este lote mientras el formulario estaba abierto. Revisá lo que falta y volvé a guardar.'
        }
        return mensajeErrorGuardado(error, {
          accion: 'modificar lotes',
          noEncontrado: 'El lote ya no existe. Cerrá el formulario y recargá la página.',
        })
      },
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {encabezado}

      <p className="gestion-form__nota">
        Se usan en el Dashboard económico para estimar la producción, los ingresos y los costos del
        lote. Solo se pueden cargar los datos que faltan.
      </p>

      <div className="gestion-form__fila">
        {faltantes.includes('superficie') ? (
          <label className="form-field">
            <span className="form-field__label">Superficie (ha)</span>
            <input
              type="text"
              inputMode="decimal"
              value={valores.superficie}
              onChange={(e) => setValores((v) => ({ ...v, superficie: e.target.value }))}
              disabled={guardando}
              placeholder="Por ejemplo, 120,5"
              aria-invalid={!!errores.superficie}
            />
            {errores.superficie && <span className="form-field__error">{errores.superficie}</span>}
          </label>
        ) : (
          <div className="form-field">
            <span className="form-field__label">Superficie</span>
            <div className="form-field__readonly">{textoSuperficie(lote.superficie)}</div>
          </div>
        )}

        {faltantes.includes('rendimiento') ? (
          <label className="form-field">
            <span className="form-field__label">Rendimiento esperado (t/ha)</span>
            <input
              type="text"
              inputMode="decimal"
              value={valores.rendimiento}
              onChange={(e) => setValores((v) => ({ ...v, rendimiento: e.target.value }))}
              disabled={guardando}
              placeholder="Por ejemplo, 3,2"
              aria-invalid={!!errores.rendimiento}
            />
            {errores.rendimiento && <span className="form-field__error">{errores.rendimiento}</span>}
          </label>
        ) : (
          <div className="form-field">
            <span className="form-field__label">Rendimiento esperado</span>
            <div className="form-field__readonly">{textoRendimiento(lote.rendimiento)}</div>
          </div>
        )}
      </div>

      {errores.general && <span className="form-field__error">{errores.general}</span>}

      <p className="gestion-aviso">
        Revisá los valores antes de guardar: una vez cargados no se pueden modificar desde SID-Agro.
      </p>

      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={guardando} aria-busy={guardando}>
          {guardando && <span className="btn__spinner gestion-form__spinner" aria-hidden="true" />}
          {guardando ? 'Guardando...' : 'Guardar datos'}
        </button>
      </div>
    </form>
  )
}

export default DatosProductivosForm
