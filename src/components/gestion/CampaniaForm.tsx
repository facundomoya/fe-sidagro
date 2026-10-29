import { useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import CampoFecha from '../CampoFecha'
import { crearCampania } from '../../services/catalogoService'
import type { CampaniaApi, NuevaCampaniaApi } from '../../types/catalogo'
import { mensajeErrorGuardado } from './errores'
import { MAX_NOMBRE, errorFechaObligatoria, esFechaIsoValida } from './validacion'
import { useGuardado } from './useGuardado'

interface CampaniaFormProps {
  onCancel: () => void
  onSaved: (campania: CampaniaApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

interface Valores {
  nombre: string
  fechaInicio: string
  fechaFin: string
}

type Errores = Partial<Record<keyof Valores, string>>

function validar(valores: Valores): Errores {
  const errores: Errores = {}
  const nombre = valores.nombre.trim()
  if (!nombre) errores.nombre = 'Ingresá el nombre de la campaña.'
  else if (nombre.length > MAX_NOMBRE) errores.nombre = `El nombre admite hasta ${MAX_NOMBRE} caracteres.`

  errores.fechaInicio = errorFechaObligatoria(valores.fechaInicio, 'fecha de inicio')

  if (valores.fechaFin) {
    if (!esFechaIsoValida(valores.fechaFin)) errores.fechaFin = 'La fecha de finalización no es válida (dd/mm/aaaa).'
    else if (!errores.fechaInicio && valores.fechaFin < valores.fechaInicio) {
      errores.fechaFin = 'La fecha de finalización no puede ser anterior a la de inicio.'
    }
  }

  if (!errores.fechaInicio) delete errores.fechaInicio
  return errores
}

function CampaniaForm({ onCancel, onSaved, onGuardandoChange }: CampaniaFormProps) {
  const [valores, setValores] = useState<Valores>({ nombre: '', fechaInicio: '', fechaFin: '' })
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

    const nombre = valores.nombre.trim()
    const campania: NuevaCampaniaApi = {
      nombre,
      fechaInicio: valores.fechaInicio,
      ...(valores.fechaFin && { fechaFin: valores.fechaFin }),
    }
    guardar(
      () => crearCampania(campania),
      onSaved,
      (error) =>
        mensajeErrorGuardado(error, {
          accion: 'crear campañas',
          noEncontrado: 'No se encontró el recurso para crear la campaña.',
          conflicto: `Ya existe una campaña llamada «${nombre}». Elija otro nombre.`,
        }),
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="form-field">
        <span className="form-field__label">Nombre *</span>
        <input
          type="text"
          value={valores.nombre}
          maxLength={MAX_NOMBRE}
          onChange={(e) => actualizar('nombre', e.target.value)}
          disabled={guardando}
          placeholder="Por ejemplo, 2026/2027"
          aria-invalid={!!errores.nombre}
        />
        {errores.nombre && <span className="form-field__error">{errores.nombre}</span>}
      </label>

      <div className="gestion-form__fila">
        <label className="form-field">
          <span className="form-field__label">Fecha de inicio *</span>
          <CampoFecha
            value={valores.fechaInicio}
            onChange={(valor) => actualizar('fechaInicio', valor)}
            disabled={guardando}
            invalid={!!errores.fechaInicio}
          />
          {errores.fechaInicio && <span className="form-field__error">{errores.fechaInicio}</span>}
        </label>

        <label className="form-field">
          <span className="form-field__label">Fecha de finalización</span>
          <CampoFecha
            value={valores.fechaFin}
            min={valores.fechaInicio || undefined}
            onChange={(valor) => actualizar('fechaFin', valor)}
            disabled={guardando}
            invalid={!!errores.fechaFin}
          />
          {errores.fechaFin && <span className="form-field__error">{errores.fechaFin}</span>}
        </label>
      </div>

      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={guardando} aria-busy={guardando}>
          {guardando && <span className="btn__spinner gestion-form__spinner" aria-hidden="true" />}
          {guardando ? 'Guardando...' : 'Crear campaña'}
        </button>
      </div>
    </form>
  )
}

export default CampaniaForm
