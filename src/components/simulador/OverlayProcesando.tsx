import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ProcesandoSimulacion from './ProcesandoSimulacion'

interface OverlayProcesandoProps {
  titulo: string
}

/**
 * Cubre toda la aplicación mientras se espera la recomendación. Se monta solo durante el
 * pedido: al desmontarse (respuesta, error o salida de la página) se libera la interfaz.
 */
function OverlayProcesando({ titulo }: OverlayProcesandoProps) {
  const tarjetaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // inert bloquea clics y teclado en toda la app (menú, formulario, historial, cerrar sesión).
    // El overlay se dibuja fuera de #root, por lo que no queda alcanzado.
    const raiz = document.getElementById('root')
    const enfocado = document.activeElement instanceof HTMLElement ? document.activeElement : null
    raiz?.setAttribute('inert', '')
    document.body.classList.add('sin-scroll')
    tarjetaRef.current?.focus()
    return () => {
      raiz?.removeAttribute('inert')
      document.body.classList.remove('sin-scroll')
      if (enfocado?.isConnected) enfocado.focus()
    }
  }, [])

  return createPortal(
    <div className="overlay-proceso" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="card overlay-proceso__tarjeta" ref={tarjetaRef} tabIndex={-1}>
        <ProcesandoSimulacion titulo={titulo} />
      </div>
    </div>,
    document.body,
  )
}

export default OverlayProcesando
