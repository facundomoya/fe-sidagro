import { useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import { completarDepartamento, obtenerLote } from '../../services/catalogoService'
import type { LoteApi } from '../../types/catalogo'
import { mensajeErrorGuardado } from './errores'
import SelectorDepartamento from './SelectorDepartamento'
import { departamentoElegido, errorDepartamento, useDepartamentos } from './useDepartamentos'
import { useGuardado } from './useGuardado'

interface DepartamentoFormProps {
  lote: LoteApi
  onCancel: () => void
  onSaved: (lote: LoteApi) => void
  /** El backend informó datos más recientes del lote (otro usuario le asignó un departamento). */
  onLoteActualizado: (lote: LoteApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

/** Los datos del lote cambiaron desde que se abrió el formulario: no se envía nada. */
class LoteModificado extends Error {
  readonly lote: LoteApi

  constructor(lote: LoteApi, mensaje: string) {
    super(mensaje)
    this.lote = lote
  }
}

/**
 * Asigna el departamento a un lote que no tiene. Solo completa: no permite cambiar ni quitar un
 * departamento ya asignado, aunque el backend lo admita.
 */
function DepartamentoForm({
  lote,
  onCancel,
  onSaved,
  onLoteActualizado,
  onGuardandoChange,
}: DepartamentoFormProps) {
  const [departamentoId, setDepartamentoId] = useState('')
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)
  const departamentos = useDepartamentos(lote.provincia.id)

  const encabezado = (
    <div className="form-field">
      <span className="form-field__label">Lote</span>
      <div className="form-field__readonly">
        {lote.nombre}{' '}
        <small>
          · {lote.provincia.nombre} · {lote.campania.nombre}
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

  // Ya tiene departamento (por ejemplo, lo asignó otro usuario): solo se muestra.
  if (lote.departamento) {
    return (
      <div className="form">
        {encabezado}
        {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}
        <StatusMessage
          type="empty"
          message={`Este lote ya tiene asignado el departamento ${lote.departamento.nombre}. No se puede cambiar desde SID-Agro.${errorGuardado ? '' : ' No se guardó ningún cambio.'}`}
        />
        {botonCerrar}
      </div>
    )
  }

  if (departamentos.estado === 'listo' && departamentos.departamentos.length === 0) {
    return (
      <div className="form">
        {encabezado}
        <StatusMessage
          type="empty"
          message={`La provincia ${lote.provincia.nombre} no tiene departamentos cargados, por lo que no es posible completar este dato. El Monitoreo seguirá usando el clima de la capital provincial.`}
        />
        {botonCerrar}
      </div>
    )
  }

  const errorSeleccion = intentoEnvio ? errorDepartamento(departamentos, departamentoId) : undefined

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntentoEnvio(true)
    if (errorDepartamento(departamentos, departamentoId)) return
    const departamento = departamentoElegido(departamentos, departamentoId)
    if (!departamento) return

    guardar(
      async () => {
        // Se vuelve a consultar justo antes de guardar. Es una protección de la interfaz: si otro
        // usuario guarda entre esta consulta y el PATCH, el backend no lo impide.
        const actual = await obtenerLote(lote.id)
        if (actual.departamento) {
          throw new LoteModificado(
            actual,
            'Otro usuario le asignó un departamento a este lote mientras el formulario estaba abierto.',
          )
        }
        if (actual.provincia.id !== lote.provincia.id) {
          throw new LoteModificado(
            actual,
            'Los datos del lote cambiaron. Cerrá el formulario y recargá la página.',
          )
        }
        return completarDepartamento(lote.id, { departamentoId: departamento.id })
      },
      onSaved,
      (error) => {
        if (error instanceof LoteModificado) {
          onLoteActualizado(error.lote)
          return `${error.message} No se guardó ningún cambio.`
        }
        return mensajeErrorGuardado(error, {
          accion: 'modificar lotes',
          noEncontrado: 'El lote o el departamento ya no existe. Cerrá el formulario y recargá la página.',
        })
      },
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {encabezado}

      <SelectorDepartamento
        departamentos={departamentos}
        value={departamentoId}
        onChange={setDepartamentoId}
        disabled={guardando}
        error={errorSeleccion}
        mensajeSinDepartamentos=""
      />

      <p className="gestion-aviso">
        Desde que se asigne, el Monitoreo pedirá el clima en las coordenadas de ese departamento en
        lugar de las de la capital provincial, y recalculará con él los grados día desde la siembra.
        Una vez asignado no se puede cambiar desde SID-Agro.
      </p>

      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={guardando}>
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={guardando || departamentos.estado !== 'listo'}
          aria-busy={guardando}
        >
          {guardando && <span className="btn__spinner gestion-form__spinner" aria-hidden="true" />}
          {guardando ? 'Guardando...' : 'Asignar departamento'}
        </button>
      </div>
    </form>
  )
}

export default DepartamentoForm
