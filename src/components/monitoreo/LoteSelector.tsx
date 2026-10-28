import type { LoteApi } from '../../types/catalogo'
import { formatearFecha } from '../../utils/format'

interface LoteSelectorProps {
  lotes: LoteApi[]
  loteSeleccionadoId: number | null
  onChange: (loteId: number) => void
  disabled?: boolean
}

function LoteSelector({ lotes, loteSeleccionadoId, onChange, disabled }: LoteSelectorProps) {
  const lote = lotes.find((l) => l.id === loteSeleccionadoId)
  const provincias = [...new Set(lotes.map((l) => l.provincia.nombre))]

  return (
    <section className="card lote-selector">
      <label className="lote-selector__field">
        <span>Lote</span>
        <select
          value={loteSeleccionadoId ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
        >
          {provincias.map((provincia) => (
            <optgroup key={provincia} label={provincia}>
              {lotes
                .filter((l) => l.provincia.nombre === provincia)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                    {!l.fechaSiembra && ' (sin fecha de siembra)'}
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
            <dd>{lote.provincia.nombre}</dd>
          </div>
          <div>
            <dt>Campaña</dt>
            <dd>{lote.campania.nombre}</dd>
          </div>
          <div>
            <dt>Fecha de siembra</dt>
            <dd>
              {lote.fechaSiembra ? (
                formatearFecha(lote.fechaSiembra)
              ) : (
                <span className="badge badge--warning">Sin cargar</span>
              )}
            </dd>
          </div>
          {lote.estado === 'INACTIVO' && (
            <div>
              <dt>Estado</dt>
              <dd>
                <span className="badge badge--danger">Inactivo</span>
              </dd>
            </div>
          )}
        </dl>
      )}
    </section>
  )
}

export default LoteSelector
