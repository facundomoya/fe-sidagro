import { useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import { useGuardado } from '../gestion/useGuardado'
import { asignarRol } from '../../services/administracionService'
import type { RolApi, UsuarioApi } from '../../types/administracion'
import BotonesFormulario from './BotonesFormulario'
import { errorUsuario } from './errores'
import { nombreRol } from './presentacion'

interface RolUsuarioFormProps {
  usuario: UsuarioApi
  roles: RolApi[]
  onCancel: () => void
  onSaved: (usuario: UsuarioApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

/** Cambia el único rol del usuario (POST /user/:id/add/role/:rolId). */
function RolUsuarioForm({ usuario, roles, onCancel, onSaved, onGuardandoChange }: RolUsuarioFormProps) {
  const [rolId, setRolId] = useState(usuario.role ? String(usuario.role.id) : '')
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)
  // Asignar el mismo rol no cambia nada y el backend respondería 404.
  const sinCambios = !rolId || Number(rolId) === usuario.role?.id

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sinCambios) return
    guardar(
      () => asignarRol(usuario.id, Number(rolId)),
      onSaved,
      (error) => errorUsuario(error, 'asignar roles'),
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <span className="form-field__label">Usuario</span>
        <div className="form-field__readonly">
          {usuario.username} <small>· rol actual: {nombreRol(usuario.role)}</small>
        </div>
      </div>
      <label className="form-field">
        <span className="form-field__label">Nuevo rol *</span>
        <select value={rolId} onChange={(e) => setRolId(e.target.value)} disabled={guardando}>
          <option value="">Seleccioná un rol</option>
          {roles.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {nombreRol(rol)}
            </option>
          ))}
        </select>
      </label>
      <p className="gestion-aviso">
        Cada usuario tiene un solo rol: el nuevo reemplaza al actual. El sistema aplica los accesos del
        nuevo rol desde la próxima operación; el menú del usuario se actualiza cuando vuelve a ingresar.
      </p>
      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}
      <BotonesFormulario
        guardando={guardando}
        texto="Asignar rol"
        onCancel={onCancel}
        sinCambios={sinCambios}
      />
    </form>
  )
}

export default RolUsuarioForm
