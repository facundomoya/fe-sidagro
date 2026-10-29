import { useId } from 'react'
import type { DepartamentosConReintento } from './useDepartamentos'

interface SelectorDepartamentoProps {
  departamentos: DepartamentosConReintento
  value: string
  onChange: (departamentoId: string) => void
  disabled?: boolean
  /** Error de validación del formulario. */
  error?: string
  /** Qué pasa si la provincia no tiene departamentos cargados. */
  mensajeSinDepartamentos: string
}

/** Selector de departamento que depende de la provincia elegida en el formulario. */
function SelectorDepartamento({
  departamentos,
  value,
  onChange,
  disabled,
  error,
  mensajeSinDepartamentos,
}: SelectorDepartamentoProps) {
  const id = useId()
  const ayudaId = `${id}-ayuda`
  const lista = departamentos.estado === 'listo' ? departamentos.departamentos : []
  const requerido = lista.length > 0

  let placeholder = 'Seleccioná un departamento'
  if (departamentos.estado === 'sinProvincia') placeholder = 'Primero seleccioná la provincia'
  else if (departamentos.estado === 'cargando') placeholder = 'Cargando departamentos...'
  else if (departamentos.estado === 'error') placeholder = 'No se pudieron cargar'
  else if (lista.length === 0) placeholder = 'Sin departamentos cargados'

  let ayuda = null
  if (departamentos.estado === 'cargando') {
    ayuda = (
      <span id={ayudaId} className="form-field__hint selector-departamento__ayuda" role="status">
        Cargando los departamentos de la provincia...
      </span>
    )
  } else if (departamentos.estado === 'error') {
    ayuda = (
      <span id={ayudaId} className="form-field__error selector-departamento__error" role="alert">
        {departamentos.error.mensaje}{' '}
        {departamentos.error.reintentable && (
          <button type="button" className="selector-departamento__reintentar" onClick={departamentos.reintentar}>
            Reintentar
          </button>
        )}
      </span>
    )
  } else if (departamentos.estado === 'listo' && lista.length === 0) {
    ayuda = (
      <span id={ayudaId} className="form-field__hint selector-departamento__ayuda">
        {mensajeSinDepartamentos}
      </span>
    )
  }

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        Departamento{requerido ? ' *' : ''}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || lista.length === 0}
        aria-invalid={!!error}
        aria-describedby={ayuda ? ayudaId : undefined}
      >
        <option value="">{placeholder}</option>
        {lista.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nombre}
          </option>
        ))}
      </select>
      {ayuda}
      {/* Mientras se cargan o si la consulta falló, el estado ya se informa arriba. */}
      {error && departamentos.estado === 'listo' && <span className="form-field__error">{error}</span>}
    </div>
  )
}

export default SelectorDepartamento
