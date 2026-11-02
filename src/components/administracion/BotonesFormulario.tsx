interface BotonesFormularioProps {
  guardando: boolean
  texto: string
  onCancel: () => void
  /** Deshabilita el envío, por ejemplo si no hay cambios. */
  sinCambios?: boolean
  peligro?: boolean
}

/** Botones Cancelar y Guardar de los formularios de administración. */
function BotonesFormulario({ guardando, texto, onCancel, sinCambios, peligro }: BotonesFormularioProps) {
  return (
    <div className="form__actions">
      <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={guardando}>
        Cancelar
      </button>
      <button
        type="submit"
        className={`btn ${peligro ? 'btn--danger' : 'btn--primary'}`}
        disabled={guardando || sinCambios}
        aria-busy={guardando}
      >
        {guardando && <span className="btn__spinner gestion-form__spinner" aria-hidden="true" />}
        {guardando ? 'Guardando...' : texto}
      </button>
    </div>
  )
}

export default BotonesFormulario
