import { MAX_TEXTO, type DatosUsuario, type ErroresDatos } from './validacion'

interface CamposUsuarioProps {
  valores: DatosUsuario
  errores: ErroresDatos
  disabled: boolean
  onChange: (campo: keyof DatosUsuario, valor: string) => void
  /** No se permite cambiar el nombre de usuario (por ejemplo, el propio). */
  usuarioBloqueado?: string
}

/** Datos personales de un usuario, compartidos por el alta y la edición. */
function CamposUsuario({ valores, errores, disabled, onChange, usuarioBloqueado }: CamposUsuarioProps) {
  function campo(
    nombre: keyof DatosUsuario,
    etiqueta: string,
    opciones: { type?: string; autoComplete?: string; bloqueado?: boolean } = {},
  ) {
    return (
      <label className="form-field">
        <span className="form-field__label">{etiqueta} *</span>
        <input
          type={opciones.type ?? 'text'}
          value={valores[nombre]}
          maxLength={MAX_TEXTO}
          autoComplete={opciones.autoComplete ?? 'off'}
          onChange={(e) => onChange(nombre, e.target.value)}
          disabled={disabled || opciones.bloqueado}
          aria-invalid={!!errores[nombre]}
        />
        {errores[nombre] && <span className="form-field__error">{errores[nombre]}</span>}
      </label>
    )
  }

  return (
    <>
      <div className="gestion-form__fila">
        {campo('name', 'Nombre')}
        {campo('lastname', 'Apellido')}
      </div>
      <div className="gestion-form__fila">
        <div>
          {campo('username', 'Nombre de usuario', { bloqueado: !!usuarioBloqueado })}
          {usuarioBloqueado && <span className="form-field__hint">{usuarioBloqueado}</span>}
        </div>
        {campo('email', 'Correo electrónico', { type: 'email' })}
      </div>
    </>
  )
}

export default CamposUsuario
