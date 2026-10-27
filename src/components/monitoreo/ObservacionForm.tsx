import { useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import { registrarObservacion } from '../../services/monitoreoService'
import {
  ETAPAS_FENOLOGICAS_SOJA,
  type EtapaFenologicaSoja,
  type Lote,
  type NuevaObservacion,
  type ObservacionCampo,
} from '../../types/monitoreo'
import { fechaHoyIso } from '../../utils/format'

const MAX_COMENTARIOS = 250

interface ObservacionFormProps {
  lote: Lote
  onCancel: () => void
  onSaved: (observacion: ObservacionCampo) => void
}

interface Valores {
  fecha: string
  presencia: '' | 'si' | 'no'
  cantidad: string
  etapa: '' | EtapaFenologicaSoja
  comentarios: string
}

type Errores = Partial<Record<'fecha' | 'presencia' | 'cantidad', string>>

function validar(valores: Valores): Errores {
  const errores: Errores = {}

  if (!valores.fecha) errores.fecha = 'Ingresá la fecha de observación.'
  else if (valores.fecha > fechaHoyIso()) errores.fecha = 'La fecha no puede ser posterior a hoy.'

  if (!valores.presencia) errores.presencia = 'Indicá si se observó chinche verde.'

  if (valores.presencia === 'si') {
    const cantidad = Number(valores.cantidad)
    if (valores.cantidad.trim() === '') errores.cantidad = 'Ingresá la cantidad observada.'
    else if (Number.isNaN(cantidad)) errores.cantidad = 'Ingresá un número válido.'
    else if (cantidad < 0) errores.cantidad = 'La cantidad no puede ser negativa.'
  }

  return errores
}

function ObservacionForm({ lote, onCancel, onSaved }: ObservacionFormProps) {
  const [valores, setValores] = useState<Valores>({
    fecha: fechaHoyIso(),
    presencia: '',
    cantidad: '',
    etapa: '',
    comentarios: '',
  })
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState(false)

  // Los errores se muestran recién después del primer intento de guardar.
  const errores = intentoEnvio ? validar(valores) : {}

  function actualizar<K extends keyof Valores>(campo: K, valor: Valores[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntentoEnvio(true)
    if (Object.keys(validar(valores)).length > 0) return

    const observacion: NuevaObservacion = {
      loteId: lote.id,
      fecha: valores.fecha,
      presenciaChinche: valores.presencia === 'si',
      cantidadObservada: valores.presencia === 'si' ? Number(valores.cantidad) : null,
      etapaFenologica: valores.etapa || null,
      comentarios: valores.comentarios.trim(),
    }

    setGuardando(true)
    setErrorGuardado(false)
    try {
      onSaved(await registrarObservacion(observacion))
    } catch {
      setErrorGuardado(true)
      setGuardando(false)
    }
  }

  return (
    <form className="form observacion-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <span className="form-field__label">Lote</span>
        <div className="form-field__readonly">
          {lote.nombre} <small>· {lote.provincia}</small>
        </div>
      </div>

      <label className="form-field">
        <span className="form-field__label">Fecha de observación *</span>
        <input
          type="date"
          value={valores.fecha}
          max={fechaHoyIso()}
          onChange={(e) => actualizar('fecha', e.target.value)}
          aria-invalid={!!errores.fecha}
        />
        {errores.fecha && <span className="form-field__error">{errores.fecha}</span>}
      </label>

      <fieldset className="form-field">
        <legend className="form-field__label">Presencia de chinche verde *</legend>
        <div className="toggle-group">
          {(['si', 'no'] as const).map((opcion) => (
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
                  if (opcion === 'no') actualizar('cantidad', '')
                }}
              />
              {opcion === 'si' ? 'Sí' : 'No'}
            </label>
          ))}
        </div>
        {errores.presencia && <span className="form-field__error">{errores.presencia}</span>}
      </fieldset>

      {valores.presencia === 'si' && (
        <label className="form-field">
          <span className="form-field__label">Cantidad observada *</span>
          <input
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={valores.cantidad}
            onChange={(e) => actualizar('cantidad', e.target.value)}
            aria-invalid={!!errores.cantidad}
          />
          {errores.cantidad && <span className="form-field__error">{errores.cantidad}</span>}
        </label>
      )}

      <label className="form-field">
        <span className="form-field__label">Etapa fenológica observada</span>
        <select
          value={valores.etapa}
          onChange={(e) => actualizar('etapa', e.target.value as Valores['etapa'])}
        >
          <option value="">Sin especificar</option>
          {ETAPAS_FENOLOGICAS_SOJA.map((etapa) => (
            <option key={etapa} value={etapa}>
              {etapa}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span className="form-field__label">Observaciones adicionales</span>
        <textarea
          rows={3}
          maxLength={MAX_COMENTARIOS}
          value={valores.comentarios}
          onChange={(e) => actualizar('comentarios', e.target.value)}
          placeholder="Escribí observaciones de campo (opcional)"
        />
        <span className="form-field__hint">
          {valores.comentarios.length}/{MAX_COMENTARIOS}
        </span>
      </label>

      {errorGuardado && (
        <StatusMessage type="error" message="No se pudo registrar la observación. Intentá nuevamente." />
      )}

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar observación'}
        </button>
      </div>
    </form>
  )
}

export default ObservacionForm
