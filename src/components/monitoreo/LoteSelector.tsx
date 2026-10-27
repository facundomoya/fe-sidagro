import type { Lote } from '../../types/monitoreo'
import { formatearFecha } from '../../utils/format'

interface LoteSelectorProps {
  lotes: Lote[]
  loteSeleccionadoId: string
  onChange: (loteId: string) => void
  disabled?: boolean
}

function LoteSelector({ lotes, loteSeleccionadoId, onChange, disabled }: LoteSelectorProps) {
  const lote = lotes.find((l) => l.id === loteSeleccionadoId)
  const provincias = [...new Set(lotes.map((l) => l.provincia))]

  return (
    <section className="card lote-selector">
      <label className="lote-selector__field">
        <span>Lote</span>
        <select
          value={loteSeleccionadoId}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
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
        <dl className="lote-selector__info">
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
    </section>
  )
}

export default LoteSelector
