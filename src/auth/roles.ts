// Roles definidos por el backend. Se usarán para mostrar u ocultar opciones según el usuario.
export const ROLES = {
  gerente: 'GERENTE',
  ingeniero: 'INGENIERO',
} as const

const ETIQUETAS_ROL: Record<string, string> = {
  [ROLES.gerente]: 'Gerencia',
  [ROLES.ingeniero]: 'Ingeniero agrónomo',
}

/** Nombre del rol para mostrar; si no se conoce, se muestra tal como lo envía el backend. */
export function etiquetaRol(nombre: string | undefined): string {
  if (!nombre) return 'Sin rol asignado'
  return ETIQUETAS_ROL[nombre] ?? nombre
}
