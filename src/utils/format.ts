/** Convierte una fecha ISO (YYYY-MM-DD) a Date local, sin desfase por zona horaria. */
function parsearFechaIso(fechaIso: string): Date {
  const [anio, mes, dia] = fechaIso.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

/** Fecha actual local en formato ISO (YYYY-MM-DD). */
export function fechaHoyIso(): string {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

export function formatearFecha(fechaIso: string): string {
  return parsearFechaIso(fechaIso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatearFechaLarga(fechaIso: string): string {
  return parsearFechaIso(fechaIso).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Formatea una fecha y hora ISO completa (con zona horaria) en hora local. */
export function formatearFechaHora(fechaHoraIso: string): string {
  return new Date(fechaHoraIso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/** Convierte un decimal recibido como texto (por ejemplo "812.40"); null si falta o no es válido. */
export function parsearDecimal(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

export function formatearNumero(valor: number, decimales = 1): string {
  return valor.toLocaleString('es-AR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}
