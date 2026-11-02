import { MAX_TEXTO, MIN_CONTRASENIA, type ErroresContrasenia } from './validacion'

interface CamposContraseniaProps {
  password: string
  repetir: string
  errores: ErroresContrasenia
  disabled: boolean
  onPassword: (valor: string) => void
  onRepetir: (valor: string) => void
  etiqueta?: string
}

/** Contraseña nueva y su confirmación. Solo vive en el estado del formulario: no se guarda. */
function CamposContrasenia({
  password,
  repetir,
  errores,
  disabled,
  onPassword,
  onRepetir,
  etiqueta = 'Contraseña',
}: CamposContraseniaProps) {
  return (
    <div className="gestion-form__fila">
      <label className="form-field">
        <span className="form-field__label">{etiqueta} *</span>
        <input
          type="password"
          value={password}
          maxLength={MAX_TEXTO}
          autoComplete="new-password"
          onChange={(e) => onPassword(e.target.value)}
          disabled={disabled}
          aria-invalid={!!errores.password}
        />
        {errores.password ? (
          <span className="form-field__error">{errores.password}</span>
        ) : (
          <span className="form-field__hint">Al menos {MIN_CONTRASENIA} caracteres.</span>
        )}
      </label>
      <label className="form-field">
        <span className="form-field__label">Repetir contraseña *</span>
        <input
          type="password"
          value={repetir}
          maxLength={MAX_TEXTO}
          autoComplete="new-password"
          onChange={(e) => onRepetir(e.target.value)}
          disabled={disabled}
          aria-invalid={!!errores.repetir}
        />
        {errores.repetir && <span className="form-field__error">{errores.repetir}</span>}
      </label>
    </div>
  )
}

export default CamposContrasenia
