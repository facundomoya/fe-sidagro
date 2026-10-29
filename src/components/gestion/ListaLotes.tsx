import type { LoteApi } from '../../types/catalogo'
import { formatearFecha } from '../../utils/format'
import { ESTADO_LOTE, SIN_DEPARTAMENTO, textoRendimiento, textoSuperficie } from './presentacion'

interface ListaLotesProps {
  lotes: LoteApi[]
  /** El usuario puede completar la fecha de siembra (permiso LOTE_PUT). */
  puedeCompletarSiembra: boolean
  onCompletarSiembra: (lote: LoteApi) => void
  /** El usuario puede completar superficie y rendimiento (permiso LOTE_PUT). */
  puedeCompletarDatos: boolean
  onCompletarDatos: (lote: LoteApi) => void
  /** El usuario puede asignar el departamento a lotes que no tienen (permiso LOTE_PUT). */
  puedeCompletarDepartamento: boolean
  onCompletarDepartamento: (lote: LoteApi) => void
}

function SinDato({ texto = 'Sin dato' }: { texto?: string }) {
  return <span className="gestion-item__sin-dato">{texto}</span>
}

function ListaLotes({
  lotes,
  puedeCompletarSiembra,
  onCompletarSiembra,
  puedeCompletarDatos,
  onCompletarDatos,
  puedeCompletarDepartamento,
  onCompletarDepartamento,
}: ListaLotesProps) {
  return (
    <ul className="gestion-lista">
      {lotes.map((lote) => {
        const estado = ESTADO_LOTE[lote.estado] ?? { texto: lote.estado, clase: 'badge' }
        const superficie = textoSuperficie(lote.superficie)
        const rendimiento = textoRendimiento(lote.rendimiento)
        const faltanDatos = lote.superficie === null || lote.rendimiento === null
        const completarSiembra = !lote.fechaSiembra && puedeCompletarSiembra
        const completarDatos = faltanDatos && puedeCompletarDatos
        // Los lotes creados antes de incorporar los departamentos no tienen uno.
        const completarDepartamento = !lote.departamento && puedeCompletarDepartamento
        return (
          <li
            key={lote.id}
            className={`card gestion-item${lote.fechaSiembra ? '' : ' gestion-item--pendiente'}`}
          >
            <div className="gestion-item__encabezado">
              <h3>{lote.nombre}</h3>
              <span className={estado.clase}>{estado.texto}</span>
            </div>
            <dl className="gestion-item__datos">
              <div>
                <dt>Campaña</dt>
                <dd>{lote.campania.nombre}</dd>
              </div>
              <div>
                <dt>Provincia</dt>
                <dd>{lote.provincia.nombre}</dd>
              </div>
              <div>
                <dt>Departamento</dt>
                <dd>{lote.departamento?.nombre ?? <SinDato texto={SIN_DEPARTAMENTO} />}</dd>
              </div>
              <div>
                <dt>Ubicación</dt>
                <dd>{lote.ubicacion || <SinDato />}</dd>
              </div>
              <div>
                <dt>Superficie</dt>
                <dd>{superficie ?? <SinDato />}</dd>
              </div>
              <div>
                <dt>Rendimiento esperado</dt>
                <dd>{rendimiento ?? <SinDato />}</dd>
              </div>
              <div>
                <dt>Fecha de siembra</dt>
                <dd>
                  {lote.fechaSiembra ? (
                    formatearFecha(lote.fechaSiembra)
                  ) : (
                    <span className="badge badge--warning">Sin fecha de siembra</span>
                  )}
                </dd>
              </div>
            </dl>
            {(completarSiembra || completarDatos || completarDepartamento) && (
              <div className="gestion-item__acciones">
                {completarSiembra && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => onCompletarSiembra(lote)}
                  >
                    Completar fecha de siembra
                  </button>
                )}
                {completarDatos && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => onCompletarDatos(lote)}
                  >
                    Completar datos productivos
                  </button>
                )}
                {completarDepartamento && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => onCompletarDepartamento(lote)}
                  >
                    Completar departamento
                  </button>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default ListaLotes
