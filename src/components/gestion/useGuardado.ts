import { useRef, useState } from 'react'

/**
 * Estado común de los formularios de la sección: evita envíos duplicados, bloquea el modal
 * mientras se guarda y conserva el formulario abierto si el backend devuelve un error.
 */
export function useGuardado(onGuardandoChange: (guardando: boolean) => void) {
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  // Evita envíos duplicados aunque se presione varias veces antes de volver a renderizar.
  const guardandoRef = useRef(false)

  async function guardar<T>(
    operacion: () => Promise<T>,
    onExito: (resultado: T) => void,
    describirError: (error: unknown) => string,
  ) {
    if (guardandoRef.current) return
    guardandoRef.current = true
    setGuardando(true)
    setErrorGuardado(null)
    onGuardandoChange(true)
    let resultado: T
    try {
      resultado = await operacion()
    } catch (error) {
      setErrorGuardado(describirError(error))
      setGuardando(false)
      guardandoRef.current = false
      onGuardandoChange(false)
      return
    }
    // Se desbloquea el modal antes de avisar el éxito, para que la página pueda cerrarlo.
    onGuardandoChange(false)
    onExito(resultado)
  }

  return { guardando, errorGuardado, guardar }
}
