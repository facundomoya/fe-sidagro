import CampoFecha from '../CampoFecha'
import { IconClose, IconRain } from '../icons/Icons'
import { formatearFecha } from '../../utils/format'
import {
  LISTA_VARIABLES,
  MAX_DIAS_CLIMATICOS,
  VARIABLES_CLIMATICAS,
  type CampoDia,
  type DiaClimaticoForm,
  type ErroresEscenario,
} from './escenario'

interface ClimaEscenarioTablaProps {
  dias: DiaClimaticoForm[]
  /** Errores visibles de cada día (solo los de campos ya editados). */
  errores: ErroresEscenario['dias']
  errorSerie?: string
  /** Siembra del lote seleccionado: el clima no puede ser anterior a esta fecha. */
  fechaSiembra: string | null
  onChange: (clave: number, campo: CampoDia, valor: string) => void
  onBlur: (clave: number, campo: CampoDia) => void
  onAgregar: () => void
  onQuitar: (clave: number) => void
}

/** Tabla editable del clima esperado: una fila por día, entre 1 y 7 días. */
function ClimaEscenarioTabla({
  dias,
  errores,
  errorSerie,
  fechaSiembra,
  onChange,
  onBlur,
  onAgregar,
  onQuitar,
}: ClimaEscenarioTablaProps) {
  return (
    <fieldset className="form-field clima-escenario">
      <legend className="form-field__label clima-escenario__titulo">
        <IconRain />
        Clima del escenario *
      </legend>
      <p className="clima-escenario__ayuda">
        Cargá el clima esperado para el lote: de 1 a {MAX_DIAS_CLIMATICOS} días corridos, sin fechas
        repetidas
        {fechaSiembra ? ` y desde la siembra (${formatearFecha(fechaSiembra)}).` : '.'}
      </p>

      <div className="clima-escenario__encabezado" aria-hidden="true">
        <span>Fecha</span>
        {LISTA_VARIABLES.map((variable) => (
          <span key={variable}>
            {VARIABLES_CLIMATICAS[variable].etiqueta} ({VARIABLES_CLIMATICAS[variable].unidad})
          </span>
        ))}
        <span />
      </div>

      <ol className="clima-escenario__dias">
        {dias.map((dia, indice) => {
          const erroresDia = errores[dia.clave] ?? {}
          const numero = indice + 1
          return (
            <li key={dia.clave} className="clima-dia" aria-label={`Día ${numero}`}>
              <span className="clima-dia__numero">Día {numero}</span>

              <label className="clima-dia__campo clima-dia__campo--fecha">
                <span className="clima-dia__etiqueta">Fecha</span>
                <CampoFecha
                  value={dia.fecha}
                  min={fechaSiembra ?? undefined}
                  onChange={(valor) => onChange(dia.clave, 'fecha', valor)}
                  onBlur={() => onBlur(dia.clave, 'fecha')}
                  invalid={!!erroresDia.fecha}
                  aria-label={`Fecha del día ${numero}`}
                />
                {erroresDia.fecha && <span className="form-field__error">{erroresDia.fecha}</span>}
              </label>

              {LISTA_VARIABLES.map((variable) => {
                const { etiqueta, unidad, min, max } = VARIABLES_CLIMATICAS[variable]
                return (
                  <label key={variable} className={`clima-dia__campo clima-dia__campo--${variable}`}>
                    <span className="clima-dia__etiqueta">
                      {etiqueta} ({unidad})
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min={min}
                      max={max}
                      value={dia[variable]}
                      onChange={(e) => onChange(dia.clave, variable, e.target.value)}
                      onBlur={() => onBlur(dia.clave, variable)}
                      aria-invalid={!!erroresDia[variable]}
                      aria-label={`${etiqueta} (${unidad}) del día ${numero}`}
                    />
                    {erroresDia[variable] && (
                      <span className="form-field__error">{erroresDia[variable]}</span>
                    )}
                  </label>
                )
              })}

              <button
                type="button"
                className="clima-dia__quitar"
                onClick={() => onQuitar(dia.clave)}
                disabled={dias.length === 1}
                aria-label={`Quitar el día ${numero}`}
                title="Quitar día"
              >
                <IconClose />
              </button>
            </li>
          )
        })}
      </ol>

      {errorSerie && <span className="form-field__error">{errorSerie}</span>}

      <div className="clima-escenario__pie">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onAgregar}
          disabled={dias.length >= MAX_DIAS_CLIMATICOS}
        >
          Agregar día
        </button>
        <span>
          {dias.length} de {MAX_DIAS_CLIMATICOS} días
        </span>
      </div>
    </fieldset>
  )
}

export default ClimaEscenarioTabla
