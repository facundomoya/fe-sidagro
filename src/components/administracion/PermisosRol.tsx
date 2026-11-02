import { useCallback, useState } from 'react'
import StatusMessage from '../StatusMessage'
import ErrorConReintento from '../monitoreo/ErrorConReintento'
import { useGuardado } from '../gestion/useGuardado'
import { mensajeErrorGuardado } from '../gestion/errores'
import { establecerPermisosRol, obtenerPermisos, obtenerRol } from '../../services/administracionService'
import type { PermisoApi, RolApi, RolConPermisosApi } from '../../types/administracion'
import { ApiError } from '../../services/apiClient'
import {
  agruparAccesos,
  esAccesoVisible,
  esPermisoAdministrativo,
  etiquetaAcceso,
  nombreRol,
} from './presentacion'
import { useConsulta } from './useConsulta'

interface PermisosRolProps {
  rol: RolApi
  /** Es el rol del usuario con la sesión iniciada. */
  esRolPropio: boolean
  /** ROLE_PUT y PERMISSION_GET_ALL: puede cambiar los permisos asignados. */
  puedeEditar: boolean
  onCerrar: () => void
  onGuardado: (rol: RolConPermisosApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

/** Los permisos asignados cambiaron desde que se abrió el formulario: no se envía nada. */
class RolModificado extends Error {}

type Modo = 'ver' | 'editar' | 'revisar'

const iguales = (a: Set<number>, b: Set<number>) => a.size === b.size && [...a].every((id) => b.has(id))

/**
 * Permisos de un rol. Permite marcar los que se agregan o quitan, revisarlos y confirmarlos.
 * El backend reemplaza la lista completa del rol, así que se envía el conjunto final.
 */
function PermisosRol({ rol, esRolPropio, puedeEditar, onCerrar, onGuardado, onGuardandoChange }: PermisosRolProps) {
  const consultarRol = useCallback((signal: AbortSignal) => obtenerRol(rol.id, signal), [rol.id])
  const detalle = useConsulta(consultarRol, 'los accesos del rol')
  const consultarCatalogo = useCallback((signal: AbortSignal) => obtenerPermisos(signal), [])
  const catalogo = useConsulta(puedeEditar ? consultarCatalogo : null, 'las funcionalidades disponibles')

  const [modo, setModo] = useState<Modo>('ver')
  const [seleccion, setSeleccion] = useState<Set<number>>(new Set())
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)

  if (detalle.cargando) return <StatusMessage type="loading" message="Cargando los accesos del rol..." />
  if (detalle.error) return <ErrorConReintento error={detalle.error} onReintentar={detalle.recargar} />
  if (!detalle.datos) {
    return <StatusMessage type="error" message="El rol ya no existe. Cerrá la ventana y actualizá el listado." />
  }

  const asignados = detalle.datos.permission
  const idsAsignados = new Set(asignados.map((p) => p.id))
  // En el propio rol no se pueden quitar los permisos de administración: el usuario perdería el acceso.
  const bloqueado = (p: PermisoApi) => esRolPropio && idsAsignados.has(p.id) && esPermisoAdministrativo(p.name)

  function empezarEdicion() {
    setSeleccion(new Set(idsAsignados))
    setModo('editar')
  }

  function alternar(permiso: PermisoApi) {
    if (bloqueado(permiso) || !esAccesoVisible(permiso)) return
    setSeleccion((actual) => {
      const nueva = new Set(actual)
      if (nueva.has(permiso.id)) nueva.delete(permiso.id)
      else nueva.add(permiso.id)
      return nueva
    })
  }

  if (modo === 'ver' || !catalogo.datos) {
    return (
      <div className="form">
        <p className="gestion-form__nota">Funcionalidades habilitadas para este rol.</p>
        {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}
        <ListaAccesos permisos={asignados} vacio="Este rol no tiene funcionalidades habilitadas." />
        {modo !== 'ver' && catalogo.cargando && (
          <StatusMessage type="loading" message="Cargando las funcionalidades disponibles..." />
        )}
        {modo !== 'ver' && catalogo.error && (
          <ErrorConReintento error={catalogo.error} onReintentar={catalogo.recargar} />
        )}
        <div className="form__actions">
          <button type="button" className="btn btn--secondary" onClick={onCerrar}>
            Cerrar
          </button>
          {puedeEditar && modo === 'ver' && (
            <button type="button" className="btn btn--primary" onClick={empezarEdicion}>
              Administrar accesos
            </button>
          )}
        </div>
      </div>
    )
  }

  // Solo se editan los accesos visibles. Los ocultos, los que SID-Agro no reconoce y los que no
  // figuran en el catálogo se conservan tal cual: el backend reemplaza la lista completa.
  const disponibles = catalogo.datos.filter(esAccesoVisible)
  const idsEditables = new Set(disponibles.map((p) => p.id))
  const agregar = disponibles.filter((p) => seleccion.has(p.id) && !idsAsignados.has(p.id))
  const quitar = asignados.filter((p) => idsEditables.has(p.id) && !seleccion.has(p.id))
  const conservados = asignados.filter((p) => !idsEditables.has(p.id)).map((p) => p.id)
  const finales = [...new Set([...conservados, ...[...seleccion].filter((id) => idsEditables.has(id))])]
  const sinCambios = agregar.length === 0 && quitar.length === 0

  function confirmar() {
    guardar(
      async () => {
        // El backend reemplaza la lista completa: si otro usuario la cambió, se pisarían sus cambios.
        const actual = await obtenerRol(rol.id)
        if (!actual || !iguales(new Set(actual.permission.map((p) => p.id)), idsAsignados)) {
          throw new RolModificado()
        }
        return establecerPermisosRol(rol.id, finales)
      },
      // La página cierra la ventana y muestra la confirmación con lo que devolvió el backend.
      onGuardado,
      (error) => {
        if (error instanceof RolModificado) {
          setModo('ver')
          detalle.recargar()
          return 'Los accesos del rol cambiaron mientras los editabas. No se guardó nada: revisá la lista actual.'
        }
        if (error instanceof ApiError && error.status === 400) {
          return 'No se pudieron guardar los cambios. Actualizá el listado e intentá nuevamente.'
        }
        return mensajeErrorGuardado(error, {
          accion: 'administrar los accesos de los roles',
          noEncontrado: 'El rol ya no existe. Cerrá la ventana y actualizá el listado.',
        })
      },
    )
  }

  if (modo === 'revisar') {
    return (
      <div className="form">
        <div className="gestion-confirmar">
          <strong>Revisá los cambios en los accesos del rol {nombreRol(rol)}</strong>
          <ResumenCambios titulo="Accesos que se habilitarán" permisos={agregar} />
          <ResumenCambios titulo="Accesos que se quitarán" permisos={quitar} />
        </div>
        <p className="gestion-aviso">
          {esRolPropio
            ? 'Es tu propio rol. El backend aplica los cambios desde la próxima operación; para ver el menú actualizado, cerrá sesión y volvé a ingresar.'
            : 'Afecta a todos los usuarios con este rol desde su próxima operación. Verán el menú actualizado cuando vuelvan a ingresar.'}
        </p>
        {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}
        <div className="form__actions">
          <button type="button" className="btn btn--secondary" onClick={() => setModo('editar')} disabled={guardando}>
            Volver
          </button>
          <button type="button" className="btn btn--primary" onClick={confirmar} disabled={guardando} aria-busy={guardando}>
            {guardando && <span className="btn__spinner gestion-form__spinner" aria-hidden="true" />}
            {guardando ? 'Guardando...' : 'Confirmar cambios'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="form">
      <p className="gestion-form__nota">
        Marcá las funcionalidades que debe tener habilitadas el rol <strong>{nombreRol(rol)}</strong>.
        Los cambios no se aplican hasta confirmarlos.
      </p>
      {esRolPropio && (
        <p className="gestion-aviso">
          Es tu propio rol: no podés quitarle los accesos de administración de usuarios y roles, para
          no perder el acceso a esta sección.
        </p>
      )}
      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}
      <div className="admin-permisos">
        {agruparAccesos(disponibles).map((grupo) => (
          <fieldset key={grupo.titulo} className="admin-permisos__grupo">
            <legend>{grupo.titulo}</legend>
            {grupo.accesos.map(({ permiso: p, etiqueta, descripcion }) => {
              const marcado = seleccion.has(p.id)
              const cambio = marcado !== idsAsignados.has(p.id)
              return (
                <label key={p.id} className={`admin-permiso${cambio ? ' admin-permiso--cambio' : ''}`}>
                  <input type="checkbox" checked={marcado} disabled={bloqueado(p)} onChange={() => alternar(p)} />
                  <span>
                    <strong>{etiqueta}</strong>
                    {descripcion && <small>{descripcion}</small>}
                    {bloqueado(p) && <small>No se puede quitar de tu propio rol.</small>}
                  </span>
                  {cambio && <span className="admin-permiso__marca">{marcado ? 'Se habilita' : 'Se quita'}</span>}
                </label>
              )
            })}
          </fieldset>
        ))}
      </div>
      <p className="gestion-resumen" aria-live="polite">
        {agregar.length} para habilitar · {quitar.length} para quitar
      </p>
      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={() => setModo('ver')}>
          Descartar cambios
        </button>
        <button type="button" className="btn btn--primary" onClick={() => setModo('revisar')} disabled={sinCambios}>
          Revisar cambios
        </button>
      </div>
    </div>
  )
}

function ResumenCambios({ titulo, permisos }: { titulo: string; permisos: PermisoApi[] }) {
  if (permisos.length === 0) return null
  return (
    <>
      <p className="admin-confirmar__texto">{titulo}:</p>
      <ul>
        {permisos.map((p) => (
          <li key={p.id}>{etiquetaAcceso(p)}</li>
        ))}
      </ul>
    </>
  )
}

/** Funcionalidades agrupadas por área, solo para consultar. */
function ListaAccesos({ permisos, vacio }: { permisos: PermisoApi[]; vacio: string }) {
  const grupos = agruparAccesos(permisos)
  if (grupos.length === 0) return <StatusMessage type="empty" message={vacio} />
  return (
    <div className="admin-permisos">
      {grupos.map((grupo) => (
        <section key={grupo.titulo} className="admin-permisos__grupo">
          <h3>{grupo.titulo}</h3>
          <ul>
            {grupo.accesos.map(({ permiso, etiqueta, descripcion }) => (
              <li key={permiso.id} className="admin-permiso admin-permiso--lectura">
                <span>
                  <strong>{etiqueta}</strong>
                  {descripcion && <small>{descripcion}</small>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default PermisosRol
