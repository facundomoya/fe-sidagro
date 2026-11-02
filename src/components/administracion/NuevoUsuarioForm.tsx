import { useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import { useGuardado } from '../gestion/useGuardado'
import { crearUsuario } from '../../services/administracionService'
import type { RolApi, UsuarioApi } from '../../types/administracion'
import BotonesFormulario from './BotonesFormulario'
import { nombreRol } from './presentacion'
import CamposContrasenia from './CamposContrasenia'
import CamposUsuario from './CamposUsuario'
import { errorUsuario } from './errores'
import { validarContrasenia, validarDatos, type DatosUsuario } from './validacion'

interface NuevoUsuarioFormProps {
  roles: RolApi[]
  onCancel: () => void
  onSaved: (usuario: UsuarioApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

/** Alta de un usuario (POST /user/register). Queda activo y con el rol elegido. */
function NuevoUsuarioForm({ roles, onCancel, onSaved, onGuardandoChange }: NuevoUsuarioFormProps) {
  const [datos, setDatos] = useState<DatosUsuario>({ username: '', email: '', name: '', lastname: '' })
  const [password, setPassword] = useState('')
  const [repetir, setRepetir] = useState('')
  const [rolId, setRolId] = useState('')
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)

  const erroresDatos = intentoEnvio ? validarDatos(datos) : {}
  const erroresClave = intentoEnvio ? validarContrasenia(password, repetir) : {}
  const errorRol = intentoEnvio && !rolId ? 'Seleccioná el rol.' : undefined

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntentoEnvio(true)
    const invalido =
      Object.keys(validarDatos(datos)).length > 0 ||
      Object.keys(validarContrasenia(password, repetir)).length > 0 ||
      !rolId
    if (invalido) return

    const username = datos.username.trim()
    const email = datos.email.trim()
    guardar(
      () =>
        crearUsuario({
          username,
          email,
          name: datos.name.trim(),
          lastname: datos.lastname.trim(),
          password,
          roleId: Number(rolId),
        }),
      onSaved,
      (error) => errorUsuario(error, 'crear usuarios'),
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <CamposUsuario
        valores={datos}
        errores={erroresDatos}
        disabled={guardando}
        onChange={(campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))}
      />
      <CamposContrasenia
        password={password}
        repetir={repetir}
        errores={erroresClave}
        disabled={guardando}
        onPassword={setPassword}
        onRepetir={setRepetir}
      />
      <label className="form-field">
        <span className="form-field__label">Rol *</span>
        <select
          value={rolId}
          onChange={(e) => setRolId(e.target.value)}
          disabled={guardando}
          aria-invalid={!!errorRol}
        >
          <option value="">Seleccioná un rol</option>
          {roles.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {nombreRol(rol)}
            </option>
          ))}
        </select>
        {errorRol && <span className="form-field__error">{errorRol}</span>}
      </label>

      <p className="gestion-form__nota">
        El usuario queda activo y podrá ingresar con la contraseña indicada. Comunicásela por un
        medio seguro: no se vuelve a mostrar.
      </p>

      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}
      <BotonesFormulario guardando={guardando} texto="Crear usuario" onCancel={onCancel} />
    </form>
  )
}

export default NuevoUsuarioForm
