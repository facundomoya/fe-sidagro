import { useCallback, useState } from 'react'
import EmptyState from '../EmptyState'
import Modal from '../Modal'
import StatusMessage from '../StatusMessage'
import ErrorConReintento from '../monitoreo/ErrorConReintento'
import { IconPlus, IconRefresh, IconUsers } from '../icons/Icons'
import {
  darDeBajaUsuario,
  modificarUsuario,
  obtenerUsuarios,
} from '../../services/administracionService'
import type { RolApi, UsuarioApi } from '../../types/administracion'
import Confirmacion from './Confirmacion'
import ContraseniaForm from './ContraseniaForm'
import DatosUsuarioForm from './DatosUsuarioForm'
import NuevoUsuarioForm from './NuevoUsuarioForm'
import RolUsuarioForm from './RolUsuarioForm'
import { errorUsuario } from './errores'
import { ESTADO_USUARIO, nombreCompleto, nombreRol } from './presentacion'
import { useConsulta } from './useConsulta'

const POR_PAGINA = 10

interface UsuariosPanelProps {
  /** Usuario con la sesión iniciada, para evitar que se quite el acceso a sí mismo. */
  usuarioActualId: number
  /** Roles para elegir; null si no se pueden consultar (sin ROLE_GET_ALL o con error). */
  roles: RolApi[] | null
  puedeCrear: boolean
  puedeModificar: boolean
  puedeDarDeBaja: boolean
  onAviso: (texto: string) => void
}

type ModalUsuario =
  | { tipo: 'nuevo' }
  | { tipo: 'datos' | 'clave' | 'rol' | 'baja' | 'alta'; usuario: UsuarioApi }
  | null

const TITULOS = {
  nuevo: 'Nuevo usuario',
  datos: 'Editar datos del usuario',
  clave: 'Cambiar contraseña',
  rol: 'Cambiar rol',
  baja: 'Dar de baja al usuario',
  alta: 'Reactivar usuario',
}

/** Listado paginado de usuarios con las acciones que permiten los permisos del usuario actual. */
function UsuariosPanel({
  usuarioActualId,
  roles,
  puedeCrear,
  puedeModificar,
  puedeDarDeBaja,
  onAviso,
}: UsuariosPanelProps) {
  const [pagina, setPagina] = useState(1)
  const [modal, setModal] = useState<ModalUsuario>(null)
  const [guardando, setGuardando] = useState(false)

  const consultar = useCallback(
    (signal: AbortSignal) => obtenerUsuarios({ page: pagina, limit: POR_PAGINA }, signal),
    [pagina],
  )
  const { datos, cargando, error, recargar } = useConsulta(consultar, 'los usuarios')
  const hayRoles = !!roles && roles.length > 0

  function cerrar() {
    if (!guardando) setModal(null)
  }

  function terminar(texto: string) {
    setModal(null)
    onAviso(texto)
    recargar()
  }

  let contenido
  if (cargando) contenido = <StatusMessage type="loading" message="Cargando usuarios..." />
  else if (error || !datos) {
    contenido = (
      <ErrorConReintento
        error={error ?? { mensaje: 'No se pudieron cargar los usuarios.', reintentable: true }}
        onReintentar={recargar}
      />
    )
  } else if (datos.data.length === 0) {
    contenido = (
      <EmptyState icon={IconUsers} title="No hay usuarios" description="Todavía no hay usuarios registrados." />
    )
  } else {
    contenido = (
      <>
        <ul className="gestion-lista">
          {datos.data.map((usuario) => (
            <FilaUsuario
              key={usuario.id}
              usuario={usuario}
              esPropio={usuario.id === usuarioActualId}
              puedeModificar={puedeModificar}
              puedeCambiarRol={puedeModificar && hayRoles}
              puedeDarDeBaja={puedeDarDeBaja}
              onAccion={(tipo) => setModal({ tipo, usuario })}
            />
          ))}
        </ul>
        {datos.totalPages > 1 && (
          <nav className="admin-paginacion" aria-label="Páginas de usuarios">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setPagina((p) => p - 1)}
              disabled={pagina <= 1}
            >
              Anterior
            </button>
            <span aria-live="polite">
              Página {datos.page} de {datos.totalPages}
            </span>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setPagina((p) => p + 1)}
              disabled={pagina >= datos.totalPages}
            >
              Siguiente
            </button>
          </nav>
        )}
      </>
    )
  }

  const usuarioModal = modal && modal.tipo !== 'nuevo' ? modal.usuario : null
  const esPropioModal = usuarioModal?.id === usuarioActualId
  // Cada formulario se monta solo si la acción está permitida sobre ese usuario, aunque se cambie
  // el estado del modal por otro medio. Si no, la ventana ni se abre.
  const permitido: Record<NonNullable<ModalUsuario>['tipo'], boolean> = {
    nuevo: puedeCrear && hayRoles,
    datos: puedeModificar && esPropioModal,
    clave: puedeModificar && esPropioModal,
    rol: puedeModificar && hayRoles && !esPropioModal,
    baja: puedeDarDeBaja && !esPropioModal,
    alta: puedeModificar && !esPropioModal,
  }
  const modalAbierto = modal !== null && permitido[modal.tipo]

  return (
    <>
      <div className="gestion-barra">
        <p className="gestion-resumen" aria-live="polite">
          {datos ? `${datos.total} ${datos.total === 1 ? 'usuario' : 'usuarios'}` : ''}
        </p>
        <div className="admin-barra__acciones">
          <button type="button" className="btn btn--secondary" onClick={recargar} disabled={cargando}>
            <IconRefresh />
            Actualizar
          </button>
          {puedeCrear && hayRoles && (
            <button type="button" className="btn btn--primary" onClick={() => setModal({ tipo: 'nuevo' })}>
              <IconPlus />
              Nuevo usuario
            </button>
          )}
        </div>
      </div>
      {puedeCrear && !hayRoles && (
        <p className="gestion-form__nota admin-nota">
          Para crear usuarios o cambiarles el rol hace falta poder consultar los roles, y no están disponibles.
        </p>
      )}

      {contenido}

      <Modal open={modalAbierto} title={modal ? TITULOS[modal.tipo] : ''} onClose={cerrar} bloqueado={guardando}>
        {modal?.tipo === 'nuevo' && puedeCrear && roles && (
          <NuevoUsuarioForm
            roles={roles}
            onCancel={cerrar}
            onSaved={(u) => terminar(`Se creó el usuario ${u.username}.`)}
            onGuardandoChange={setGuardando}
          />
        )}
        {modal?.tipo === 'datos' && usuarioModal && puedeModificar && esPropioModal && (
          <DatosUsuarioForm
            usuario={usuarioModal}
            esPropio
            onCancel={cerrar}
            onSaved={(u) => terminar(`Se actualizaron los datos de ${u.username}.`)}
            onGuardandoChange={setGuardando}
          />
        )}
        {modal?.tipo === 'clave' && usuarioModal && puedeModificar && esPropioModal && (
          <ContraseniaForm
            usuario={usuarioModal}
            esPropio
            onCancel={cerrar}
            onSaved={(u) => terminar(`Se cambió la contraseña de ${u.username}.`)}
            onGuardandoChange={setGuardando}
          />
        )}
        {modal?.tipo === 'rol' && usuarioModal && puedeModificar && roles && !esPropioModal && (
          <RolUsuarioForm
            usuario={usuarioModal}
            roles={roles}
            onCancel={cerrar}
            onSaved={(u) => terminar(`Se asignó el rol ${nombreRol(u.role)} a ${u.username}.`)}
            onGuardandoChange={setGuardando}
          />
        )}
        {modal?.tipo === 'baja' && usuarioModal && puedeDarDeBaja && !esPropioModal && (
          <Confirmacion
            textoConfirmar="Dar de baja"
            peligro
            ejecutar={() => darDeBajaUsuario(usuarioModal.id)}
            describirError={(e) => errorUsuario(e, 'dar de baja usuarios')}
            onCancel={cerrar}
            onHecho={(u) => terminar(`Se dio de baja a ${u.username}.`)}
            onGuardandoChange={setGuardando}
          >
            <strong>
              {nombreCompleto(usuarioModal)} ({usuarioModal.username})
            </strong>
            <ul>
              <li>No va a poder iniciar sesión y sus operaciones en curso dejan de funcionar.</li>
              <li>El usuario no se borra: queda inactivo y se conserva su historial.</li>
              <li>Se puede reactivar después desde este listado.</li>
            </ul>
          </Confirmacion>
        )}
        {modal?.tipo === 'alta' && usuarioModal && puedeModificar && !esPropioModal && (
          <Confirmacion
            textoConfirmar="Reactivar"
            ejecutar={() => modificarUsuario(usuarioModal.id, { isActive: true })}
            describirError={(e) => errorUsuario(e, 'modificar usuarios')}
            onCancel={cerrar}
            onHecho={(u) => terminar(`Se reactivó a ${u.username}.`)}
            onGuardandoChange={setGuardando}
          >
            <strong>
              {nombreCompleto(usuarioModal)} ({usuarioModal.username})
            </strong>
            <p className="admin-confirmar__texto">
              Va a poder volver a iniciar sesión con su contraseña actual y los accesos de su rol (
              {nombreRol(usuarioModal.role)}).
            </p>
          </Confirmacion>
        )}
      </Modal>
    </>
  )
}

type AccionUsuario = 'datos' | 'clave' | 'rol' | 'baja' | 'alta'

interface FilaUsuarioProps {
  usuario: UsuarioApi
  esPropio: boolean
  puedeModificar: boolean
  puedeCambiarRol: boolean
  puedeDarDeBaja: boolean
  onAccion: (accion: AccionUsuario) => void
}

function FilaUsuario({
  usuario,
  esPropio,
  puedeModificar,
  puedeCambiarRol,
  puedeDarDeBaja,
  onAccion,
}: FilaUsuarioProps) {
  const estado = usuario.isActive ? ESTADO_USUARIO.activo : ESTADO_USUARIO.inactivo
  // Los datos y la contraseña solo se editan en la tarjeta propia. Sobre el propio usuario no se
  // ofrecen acciones que le quiten el acceso (cambiar el rol o darse de baja).
  const acciones: { accion: AccionUsuario; texto: string }[] = []
  if (puedeModificar && esPropio) {
    acciones.push({ accion: 'datos', texto: 'Editar datos' })
    acciones.push({ accion: 'clave', texto: 'Cambiar contraseña' })
  }
  if (puedeCambiarRol && !esPropio) acciones.push({ accion: 'rol', texto: 'Cambiar rol' })
  if (usuario.isActive && puedeDarDeBaja && !esPropio) acciones.push({ accion: 'baja', texto: 'Dar de baja' })
  if (!usuario.isActive && puedeModificar) acciones.push({ accion: 'alta', texto: 'Reactivar' })

  return (
    <li className={`card gestion-item${usuario.isActive ? '' : ' gestion-item--pendiente'}`}>
      <div className="gestion-item__encabezado">
        <h3>{nombreCompleto(usuario)}</h3>
        <span className="admin-insignias">
          {esPropio && <span className="badge">Vos</span>}
          <span className={estado.clase}>{estado.texto}</span>
        </span>
      </div>
      <dl className="gestion-item__datos">
        <div>
          <dt>Usuario</dt>
          <dd>{usuario.username}</dd>
        </div>
        <div>
          <dt>Rol</dt>
          <dd>{usuario.role ? nombreRol(usuario.role) : <span className="gestion-item__sin-dato">Sin rol</span>}</dd>
        </div>
        <div className="admin-dato--ancho">
          <dt>Correo electrónico</dt>
          <dd>{usuario.email}</dd>
        </div>
      </dl>
      {acciones.length > 0 && (
        <div className="gestion-item__acciones">
          {acciones.map(({ accion, texto }) => (
            <button
              key={accion}
              type="button"
              className={`btn ${accion === 'baja' ? 'btn--danger-outline' : 'btn--secondary'}`}
              onClick={() => onAccion(accion)}
            >
              {texto}
            </button>
          ))}
        </div>
      )}
    </li>
  )
}

export default UsuariosPanel
