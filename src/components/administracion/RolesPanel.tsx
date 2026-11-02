import { useCallback, useState } from 'react'
import EmptyState from '../EmptyState'
import Modal from '../Modal'
import StatusMessage from '../StatusMessage'
import ErrorConReintento from '../monitoreo/ErrorConReintento'
import { mensajeErrorGuardado } from '../gestion/errores'
import { IconRefresh, IconShield } from '../icons/Icons'
import { eliminarRol, obtenerTodosLosUsuarios } from '../../services/administracionService'
import type { RolApi, RolConPermisosApi } from '../../types/administracion'
import type { EstadoConsulta } from './useConsulta'
import { useConsulta } from './useConsulta'
import type { Paginado } from '../../types/api'
import Confirmacion from './Confirmacion'
import { descripcionRol, nombreRol } from './presentacion'
import PermisosRol from './PermisosRol'

interface RolesPanelProps {
  roles: EstadoConsulta<Paginado<RolApi>>
  /** Rol del usuario con la sesión iniciada. */
  rolActualId: number | null
  puedeVerPermisos: boolean
  puedeEditarPermisos: boolean
  puedeEliminar: boolean
  /** USER_GET_ALL: necesario para comprobar que un rol no tenga usuarios antes de eliminarlo. */
  puedeContarUsuarios: boolean
  onAviso: (texto: string) => void
}

type ModalRol = { tipo: 'permisos' | 'eliminar'; rol: RolApi } | null

/**
 * Roles del sistema con nombres y descripciones para la Gerencia. Internamente se siguen usando
 * los nombres del backend (GERENTE e INGENIERO).
 */
function RolesPanel({
  roles,
  rolActualId,
  puedeVerPermisos,
  puedeEditarPermisos,
  puedeEliminar,
  puedeContarUsuarios,
  onAviso,
}: RolesPanelProps) {
  const [modal, setModal] = useState<ModalRol>(null)
  const [guardando, setGuardando] = useState(false)

  // Para eliminar un rol hay que saber si tiene usuarios: perderían todos sus permisos.
  const consultarUsuarios = useCallback((signal: AbortSignal) => obtenerTodosLosUsuarios(signal), [])
  const usuarios = useConsulta(puedeEliminar && puedeContarUsuarios ? consultarUsuarios : null, 'los usuarios')

  function cerrar() {
    if (!guardando) setModal(null)
  }

  function usuariosDe(rol: RolApi): number | null {
    if (!usuarios.datos) return null
    return usuarios.datos.filter((u) => u.role?.id === rol.id).length
  }

  /** Por qué no se ofrece eliminar el rol; null si se puede. */
  function motivoSinEliminar(rol: RolApi): string | null {
    if (rol.id === rolActualId) return 'Es tu propio rol: no se puede eliminar.'
    if (!puedeContarUsuarios) return 'Para eliminarlo hace falta poder consultar los usuarios.'
    const cantidad = usuariosDe(rol)
    if (cantidad === null) return usuarios.error ? 'No se pudo comprobar si tiene usuarios.' : 'Comprobando si tiene usuarios...'
    if (cantidad > 0) return `Tiene ${cantidad} ${cantidad === 1 ? 'usuario asignado' : 'usuarios asignados'}: no se puede eliminar.`
    return null
  }

  function permisosGuardados(rol: RolConPermisosApi) {
    setModal(null)
    const propio = rol.id === rolActualId
    onAviso(
      `Se actualizaron los accesos del rol ${nombreRol(rol)}.${
        propio ? ' Cerrá sesión y volvé a ingresar para ver tu menú actualizado.' : ''
      }`,
    )
  }

  let contenido
  if (roles.cargando) contenido = <StatusMessage type="loading" message="Cargando roles..." />
  else if (roles.error || !roles.datos) {
    contenido = (
      <ErrorConReintento
        error={roles.error ?? { mensaje: 'No se pudieron cargar los roles.', reintentable: true }}
        onReintentar={roles.recargar}
      />
    )
  } else if (roles.datos.data.length === 0) {
    contenido = <EmptyState icon={IconShield} title="No hay roles" description="No hay roles registrados en el sistema." />
  } else {
    const { data, total } = roles.datos
    contenido = (
      <>
        {total > data.length && (
          <p className="gestion-form__nota admin-nota">
            Se muestran solo los primeros {data.length} de {total} roles.
          </p>
        )}
        <ul className="gestion-lista">
          {data.map((rol) => {
            const cantidad = usuariosDe(rol)
            const motivo = puedeEliminar ? motivoSinEliminar(rol) : null
            return (
              <li key={rol.id} className="card gestion-item">
                <div className="gestion-item__encabezado">
                  <h3>{nombreRol(rol)}</h3>
                  {rol.id === rolActualId && <span className="badge">Tu rol</span>}
                </div>
                {descripcionRol(rol) && <p className="admin-rol__descripcion">{descripcionRol(rol)}</p>}
                {cantidad !== null && (
                  <dl className="gestion-item__datos">
                    <div>
                      <dt>Usuarios con este rol</dt>
                      <dd>{cantidad}</dd>
                    </div>
                  </dl>
                )}
                {puedeEliminar && motivo && <p className="admin-nota admin-nota--item">{motivo}</p>}
                {(puedeVerPermisos || (puedeEliminar && !motivo)) && (
                  <div className="gestion-item__acciones">
                    {puedeVerPermisos && (
                      <button type="button" className="btn btn--secondary" onClick={() => setModal({ tipo: 'permisos', rol })}>
                        {puedeEditarPermisos ? 'Ver y administrar accesos' : 'Ver accesos'}
                      </button>
                    )}
                    {puedeEliminar && !motivo && (
                      <button type="button" className="btn btn--danger-outline" onClick={() => setModal({ tipo: 'eliminar', rol })}>
                        Eliminar rol
                      </button>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </>
    )
  }

  return (
    <>
      <div className="gestion-barra">
        <p className="gestion-resumen">
          Cada usuario tiene un solo rol. Los accesos del rol definen qué funcionalidades puede usar.
        </p>
        <button type="button" className="btn btn--secondary" onClick={() => { roles.recargar(); usuarios.recargar() }} disabled={roles.cargando}>
          <IconRefresh />
          Actualizar
        </button>
      </div>
      {contenido}

      <Modal
        open={modal !== null}
        title={modal ? (modal.tipo === 'permisos' ? `Accesos del rol: ${nombreRol(modal.rol)}` : 'Eliminar rol') : ''}
        onClose={cerrar}
        bloqueado={guardando}
      >
        {modal?.tipo === 'permisos' && puedeVerPermisos && (
          <PermisosRol
            key={modal.rol.id}
            rol={modal.rol}
            esRolPropio={modal.rol.id === rolActualId}
            puedeEditar={puedeEditarPermisos}
            onCerrar={cerrar}
            onGuardado={permisosGuardados}
            onGuardandoChange={setGuardando}
          />
        )}
        {modal?.tipo === 'eliminar' && puedeEliminar && !motivoSinEliminar(modal.rol) && (
          <Confirmacion
            textoConfirmar="Eliminar rol"
            peligro
            ejecutar={() => eliminarRol(modal.rol.id)}
            describirError={(e) =>
              mensajeErrorGuardado(e, {
                accion: 'eliminar roles',
                noEncontrado: 'El rol ya no existe. Cerrá la ventana y actualizá el listado.',
              })
            }
            onCancel={cerrar}
            onHecho={() => {
              const nombre = nombreRol(modal.rol)
              setModal(null)
              onAviso(`Se eliminó el rol ${nombre}.`)
              roles.recargar()
            }}
            onGuardandoChange={setGuardando}
          >
            <strong>Rol {nombreRol(modal.rol)}</strong>
            <ul>
              <li>El rol deja de estar disponible para asignarlo a usuarios.</li>
              <li>
                SID-Agro no permite crear roles nuevos ni restaurar uno eliminado.
              </li>
            </ul>
          </Confirmacion>
        )}
      </Modal>
    </>
  )
}

export default RolesPanel
