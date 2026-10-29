import { useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import CampoFecha from '../CampoFecha'
import { mensajeErrorGuardado } from '../gestion/errores'
import { errorFechaObligatoria, leerDecimalPositivo } from '../gestion/validacion'
import { useGuardado } from '../gestion/useGuardado'
import { ApiError } from '../../services/apiClient'
import { registrarCosto } from '../../services/economicoService'
import type { NuevoCostoApi } from '../../types/economico'
import { textoFecha } from './formato'
import '../gestion/Gestion.css'

// Límites de CreateCostoDto.
const MAX_FUENTE = 255
const MAX_DETALLE = 2000

interface CostoFormProps {
  onCancel: () => void
  /** Recibe el costo enviado; el historial se vuelve a consultar al backend. */
  onSaved: (costo: NuevoCostoApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

interface Valores {
  costoPorHectarea: string
  vigenciaDesde: string
  fuente: string
  detalle: string
}

type Errores = Partial<Record<keyof Valores, string>>

function leerCosto(texto: string) {
  return leerDecimalPositivo(texto, { nombre: 'El costo', ejemplo: '925,50' })
}

function validar(valores: Valores): Errores {
  const errores: Errores = {}
  const costo = leerCosto(valores.costoPorHectarea)
  if ('error' in costo) errores.costoPorHectarea = costo.error
  else if (costo.valor === null) errores.costoPorHectarea = 'Ingresá el costo por hectárea.'

  const errorFecha = errorFechaObligatoria(valores.vigenciaDesde, 'fecha de inicio de vigencia')
  if (errorFecha) errores.vigenciaDesde = errorFecha

  if (valores.fuente.trim().length > MAX_FUENTE) {
    errores.fuente = `La fuente admite hasta ${MAX_FUENTE} caracteres.`
  }
  if (valores.detalle.trim().length > MAX_DETALLE) {
    errores.detalle = `El detalle admite hasta ${MAX_DETALLE} caracteres.`
  }
  return errores
}

function CostoForm({ onCancel, onSaved, onGuardandoChange }: CostoFormProps) {
  const [valores, setValores] = useState<Valores>({
    costoPorHectarea: '',
    vigenciaDesde: '',
    fuente: '',
    detalle: '',
  })
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)

  const errores = intentoEnvio ? validar(valores) : {}

  function actualizar(campo: keyof Valores, valor: string) {
    setValores((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntentoEnvio(true)
    if (Object.keys(validar(valores)).length > 0) return

    const costo = leerCosto(valores.costoPorHectarea)
    if (!('valor' in costo) || costo.valor === null) return
    const fuente = valores.fuente.trim()
    const detalle = valores.detalle.trim()
    const nuevo: NuevoCostoApi = {
      costoPorHectarea: costo.valor,
      vigenciaDesde: valores.vigenciaDesde,
      // Los opcionales vacíos no se envían.
      ...(fuente && { fuente }),
      ...(detalle && { detalle }),
    }
    guardar(
      () => registrarCosto(nuevo),
      () => onSaved(nuevo),
      (error) =>
        error instanceof ApiError && error.status === 409
          ? `Ya hay un costo registrado con vigencia desde el ${textoFecha(nuevo.vigenciaDesde)}. Elegí otra fecha.`
          : mensajeErrorGuardado(error, {
              accion: 'registrar costos de producción',
              noEncontrado: 'No se encontró el servicio de costos. Recargá la página.',
            }),
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="gestion-form__fila">
        <label className="form-field">
          <span className="form-field__label">Costo por hectárea (USD/ha) *</span>
          <input
            type="text"
            inputMode="decimal"
            value={valores.costoPorHectarea}
            onChange={(e) => actualizar('costoPorHectarea', e.target.value)}
            disabled={guardando}
            placeholder="Por ejemplo, 925,50"
            aria-invalid={!!errores.costoPorHectarea}
          />
          {errores.costoPorHectarea && (
            <span className="form-field__error">{errores.costoPorHectarea}</span>
          )}
        </label>

        <label className="form-field">
          <span className="form-field__label">Vigente desde *</span>
          <CampoFecha
            value={valores.vigenciaDesde}
            onChange={(valor) => actualizar('vigenciaDesde', valor)}
            disabled={guardando}
            invalid={!!errores.vigenciaDesde}
            aria-describedby="costo-vigencia-ayuda"
          />
          {errores.vigenciaDesde && <span className="form-field__error">{errores.vigenciaDesde}</span>}
        </label>
      </div>

      <p id="costo-vigencia-ayuda" className="gestion-aviso">
        El costo rige desde esa fecha hasta que se registre otro más nuevo. Si la fecha es hoy o
        anterior y es la más reciente, el Dashboard pasa a usarlo de inmediato en todos los
        indicadores.
      </p>

      <label className="form-field">
        <span className="form-field__label">Fuente</span>
        <input
          type="text"
          value={valores.fuente}
          maxLength={MAX_FUENTE}
          onChange={(e) => actualizar('fuente', e.target.value)}
          disabled={guardando}
          placeholder="Opcional, por ejemplo el informe de costos utilizado"
          aria-invalid={!!errores.fuente}
        />
        {errores.fuente && <span className="form-field__error">{errores.fuente}</span>}
      </label>

      <label className="form-field">
        <span className="form-field__label">Detalle</span>
        <textarea
          rows={3}
          value={valores.detalle}
          maxLength={MAX_DETALLE}
          onChange={(e) => actualizar('detalle', e.target.value)}
          disabled={guardando}
          placeholder="Opcional"
          aria-invalid={!!errores.detalle}
        />
        <span className="form-field__hint">
          {valores.detalle.length}/{MAX_DETALLE}
        </span>
        {errores.detalle && <span className="form-field__error">{errores.detalle}</span>}
      </label>

      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={guardando} aria-busy={guardando}>
          {guardando && <span className="btn__spinner gestion-form__spinner" aria-hidden="true" />}
          {guardando ? 'Guardando...' : 'Registrar costo'}
        </button>
      </div>
    </form>
  )
}

export default CostoForm
