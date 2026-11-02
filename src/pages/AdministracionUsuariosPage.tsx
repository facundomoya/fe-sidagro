import { useCallback, useState, type KeyboardEvent } from 'react'
import PageHeader from '../components/PageHeader'
import StatusMessage from '../components/StatusMessage'
import UsuariosPanel from '../components/administracion/UsuariosPanel'
import RolesPanel from '../components/administracion/RolesPanel'
import { useConsulta } from '../components/administracion/useConsulta'
import { useAuth } from '../auth/useAuth'
import { PERMISOS } from '../auth/permisos'
import { obtenerRoles } from '../services/administracionService'
import '../components/gestion/Gestion.css'
import '../components/administracion/Administracion.css'

type Pestania = 'usuarios' | 'roles'

const PESTANIAS: { id: Pestania; texto: string; permiso: string }[] = [
  { id: 'usuarios', texto: 'Usuarios', permiso: PERMISOS.listarUsuarios },
  { id: 'roles', texto: 'Roles', permiso: PERMISOS.listarRoles },
]

/**
 * Administración de usuarios y de los accesos de cada rol. La ruta exige poder consultar usuarios
 * o roles; cada pestaña y cada acción exigen su propio permiso, que el backend vuelve a controlar.
 */
function AdministracionUsuariosPage() {
  const { usuario, tienePermiso } = useAuth()
  const visibles = PESTANIAS.filter((p) => tienePermiso(p.permiso))
  const [elegida, setElegida] = useState<Pestania | null>(null)
  const pestania = visibles.find((p) => p.id === elegida)?.id ?? visibles[0]?.id ?? null
  const [aviso, setAviso] = useState<{ id: number; texto: string } | null>(null)

  // Los roles se usan en las pestañas Usuarios (para elegirlos) y Roles.
  const puedeListarRoles = tienePermiso(PERMISOS.listarRoles)
  const consultarRoles = useCallback((signal: AbortSignal) => obtenerRoles(signal), [])
  const roles = useConsulta(puedeListarRoles ? consultarRoles : null, 'los roles')

  function avisar(texto: string) {
    setAviso({ id: Date.now(), texto })
  }

  function handleTecla(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const indice = visibles.findIndex((p) => p.id === pestania)
    const paso = e.key === 'ArrowRight' ? 1 : -1
    const siguiente = visibles[(indice + paso + visibles.length) % visibles.length]
    setElegida(siguiente.id)
    document.getElementById(`pestania-admin-${siguiente.id}`)?.focus()
  }

  const header = (
    <PageHeader
      title="Administración de usuarios"
      description="Gestioná los usuarios del sistema y los accesos disponibles para cada rol."
    />
  )

  if (!usuario || !pestania) {
    return (
      <>
        {header}
        <StatusMessage type="error" message="Tu usuario no tiene permiso para consultar usuarios ni roles." />
      </>
    )
  }

  return (
    <>
      {header}

      {aviso && (
        <div className="gestion-confirmacion">
          <StatusMessage key={aviso.id} type="success" message={aviso.texto} />
        </div>
      )}

      <div className="gestion-pestanias" role="tablist" aria-label="Administración de usuarios">
        {visibles.map(({ id, texto }) => (
          <button
            key={id}
            id={`pestania-admin-${id}`}
            type="button"
            role="tab"
            className={`gestion-pestanias__tab${pestania === id ? ' gestion-pestanias__tab--activa' : ''}`}
            aria-selected={pestania === id}
            aria-controls="panel-admin"
            tabIndex={pestania === id ? 0 : -1}
            onClick={() => setElegida(id)}
            onKeyDown={handleTecla}
          >
            {texto}
          </button>
        ))}
      </div>

      <section
        id="panel-admin"
        role="tabpanel"
        aria-labelledby={`pestania-admin-${pestania}`}
        className="card section-card gestion-panel"
      >
        {pestania === 'usuarios' && (
          <UsuariosPanel
            usuarioActualId={usuario.id}
            roles={roles.datos?.data ?? null}
            puedeCrear={tienePermiso(PERMISOS.crearUsuario)}
            puedeModificar={tienePermiso(PERMISOS.modificarUsuario)}
            puedeDarDeBaja={tienePermiso(PERMISOS.desactivarUsuario)}
            onAviso={avisar}
          />
        )}
        {pestania === 'roles' && (
          <RolesPanel
            roles={roles}
            rolActualId={usuario.role?.id ?? null}
            puedeVerPermisos={tienePermiso(PERMISOS.consultarRol)}
            puedeEditarPermisos={
              tienePermiso(PERMISOS.consultarRol) &&
              tienePermiso(PERMISOS.modificarRol) &&
              tienePermiso(PERMISOS.listarPermisos)
            }
            puedeEliminar={tienePermiso(PERMISOS.eliminarRol)}
            puedeContarUsuarios={tienePermiso(PERMISOS.listarUsuarios)}
            onAviso={avisar}
          />
        )}
      </section>
    </>
  )
}

export default AdministracionUsuariosPage
