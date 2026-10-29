import type { LoteEconomicoApi } from '../../types/economico'
import {
  presentacionResultado,
  signoDe,
  textoFaltantes,
  textoHectareas,
  textoRendimiento,
  textoUsd,
} from './formato'

interface ListaLotesEconomicosProps {
  lotes: LoteEconomicoApi[]
  onSeleccionar: (lote: LoteEconomicoApi) => void
}

function SinDato({ texto = 'Sin dato' }: { texto?: string }) {
  return <span className="economico-lotes__sin-dato">{texto}</span>
}

/** Importe con signo; el signo y el color se ven juntos. */
function Importe({ valor, unidad }: { valor: number; unidad: string }) {
  return (
    <span className={`economico-importe economico-importe--${signoDe(valor)}`}>
      {textoUsd(valor, unidad)}
    </span>
  )
}

function ListaLotesEconomicos({ lotes, onSeleccionar }: ListaLotesEconomicosProps) {
  return (
    <>
      <div className="economico-lotes__encabezado" aria-hidden="true">
        <span>Lote</span>
        <span>Campaña</span>
        <span>Provincia</span>
        <span>Superficie</span>
        <span>Rendimiento</span>
        <span>Resultado por ha</span>
        <span>Resultado total</span>
        <span>Resultado</span>
      </div>
      <ul className="economico-lotes__lista">
        {lotes.map((item) => (
          <FilaLote key={item.lote.id} item={item} onSeleccionar={onSeleccionar} />
        ))}
      </ul>
    </>
  )
}

interface FilaLoteProps {
  item: LoteEconomicoApi
  onSeleccionar: (lote: LoteEconomicoApi) => void
}

function FilaLote({ item, onSeleccionar }: FilaLoteProps) {
  const { lote, indicadores, faltantes } = item
  const resultado = indicadores ? presentacionResultado(indicadores.resultado) : null

  return (
    <li>
      <button
        type="button"
        className={`economico-lotes__fila${indicadores ? '' : ' economico-lotes__fila--incompleta'}`}
        onClick={() => onSeleccionar(item)}
        aria-haspopup="dialog"
      >
        <span className="economico-lotes__celda economico-lotes__celda--lote">
          <strong>{lote.nombre}</strong>
        </span>
        <span className="economico-lotes__celda">
          <span className="economico-lotes__etiqueta">Campaña</span>
          {lote.campania ?? <SinDato />}
        </span>
        <span className="economico-lotes__celda">
          <span className="economico-lotes__etiqueta">Provincia</span>
          {lote.provincia ?? <SinDato />}
        </span>
        <span className="economico-lotes__celda">
          <span className="economico-lotes__etiqueta">Superficie</span>
          {lote.superficie === null ? <SinDato /> : textoHectareas(lote.superficie)}
        </span>
        <span className="economico-lotes__celda">
          <span className="economico-lotes__etiqueta">Rendimiento</span>
          {lote.rendimiento === null ? <SinDato /> : textoRendimiento(lote.rendimiento)}
        </span>
        <span className="economico-lotes__celda">
          <span className="economico-lotes__etiqueta">Resultado por ha</span>
          {indicadores ? (
            <Importe valor={indicadores.gananciaPorHectarea} unidad="USD/ha" />
          ) : (
            <SinDato texto="No calculado" />
          )}
        </span>
        <span className="economico-lotes__celda">
          <span className="economico-lotes__etiqueta">Resultado total</span>
          {indicadores ? (
            <Importe valor={indicadores.gananciaTotal} unidad="USD" />
          ) : (
            <SinDato texto="No calculado" />
          )}
        </span>
        <span className="economico-lotes__celda economico-lotes__celda--resultado">
          {resultado ? (
            <span className={resultado.clase}>
              <span aria-hidden="true">{resultado.simbolo} </span>
              {resultado.texto}
            </span>
          ) : (
            <>
              <span className="badge badge--warning">⚠ Datos incompletos</span>
              <span className="economico-lotes__faltan">Falta: {textoFaltantes(faltantes)}</span>
            </>
          )}
        </span>
      </button>
    </li>
  )
}

export default ListaLotesEconomicos
