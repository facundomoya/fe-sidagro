import type { Lote } from '../../types/monitoreo'
import type { ConfiguracionEscenario } from '../../types/simulador'
import { formatearFecha } from '../../utils/format'
import { IconPlay, IconSliders } from '../icons/Icons'

interface ConfiguracionEscenarioPanelProps {
  lotes: Lote[]
  configuracion: ConfiguracionEscenario
  onChange: (configuracion: ConfiguracionEscenario) => void
}

const PENDIENTE = 'Pendiente de definición de las entradas del motor de simulación.'

function ConfiguracionEscenarioPanel({
  lotes,
  configuracion,
  onChange,
}: ConfiguracionEscenarioPanelProps) {
  const lote = lotes.find((l) => l.id === configuracion.loteId)
  const provincias = [...new Set(lotes.map((l) => l.provincia))]

  return (
    <section className="card section-card simulador-panel">
      <h2 className="simulador-panel__title">
        <IconSliders />
        Configuración del escenario
      </h2>

      <div className="form">
        <label className="form-field">
          <span className="form-field__label">Lote</span>
          <select
            value={configuracion.loteId}
            onChange={(e) => onChange({ ...configuracion, loteId: e.target.value })}
          >
            {provincias.map((provincia) => (
              <optgroup key={provincia} label={provincia}>
                {lotes
                  .filter((l) => l.provincia === provincia)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombre}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>

        {lote && (
          <dl className="simulador-lote">
            <div>
              <dt>Provincia</dt>
              <dd>{lote.provincia}</dd>
            </div>
            <div>
              <dt>Fecha de siembra</dt>
              <dd>{formatearFecha(lote.fechaSiembra)}</dd>
            </div>
          </dl>
        )}

        <label className="form-field">
          <span className="form-field__label">Fecha del escenario</span>
          <input
            type="date"
            value={configuracion.fecha}
            onChange={(e) => onChange({ ...configuracion, fecha: e.target.value })}
          />
        </label>

        <div className="simulador-variables">
          <span className="form-field__label">Variables climáticas</span>
          <p>{PENDIENTE}</p>
        </div>

        <div className="simulador-variables">
          <span className="form-field__label">Variables del cultivo</span>
          <p>{PENDIENTE}</p>
        </div>

        <button
          type="button"
          className="btn btn--primary simulador-panel__accion"
          disabled
          title="El motor de simulación todavía no está disponible"
        >
          <IconPlay />
          Simular escenario
        </button>
        <p className="simulador-panel__nota">
          La simulación se habilitará cuando esté disponible el motor del backend.
        </p>
      </div>
    </section>
  )
}

export default ConfiguracionEscenarioPanel
