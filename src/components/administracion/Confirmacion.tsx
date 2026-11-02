import type { FormEvent, ReactNode } from 'react'
import StatusMessage from '../StatusMessage'
import { useGuardado } from '../gestion/useGuardado'
import BotonesFormulario from './BotonesFormulario'

interface ConfirmacionProps<T> {
  /** Qué se va a hacer y a quién afecta. */
  children: ReactNode
  textoConfirmar: string
  /** Acción que puede impedir el acceso o borrar datos. */
  peligro?: boolean
  ejecutar: () => Promise<T>
  describirError: (error: unknown) => string
  onCancel: () => void
  onHecho: (resultado: T) => void
  onGuardandoChange: (guardando: boolean) => void
}

/** Pide confirmación antes de una operación y la ejecuta solo al confirmar. */
function Confirmacion<T>({
  children,
  textoConfirmar,
  peligro,
  ejecutar,
  describirError,
  onCancel,
  onHecho,
  onGuardandoChange,
}: ConfirmacionProps<T>) {
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    guardar(ejecutar, onHecho, describirError)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="gestion-confirmar">{children}</div>
      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}
      <BotonesFormulario guardando={guardando} texto={textoConfirmar} onCancel={onCancel} peligro={peligro} />
    </form>
  )
}

export default Confirmacion
