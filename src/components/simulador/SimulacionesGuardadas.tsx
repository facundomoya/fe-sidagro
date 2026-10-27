import { useEffect, useState } from 'react'
import EmptyState from '../EmptyState'
import StatusMessage from '../StatusMessage'
import { IconHistory } from '../icons/Icons'
import { obtenerSimulacionesPorLote } from '../../services/simuladorService'
import type { Lote } from '../../types/monitoreo'
import type { SimulacionGuardada, ValorVariable, VariablesSimulacion } from '../../types/simulador'
import { formatearFecha, formatearFechaHora } from '../../utils/format'

interface SimulacionesGuardadasProps {
  lote: Lote
}

function formatearValor(valor: ValorVariable): string {
  if (valor === null) return '—'
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  return String(valor)
}

// Muestra las variables tal como las devuelva el motor, sin suponer sus nombres.
function ListaVariables({ titulo, variables }: { titulo: string; variables: VariablesSimulacion }) {
  const entradas = Object.entries(variables)
  if (entradas.length === 0) return null

  return (
    <div className="simulacion-guardada__grupo">
      <span className="simulacion-guardada__grupo-titulo">{titulo}</span>
      <dl className="simulacion-guardada__datos">
        {entradas.map(([nombre, valor]) => (
          <div key={nombre}>
            <dt>{nombre}</dt>
            <dd>{formatearValor(valor)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// Se monta cada vez que se abre el modal, por lo que siempre consulta las simulaciones actuales.
function SimulacionesGuardadas({ lote }: SimulacionesGuardadasProps) {
  const [simulaciones, setSimulaciones] = useState<SimulacionGuardada[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let vigente = true
    obtenerSimulacionesPorLote(lote.id)
      .then((datos) => vigente && setSimulaciones(datos))
      .catch(() => vigente && setError(true))
    return () => {
      vigente = false
    }
  }, [lote.id])

  if (error) {
    return <StatusMessage type="error" message="No se pudieron cargar las simulaciones guardadas." />
  }
  if (!simulaciones) {
    return <StatusMessage type="loading" message="Cargando simulaciones..." />
  }
  if (simulaciones.length === 0) {
    return (
      <EmptyState
        icon={IconHistory}
        title="No hay simulaciones guardadas"
        description={`Todavía no se guardaron simulaciones para ${lote.nombre}.`}
      />
    )
  }

  return (
    <div className="simulaciones-guardadas">
      <p className="simulaciones-guardadas__resumen">
        {lote.nombre} · {simulaciones.length}{' '}
        {simulaciones.length === 1 ? 'simulación guardada' : 'simulaciones guardadas'}
      </p>
      <ul className="simulaciones-guardadas__lista">
        {simulaciones.map((s) => (
          <li key={s.id} className="simulacion-guardada">
            <div className="simulacion-guardada__encabezado">
              <strong>{s.nombreEscenario}</strong>
              {s.resultadoRiesgo.nivel && <span>Riesgo {s.resultadoRiesgo.nivel}</span>}
            </div>
            <dl className="simulacion-guardada__datos">
              <div>
                <dt>Fecha simulada</dt>
                <dd>{formatearFecha(s.fechaSimulada)}</dd>
              </div>
              <div>
                <dt>Ejecutada el</dt>
                <dd>{formatearFechaHora(s.fechaEjecucion)}</dd>
              </div>
            </dl>
            <ListaVariables titulo="Condiciones de entrada" variables={s.condicionesEntrada} />
            <ListaVariables titulo="Resultado" variables={s.resultadoRiesgo.valores} />
            {s.recomendacion && (
              <p className="simulacion-guardada__recomendacion">{s.recomendacion}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SimulacionesGuardadas
