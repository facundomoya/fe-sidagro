import type { CampaniaApi } from '../../types/catalogo'
import { formatearFecha } from '../../utils/format'

interface ListaCampaniasProps {
  campanias: CampaniaApi[]
  /** Cantidad de lotes por id de campaña. */
  cantidadLotes: Map<number, number>
}

function ListaCampanias({ campanias, cantidadLotes }: ListaCampaniasProps) {
  return (
    <ul className="gestion-lista">
      {campanias.map((campania) => (
        <li key={campania.id} className="card gestion-item">
          <div className="gestion-item__encabezado">
            <h3>{campania.nombre}</h3>
          </div>
          <dl className="gestion-item__datos">
            <div>
              <dt>Inicio</dt>
              <dd>{formatearFecha(campania.fechaInicio)}</dd>
            </div>
            <div>
              <dt>Finalización</dt>
              <dd>
                {campania.fechaFin ? (
                  formatearFecha(campania.fechaFin)
                ) : (
                  <span className="gestion-item__sin-dato">Sin definir</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Lotes asociados</dt>
              <dd>{cantidadLotes.get(campania.id) ?? 0}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}

export default ListaCampanias
