import { useEffect, useState } from 'react'

interface ProcesandoSimulacionProps {
  titulo: string
}

/** Indicador para el pedido largo de la recomendación (puede tardar hasta un minuto). */
function ProcesandoSimulacion({ titulo }: ProcesandoSimulacionProps) {
  const [segundos, setSegundos] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="procesando" role="status" aria-live="polite">
      <span className="procesando__spinner" aria-hidden="true" />
      <strong className="procesando__titulo">{titulo}</strong>
      <p className="procesando__detalle">
        Se está generando la recomendación. Puede demorar hasta un minuto; no cierres ni recargues
        la página.
      </p>
      {/* Oculto para lectores de pantalla: anunciarlo cada segundo sería molesto. */}
      <span className="procesando__tiempo" aria-hidden="true">
        Tiempo transcurrido: {segundos} s
      </span>
    </div>
  )
}

export default ProcesandoSimulacion
