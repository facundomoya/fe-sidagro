import { useRef, useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import CampoFecha from '../CampoFecha'
import { ApiError } from '../../services/apiClient'
import { crearObservacion } from '../../services/monitoreoService'
import type { LoteApi } from '../../types/catalogo'
import type { NuevaObservacionApi, ObservacionApi } from '../../types/monitoreoApi'
import { fechaHoyIso, formatearFecha } from '../../utils/format'
import { esFechaIsoValida } from '../../utils/fechas'

// Límites de CreateObservacionDto en el backend.
const DENSIDAD_MIN = 1
const DENSIDAD_MAX = 1000
const MAX_OBSERVACIONES = 2000

interface ObservacionFormProps {
  lote: LoteApi
  onCancel: () => void
  /** Se informa el lote para que la página ignore respuestas de un lote que ya no está seleccionado. */
  onSaved: (observacion: ObservacionApi, loteId: number) => void
  /** Informa cuándo empieza y termina el guardado, para bloquear el modal. */
  onGuardandoChange?: (guardando: boolean) => void
}

interface Valores {
  fecha: string
  presencia: '' | 'presente' | 'ausente'
  densidad: string
  observaciones: string
}

type Errores = Partial<Record<'fecha' | 'presencia' | 'densidad' | 'observaciones', string>>

function validar(valores: Valores, fechaSiembra: string | null, hoy: string): Errores {
  const errores: Errores = {}

  if (!valores.fecha) errores.fecha = 'Ingresá la fecha de observación.'
  else if (!esFechaIsoValida(valores.fecha)) errores.fecha = 'Ingresá una fecha válida (dd/mm/aaaa).'
  else if (valores.fecha > hoy) errores.fecha = 'La fecha no puede ser posterior a hoy.'
  else if (fechaSiembra && valores.fecha < fechaSiembra) {
    errores.fecha = `La fecha no puede ser anterior a la siembra (${formatearFecha(fechaSiembra)}).`
  }

  if (!valores.presencia) errores.presencia = 'Indicá si se observó chinche verde.'

  if (valores.presencia === 'presente') {
    const texto = valores.densidad.trim()
    const densidad = Number(texto)
    if (texto === '') errores.densidad = 'Ingresá la densidad observada.'
    else if (!Number.isInteger(densidad)) errores.densidad = 'La densidad debe ser un número entero.'
    else if (densidad < DENSIDAD_MIN || densidad > DENSIDAD_MAX) {
      errores.densidad = `La densidad debe estar entre ${DENSIDAD_MIN} y ${DENSIDAD_MAX}.`
    }
  }

  if (valores.observaciones.length > MAX_OBSERVACIONES) {
    errores.observaciones = `Las observaciones no pueden superar los ${MAX_OBSERVACIONES} caracteres.`
  }

  return errores
}

function mensajeDeError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'No se pudo registrar la observación. Intentá nuevamente.'
  switch (error.status) {
    case 403:
      return 'Tu usuario no tiene permiso para registrar observaciones.'
    case 404:
      return 'El lote seleccionado ya no existe. Recargá la página para actualizar la lista.'
    default:
      return error.mensajes.join(' ')
  }
}

function ObservacionForm({ lote, onCancel, onSaved, onGuardandoChange }: ObservacionFormProps) {
  const hoy = fechaHoyIso()
  const siembraFutura = !!lote.fechaSiembra && lote.fechaSiembra > hoy

  const [valores, setValores] = useState<Valores>({
    fecha: hoy,
    presencia: '',
    densidad: '',
    observaciones: '',
  })
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  // Evita envíos duplicados aunque se presione varias veces antes de volver a renderizar.
  const guardandoRef = useRef(false)

  // Los errores se muestran recién después del primer intento de guardar.
  const errores = intentoEnvio ? validar(valores, lote.fechaSiembra, hoy) : {}

  function actualizar<K extends keyof Valores>(campo: K, valor: Valores[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (guardandoRef.current || siembraFutura) return
    setIntentoEnvio(true)
    if (Object.keys(validar(valores, lote.fechaSiembra, hoy)).length > 0) return

    const presencia = valores.presencia === 'presente'
    const observaciones = valores.observaciones.trim()
    const observacion: NuevaObservacionApi = {
      fecha: valores.fecha,
      presencia,
      // Sin presencia, la densidad no se envía (el backend la ignoraría).
      ...(presencia && { densidad: Number(valores.densidad) }),
      ...(observaciones && { observaciones }),
    }

    guardandoRef.current = true
    setGuardando(true)
    setErrorGuardado(null)
    onGuardandoChange?.(true)
    let guardada: ObservacionApi
    try {
      guardada = await crearObservacion(lote.id, observacion)
    } catch (error) {
      // El formulario conserva los datos para que se pueda corregir y reintentar.
      setErrorGuardado(mensajeDeError(error))
      setGuardando(false)
      guardandoRef.current = false
      onGuardandoChange?.(false)
      return
    }
    // Se desbloquea el modal antes de avisar el éxito, para que la página pueda cerrarlo.
    onGuardandoChange?.(false)
    onSaved(guardada, lote.id)
  }

  if (siembraFutura && lote.fechaSiembra) {
    return (
      <div className="form">
        <StatusMessage
          type="empty"
          message={`La siembra de ${lote.nombre} está prevista para el ${formatearFecha(lote.fechaSiembra)}. Las observaciones se podrán registrar a partir de esa fecha.`}
        />
        <div className="form__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="form observacion-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <span className="form-field__label">Lote</span>
        <div className="form-field__readonly">
          {lote.nombre} <small>· {lote.provincia.nombre}</small>
        </div>
      </div>

      {!lote.fechaSiembra && (
        <p className="observacion-form__aviso">
          Este lote no tiene fecha de siembra cargada. La observación se guardará, pero la etapa
          fenológica estimada y el GDDA podrían quedar sin calcular.
        </p>
      )}

      <label className="form-field">
        <span className="form-field__label">Fecha de observación *</span>
        <CampoFecha
          value={valores.fecha}
          min={lote.fechaSiembra ?? undefined}
          max={hoy}
          onChange={(valor) => actualizar('fecha', valor)}
          disabled={guardando}
          invalid={!!errores.fecha}
        />
        {errores.fecha && <span className="form-field__error">{errores.fecha}</span>}
      </label>

      <fieldset className="form-field" disabled={guardando}>
        <legend className="form-field__label">Presencia de chinche verde *</legend>
        <div className="toggle-group">
          {(['presente', 'ausente'] as const).map((opcion) => (
            <label
              key={opcion}
              className={`toggle-group__option${valores.presencia === opcion ? ' toggle-group__option--active' : ''}`}
            >
              <input
                type="radio"
                name="presencia"
                value={opcion}
                checked={valores.presencia === opcion}
                onChange={() => {
                  actualizar('presencia', opcion)
                  if (opcion === 'ausente') actualizar('densidad', '')
                }}
              />
              {opcion === 'presente' ? 'Presente' : 'Ausente'}
            </label>
          ))}
        </div>
        {errores.presencia && <span className="form-field__error">{errores.presencia}</span>}
      </fieldset>

      {valores.presencia === 'presente' && (
        <label className="form-field">
          <span className="form-field__label">Densidad observada *</span>
          <input
            type="number"
            min={DENSIDAD_MIN}
            max={DENSIDAD_MAX}
            step={1}
            inputMode="numeric"
            value={valores.densidad}
            onChange={(e) => actualizar('densidad', e.target.value)}
            disabled={guardando}
            aria-invalid={!!errores.densidad}
            aria-describedby="densidad-ayuda"
          />
          <span id="densidad-ayuda" className="observacion-form__ayuda">
            Cantidad de chinches cada 20 golpes de paño (entero de {DENSIDAD_MIN} a {DENSIDAD_MAX}).
          </span>
          {errores.densidad && <span className="form-field__error">{errores.densidad}</span>}
        </label>
      )}

      <label className="form-field">
        <span className="form-field__label">Observaciones adicionales</span>
        <textarea
          rows={3}
          maxLength={MAX_OBSERVACIONES}
          value={valores.observaciones}
          onChange={(e) => actualizar('observaciones', e.target.value)}
          disabled={guardando}
          placeholder="Escribí observaciones de campo (opcional)"
          aria-invalid={!!errores.observaciones}
        />
        <span className="form-field__hint">
          {valores.observaciones.length}/{MAX_OBSERVACIONES}
        </span>
        {errores.observaciones && (
          <span className="form-field__error">{errores.observaciones}</span>
        )}
      </label>

      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={guardando} aria-busy={guardando}>
          {guardando && <span className="btn__spinner observacion-form__spinner" aria-hidden="true" />}
          {guardando ? 'Cargando...' : 'Guardar observación'}
        </button>
      </div>
    </form>
  )
}

export default ObservacionForm
