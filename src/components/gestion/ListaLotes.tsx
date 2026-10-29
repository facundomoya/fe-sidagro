import type { LoteApi } from '../../types/catalogo'
import { formatearFecha } from '../../utils/format'
import { ESTADO_LOTE, textoSuperficie } from './presentacion'

interface ListaLotesProps {
  lotes: LoteApi[]
  /** El usuario puede completar la fecha de siembra (permiso LOTE_PUT). */
  puedeCompletarSiembra: boolean
  onCompletarSiembra: (lote: LoteApi) => void
}

function SinDato({ texto = 'Sin dato' }: { texto?: string }) {
  return <span className="gestion-item__sin-dato">{texto}</span>
}

function ListaLotes({ lotes, puedeCompletarSiembra, onCompletarSiembra }: ListaLotesProps) {
  return (
    <ul className="gestion-lista">
      {lotes.map((lote) => {
        const estado = ESTADO_LOTE[lote.estado] ?? { texto: lote.estado, clase: 'badge' }
        const superficie = textoSuperficie(lote.superficie)
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
                <dt>Ubicación</dt>
                <dd>{lote.ubicacion || <SinDato />}</dd>
              </div>
              <div>
                <dt>Superficie</dt>
                <dd>{superficie ?? <SinDato />}</dd>
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
            {!lote.fechaSiembra && puedeCompletarSiembra && (
              <button
                type="button"
                className="btn btn--secondary gestion-item__accion"
                onClick={() => onCompletarSiembra(lote)}
              >
                Completar fecha de siembra
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default ListaLotes
