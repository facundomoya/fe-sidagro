import { useEffect, useState } from 'react'
import type { ErrorCarga } from '../monitoreo/errores'
import { errorDeCarga } from '../gestion/errores'

type Consultar<T> = (signal: AbortSignal) => Promise<T>

interface Resultado<T> {
  /** Consulta e intento a los que corresponde el resultado. */
  fuente: Consultar<T>
  intento: number
  datos: T | null
  error: ErrorCarga | null
}

export interface EstadoConsulta<T> {
  datos: T | null
  cargando: boolean
  error: ErrorCarga | null
  /** Vuelve a consultar, por ejemplo después de guardar un cambio o ante un error. */
  recargar: () => void
}

/**
 * Consulta de la sección de administración. `consultar` debe ser estable (useCallback): cada vez
 * que cambia se vuelve a consultar y una respuesta atrasada no pisa a la nueva. Con null no se
 * consulta nada, por ejemplo si el usuario no tiene el permiso.
 */
export function useConsulta<T>(consultar: Consultar<T> | null, recurso: string): EstadoConsulta<T> {
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)

  useEffect(() => {
    if (!consultar) return
    const controller = new AbortController()
    consultar(controller.signal)
      .then((datos) => setResultado({ fuente: consultar, intento, datos, error: null }))
      .catch((error) => {
        if (controller.signal.aborted) return
        setResultado({ fuente: consultar, intento, datos: null, error: errorDeCarga(error, recurso) })
      })
    return () => controller.abort()
  }, [consultar, intento, recurso])

  const vigente =
    consultar && resultado?.fuente === consultar && resultado.intento === intento ? resultado : null
  return {
    datos: vigente?.datos ?? null,
    cargando: !!consultar && !vigente,
    error: vigente?.error ?? null,
    recargar: () => setIntento((n) => n + 1),
  }
}
