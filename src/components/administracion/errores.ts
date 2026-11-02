import { mensajeErrorGuardado } from '../gestion/errores'

/** Error al crear o modificar un usuario. */
export function errorUsuario(error: unknown, accion: string): string {
  return mensajeErrorGuardado(error, {
    accion,
    // También responde 404 cuando no cambió ningún dato (0 filas modificadas).
    noEncontrado:
      'El usuario o el rol ya no existe, o no había cambios para guardar. Cerrá el formulario y actualizá el listado.',
  })
}
