import { useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import { useGuardado } from '../gestion/useGuardado'
import { modificarUsuario } from '../../services/administracionService'
import type { UsuarioApi } from '../../types/administracion'
import BotonesFormulario from './BotonesFormulario'
import CamposContrasenia from './CamposContrasenia'
import { errorUsuario } from './errores'
import { validarContrasenia } from './validacion'

interface ContraseniaFormProps {
  usuario: UsuarioApi
  esPropio: boolean
  onCancel: () => void
  onSaved: (usuario: UsuarioApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

/**
 * Asigna una contraseña nueva (PATCH /user/:id con password). El backend no pide la actual.
 * La contraseña solo vive en el estado del formulario, que se descarta al cerrarlo.
 */
function ContraseniaForm({ usuario, esPropio, onCancel, onSaved, onGuardandoChange }: ContraseniaFormProps) {
  const [password, setPassword] = useState('')
  const [repetir, setRepetir] = useState('')
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)

  const errores = intentoEnvio ? validarContrasenia(password, repetir) : {}

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntentoEnvio(true)
    if (Object.keys(validarContrasenia(password, repetir)).length > 0) return
    guardar(
      () => modificarUsuario(usuario.id, { password }),
      onSaved,
      (error) => errorUsuario(error, 'modificar usuarios'),
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <p className="gestion-form__nota">
        {esPropio
          ? 'Vas a cambiar tu propia contraseña. Tu sesión actual sigue abierta; usala en el próximo ingreso.'
          : `La nueva contraseña reemplaza a la actual de ${usuario.username} desde su próximo ingreso.`}
      </p>
      <CamposContrasenia
        password={password}
        repetir={repetir}
        errores={errores}
        disabled={guardando}
        onPassword={setPassword}
        onRepetir={setRepetir}
        etiqueta="Nueva contraseña"
      />
      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}
      <BotonesFormulario guardando={guardando} texto="Cambiar contraseña" onCancel={onCancel} />
    </form>
  )
}

export default ContraseniaForm
