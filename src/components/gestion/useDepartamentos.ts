import { useEffect, useState } from 'react'
import type { ErrorCarga } from '../monitoreo/errores'
import { obtenerDepartamentos } from '../../services/catalogoService'
import type { DepartamentoApi } from '../../types/catalogo'
import { errorDeCarga } from './errores'

/**
 * Departamentos de la provincia elegida. Distingue «la provincia no tiene departamentos»
 * (listo con lista vacía) de «no se pudieron consultar» (error), que no deben confundirse.
 */
export type EstadoDepartamentos =
  | { estado: 'sinProvincia' }
  | { estado: 'cargando' }
  | { estado: 'error'; error: ErrorCarga }
  | { estado: 'listo'; departamentos: DepartamentoApi[] }

interface Resultado {
  /** Consulta a la que corresponde (provincia e intento). */
  clave: string
  departamentos: DepartamentoApi[] | null
  error: ErrorCarga | null
}

// Los departamentos son un catálogo fijo: se recuerdan por provincia para no repetir la consulta
// cada vez que se abre un formulario o se vuelve a elegir la misma provincia.
const cache = new Map<number, DepartamentoApi[]>()

export type DepartamentosConReintento = EstadoDepartamentos & { reintentar: () => void }

export function useDepartamentos(provinciaId: number | null): DepartamentosConReintento {
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const clave = `${provinciaId}-${intento}`
  const enCache = provinciaId === null ? undefined : cache.get(provinciaId)

  useEffect(() => {
    if (provinciaId === null || cache.has(provinciaId)) return
    // Al cambiar de provincia se cancela la consulta anterior: una respuesta atrasada no puede
    // reemplazar los departamentos de la provincia elegida después.
    const controller = new AbortController()
    obtenerDepartamentos(provinciaId, controller.signal)
      .then((departamentos) => {
        cache.set(provinciaId, departamentos)
        setResultado({ clave, departamentos, error: null })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setResultado({
          clave,
          departamentos: null,
          error: errorDeCarga(error, 'los departamentos de la provincia'),
        })
      })
    return () => controller.abort()
  }, [provinciaId, clave])

  let estado: EstadoDepartamentos
  if (provinciaId === null) estado = { estado: 'sinProvincia' }
  else if (enCache) estado = { estado: 'listo', departamentos: enCache }
  else if (resultado?.clave !== clave) estado = { estado: 'cargando' }
  else if (resultado.error || !resultado.departamentos) {
    estado = {
      estado: 'error',
      error: resultado.error ?? { mensaje: 'No se pudieron cargar los departamentos.', reintentable: true },
    }
  } else estado = { estado: 'listo', departamentos: resultado.departamentos }

  return { ...estado, reintentar: () => setIntento((n) => n + 1) }
}

/** El departamento elegido, solo si pertenece a la lista vigente de la provincia. */
export function departamentoElegido(
  estado: EstadoDepartamentos,
  departamentoId: string,
): DepartamentoApi | null {
  if (estado.estado !== 'listo' || !departamentoId) return null
  return estado.departamentos.find((d) => String(d.id) === departamentoId) ?? null
}

/**
 * Error del departamento para un formulario que lo exige cuando la provincia tiene departamentos.
 * Mientras se cargan o si la consulta falló no se puede guardar.
 */
export function errorDepartamento(estado: EstadoDepartamentos, departamentoId: string): string | undefined {
  switch (estado.estado) {
    case 'sinProvincia':
      return undefined
    case 'cargando':
      return 'Esperá a que se carguen los departamentos de la provincia.'
    case 'error':
      return 'No se pudieron consultar los departamentos. Reintentá la consulta para continuar.'
    case 'listo':
      if (estado.departamentos.length === 0) return undefined
      if (!departamentoId) return 'Seleccioná el departamento.'
      if (!departamentoElegido(estado, departamentoId)) {
        return 'El departamento seleccionado no pertenece a la provincia. Elegí otro.'
      }
      return undefined
  }
}
