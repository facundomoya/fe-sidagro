import type { CampaniaApi, ProvinciaApi } from '../../types/catalogo'
import type { ErrorCarga } from '../monitoreo/errores'

/** Valor de los selectores; '' es «Todas» y no se envía al backend. */
export interface ValoresFiltros {
  campaniaId: string
  provinciaId: string
}

export const TODAS = ''

interface FiltrosDashboardProps {
  valores: ValoresFiltros
  /** null mientras se cargan las opciones. */
  campanias: CampaniaApi[] | null
  provincias: ProvinciaApi[] | null
  errorOpciones: ErrorCarga | null
  onChange: (valores: ValoresFiltros) => void
  onReintentarOpciones: () => void
}

function FiltrosDashboard({
  valores,
  campanias,
  provincias,
  errorOpciones,
  onChange,
  onReintentarOpciones,
}: FiltrosDashboardProps) {
  // Sin opciones solo queda disponible «Todas».
  const sinOpciones = !campanias || !provincias

  return (
    <div className="card economico-filtros">
      <label className="form-field">
        <span className="form-field__label">Campaña</span>
        <select
          value={valores.campaniaId}
          onChange={(e) => onChange({ ...valores, campaniaId: e.target.value })}
          disabled={sinOpciones}
        >
          <option value={TODAS}>Todas</option>
          {campanias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span className="form-field__label">Provincia</span>
        <select
          value={valores.provinciaId}
          onChange={(e) => onChange({ ...valores, provinciaId: e.target.value })}
          disabled={sinOpciones}
        >
          <option value={TODAS}>Todas</option>
          {provincias?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>
      {errorOpciones ? (
        <p className="economico-filtros__aviso" role="alert">
          No se pudieron cargar las opciones de los filtros: {errorOpciones.mensaje}{' '}
          {errorOpciones.reintentable && (
            <button type="button" className="economico-filtros__reintentar" onClick={onReintentarOpciones}>
              Reintentar
            </button>
          )}
        </p>
      ) : (
        sinOpciones && <p className="economico-filtros__aviso">Cargando opciones de los filtros...</p>
      )}
    </div>
  )
}

export default FiltrosDashboard
