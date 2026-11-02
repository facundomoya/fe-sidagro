import { useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import { useGuardado } from '../gestion/useGuardado'
import { modificarUsuario } from '../../services/administracionService'
import type { CambiosUsuarioApi, UsuarioApi } from '../../types/administracion'
import BotonesFormulario from './BotonesFormulario'
import CamposUsuario from './CamposUsuario'
import { errorUsuario } from './errores'
import { validarDatos, type DatosUsuario } from './validacion'

interface DatosUsuarioFormProps {
  usuario: UsuarioApi
  /** Es el usuario con la sesión iniciada. */
  esPropio: boolean
  onCancel: () => void
  onSaved: (usuario: UsuarioApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

/** Edición de nombre, apellido, usuario y correo (PATCH /user/:id con los campos que cambian). */
function DatosUsuarioForm({ usuario, esPropio, onCancel, onSaved, onGuardandoChange }: DatosUsuarioFormProps) {
  const [datos, setDatos] = useState<DatosUsuario>({
    username: usuario.username,
    email: usuario.email,
    name: usuario.name,
    lastname: usuario.lastname,
  })
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)

  const errores = intentoEnvio ? validarDatos(datos) : {}

  // Solo los campos modificados: sin cambios, el backend respondería 404.
  const cambios: CambiosUsuarioApi = {}
  for (const campo of ['username', 'email', 'name', 'lastname'] as const) {
    const valor = datos[campo].trim()
    if (valor !== usuario[campo]) cambios[campo] = valor
  }
  const sinCambios = Object.keys(cambios).length === 0

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntentoEnvio(true)
    if (sinCambios || Object.keys(validarDatos(datos)).length > 0) return
    guardar(
      () => modificarUsuario(usuario.id, cambios),
      onSaved,
      (error) => errorUsuario(error, 'modificar usuarios'),
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <CamposUsuario
        valores={datos}
        errores={errores}
        disabled={guardando}
        onChange={(campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))}
        // El backend identifica la sesión por el nombre de usuario: cambiar el propio la invalidaría.
        usuarioBloqueado={
          esPropio ? 'No podés cambiar tu propio nombre de usuario: se cerraría tu sesión.' : undefined
        }
      />
      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}
      <BotonesFormulario
        guardando={guardando}
        texto="Guardar cambios"
        onCancel={onCancel}
        sinCambios={sinCambios}
      />
    </form>
  )
}

export default DatosUsuarioForm
