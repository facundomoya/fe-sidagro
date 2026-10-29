import { useRef, useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import type { EtapaFenologicaApi, LoteApi } from '../../types/catalogo'
import type { NuevaSimulacionApi } from '../../types/simulacionApi'
import { fechaHoyIso, formatearFecha } from '../../utils/format'
import { IconPlay, IconSliders } from '../icons/Icons'
import ClimaEscenarioTabla from './ClimaEscenarioTabla'
import { formatearDecimal } from './presentacion'
import { esFechaIsoValida } from '../../utils/fechas'
import {
  ANTES_DE_SIEMBRA,
  FECHA_REPETIDA,
  LISTA_VARIABLES,
  LOTE_SIN_SIEMBRA,
  MAX_DIAS_CLIMATICOS,
  MAX_OBSERVACIONES,
  NIVELES_RIESGO,
  construirSimulacion,
  contarErrores,
  nuevoDia,
  ordenarDias,
  sumarDias,
  ultimaFecha,
  validarEscenario,
  type CampoDia,
  type ErroresEscenario,
  type ValoresEscenario,
} from './escenario'

interface ConfiguracionEscenarioPanelProps {
  /** Lotes activos, los únicos que se pueden simular. */
  lotes: LoteApi[]
  etapas: EtapaFenologicaApi[]
  /** Hay una simulación o un reintento en curso: el formulario queda bloqueado. */
  procesando: boolean
  /** Error al crear la simulación; los datos cargados se conservan para corregir o reintentar. */
  error: string | null
  onSimular: (simulacion: NuevaSimulacionApi) => void
}

type CampoGeneral = 'loteId' | 'etapaId' | 'riesgoObservado' | 'observaciones'

const claveDia = (clave: number, campo: CampoDia) => `dia-${clave}-${campo}`

/**
 * Deja solo los errores de los campos que el usuario ya editó. Una fecha repetida
 * se marca en todas las filas involucradas, aunque alguna no se haya editado. Los
 * problemas con la fecha de siembra se muestran siempre, porque pueden aparecer al
 * cambiar de lote sin tocar las fechas.
 */
function erroresVisibles(errores: ErroresEscenario, tocados: Set<string>): ErroresEscenario {
  const visibles: ErroresEscenario = { dias: {}, serie: errores.serie }
  for (const campo of ['loteId', 'etapaId', 'riesgoObservado', 'observaciones'] as const) {
    if (tocados.has(campo)) visibles[campo] = errores[campo]
  }
  if (errores.loteId === LOTE_SIN_SIEMBRA) visibles.loteId = errores.loteId
  for (const [clave, erroresDia] of Object.entries(errores.dias)) {
    const filtrados = Object.fromEntries(
      Object.entries(erroresDia).filter(
        ([campo, error]) =>
          error === FECHA_REPETIDA ||
          error?.startsWith(ANTES_DE_SIEMBRA) ||
          tocados.has(claveDia(Number(clave), campo as CampoDia)),
      ),
    )
    visibles.dias[Number(clave)] = filtrados
  }
  return visibles
}

function ConfiguracionEscenarioPanel({
  lotes,
  etapas,
  procesando,
  error,
  onSimular,
}: ConfiguracionEscenarioPanelProps) {
  const [valores, setValores] = useState<ValoresEscenario>(() => ({
    loteId: lotes[0] ? String(lotes[0].id) : '',
    etapaId: '',
    riesgoObservado: '',
    observaciones: '',
    dias: [nuevoDia(0, fechaHoyIso())],
  }))
  const [tocados, setTocados] = useState<Set<string>>(() => new Set())
  const siguienteClave = useRef(1)

  const lote = lotes.find((l) => String(l.id) === valores.loteId)
  const errores = validarEscenario(valores, lote?.fechaSiembra)
  const visibles = erroresVisibles(errores, tocados)
  const pendientes = contarErrores(errores)

  const etapa = etapas.find((e) => String(e.id) === valores.etapaId)
  const provincias = [...new Set(lotes.map((l) => l.provincia.nombre))]

  function marcarTocado(clave: string) {
    setTocados((prev) => (prev.has(clave) ? prev : new Set(prev).add(clave)))
  }

  function actualizar<K extends CampoGeneral>(campo: K, valor: ValoresEscenario[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }))
  }

  function actualizarDia(clave: number, campo: CampoDia, valor: string) {
    setValores((prev) => ({
      ...prev,
      dias: prev.dias.map((d) => (d.clave === clave ? { ...d, [campo]: valor } : d)),
    }))
    // Una fecha completa se valida apenas cambia; mientras se escribe, recién al salir del campo.
    if (campo === 'fecha' && esFechaIsoValida(valor)) marcarTocado(claveDia(clave, campo))
  }

  function salirDeCampoDia(clave: number, campo: CampoDia) {
    marcarTocado(claveDia(clave, campo))
    // Se reordena al salir de la fecha y no mientras se escribe, para no mover la fila
    // (y perder el foco) en medio de la edición.
    if (campo === 'fecha') setValores((prev) => ({ ...prev, dias: ordenarDias(prev.dias) }))
  }

  function agregarDia() {
    if (valores.dias.length >= MAX_DIAS_CLIMATICOS) return
    const ultima = ultimaFecha(valores.dias)
    const dia = nuevoDia(siguienteClave.current++, ultima ? sumarDias(ultima, 1) : fechaHoyIso())
    setValores((prev) => ({ ...prev, dias: ordenarDias([...prev.dias, dia]) }))
  }

  function quitarDia(clave: number) {
    setValores((prev) =>
      prev.dias.length > 1 ? { ...prev, dias: prev.dias.filter((d) => d.clave !== clave) } : prev,
    )
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (procesando) return
    // Se vuelve a validar con el lote seleccionado justo antes de enviar.
    const erroresFinales = validarEscenario(valores, lote?.fechaSiembra)
    if (contarErrores(erroresFinales) > 0) {
      // Se muestran todos los errores para que se vea qué corregir.
      const campos: string[] = ['loteId', 'etapaId', 'riesgoObservado', 'observaciones']
      for (const dia of valores.dias) {
        for (const campo of ['fecha', ...LISTA_VARIABLES] as CampoDia[]) campos.push(claveDia(dia.clave, campo))
      }
      setTocados((prev) => new Set([...prev, ...campos]))
      return
    }
    onSimular(construirSimulacion(valores))
  }

  return (
    <section className="card section-card simulador-panel simulador-panel--configuracion">
      <h2 className="simulador-panel__title">
        <IconSliders />
        Configuración del escenario
      </h2>

      <form className="form" onSubmit={handleSubmit} noValidate aria-busy={procesando}>
        <fieldset className="simulador-form__campos" disabled={procesando}>
          <label className="form-field">
            <span className="form-field__label">Lote *</span>
            <select
              value={valores.loteId}
              onChange={(e) => {
                actualizar('loteId', e.target.value)
                marcarTocado('loteId')
              }}
              aria-invalid={!!visibles.loteId}
            >
              {provincias.map((provincia) => (
                <optgroup key={provincia} label={provincia}>
                  {lotes
                    .filter((l) => l.provincia.nombre === provincia)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nombre}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            {visibles.loteId && <span className="form-field__error">{visibles.loteId}</span>}
          </label>

          {lote && (
            <dl className="simulador-datos">
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
                <dd>{lote.fechaSiembra ? formatearFecha(lote.fechaSiembra) : 'Sin cargar'}</dd>
              </div>
            </dl>
          )}

          <label className="form-field">
            <span className="form-field__label">Etapa fenológica *</span>
            <select
              value={valores.etapaId}
              onChange={(e) => {
                actualizar('etapaId', e.target.value)
                marcarTocado('etapaId')
              }}
              onBlur={() => marcarTocado('etapaId')}
              aria-invalid={!!visibles.etapaId}
            >
              <option value="" disabled>
                Seleccioná la etapa del cultivo
              </option>
              {etapas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
            {visibles.etapaId && <span className="form-field__error">{visibles.etapaId}</span>}
          </label>

          {etapa && (
            <dl className="simulador-datos">
              <div>
                <dt>GDDA de la etapa</dt>
                <dd>
                  {formatearDecimal(etapa.gddaMinimo, 0)} a {formatearDecimal(etapa.gddaMaximo, 0)} °C día
                </dd>
              </div>
              <div>
                <dt>Riesgo base</dt>
                <dd>{etapa.riesgoChinche}</dd>
              </div>
              <div>
                <dt>Monitoreo</dt>
                <dd>{etapa.frecuenciaMonitoreo}</dd>
              </div>
            </dl>
          )}

          <label className="form-field">
            <span className="form-field__label">Riesgo de chinche observado *</span>
            <select
              value={valores.riesgoObservado}
              onChange={(e) => {
                actualizar('riesgoObservado', e.target.value as ValoresEscenario['riesgoObservado'])
                marcarTocado('riesgoObservado')
              }}
              onBlur={() => marcarTocado('riesgoObservado')}
              aria-invalid={!!visibles.riesgoObservado}
            >
              <option value="" disabled>
                Seleccioná el nivel observado
              </option>
              {NIVELES_RIESGO.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>
            {visibles.riesgoObservado && (
              <span className="form-field__error">{visibles.riesgoObservado}</span>
            )}
          </label>

          <label className="form-field">
            <span className="form-field__label">Observaciones</span>
            <textarea
              rows={3}
              maxLength={MAX_OBSERVACIONES}
              value={valores.observaciones}
              onChange={(e) => actualizar('observaciones', e.target.value)}
              onBlur={() => marcarTocado('observaciones')}
              placeholder="Por ejemplo: chinches adultas en el borde del lote (opcional)"
              aria-invalid={!!visibles.observaciones}
            />
            <span className="form-field__hint">
              {valores.observaciones.length}/{MAX_OBSERVACIONES}
            </span>
            {visibles.observaciones && (
              <span className="form-field__error">{visibles.observaciones}</span>
            )}
          </label>

          <ClimaEscenarioTabla
            dias={valores.dias}
            errores={visibles.dias}
            errorSerie={visibles.serie}
            fechaSiembra={lote?.fechaSiembra ?? null}
            onChange={actualizarDia}
            onBlur={salirDeCampoDia}
            onAgregar={agregarDia}
            onQuitar={quitarDia}
          />

          <p
            className={`simulador-estado${pendientes === 0 ? ' simulador-estado--completo' : ''}`}
            role="status"
          >
            {pendientes === 0
              ? 'El escenario está completo y es válido.'
              : `Faltan completar o corregir ${pendientes} ${pendientes === 1 ? 'dato' : 'datos'}.`}
          </p>
        </fieldset>

        {error && <StatusMessage type="error" message={error} />}

        <button
          type="submit"
          className="btn btn--primary simulador-panel__accion"
          disabled={procesando || pendientes > 0}
          aria-describedby="simulador-nota"
        >
          {procesando ? (
            <span className="btn__spinner simulador-panel__spinner" aria-hidden="true" />
          ) : (
            <IconPlay />
          )}
          {procesando ? 'Simulando...' : 'Simular escenario'}
        </button>
        <p id="simulador-nota" className="simulador-panel__nota">
          {procesando
            ? 'El formulario queda bloqueado hasta que termine el proceso.'
            : pendientes > 0
              ? 'Completá el escenario para habilitar la simulación.'
              : 'Se guardará el escenario y se generará una recomendación.'}
        </p>
      </form>
    </section>
  )
}

export default ConfiguracionEscenarioPanel
