import StatCard from '../StatCard'
import { IconDollar, IconGauge, IconSprout } from '../icons/Icons'
import type { CostoProduccionApi, PrecioSojaApi } from '../../types/economico'
import { formatearNumero } from '../../utils/format'
import { textoFecha, textoPesos, textoQuintales, textoRendimiento, textoUsd } from './formato'

interface ReferenciasMercadoProps {
  precio: PrecioSojaApi
  costo: CostoProduccionApi
  /** Calculado por el backend. */
  rendimientoIndiferencia: number
}

function ReferenciasMercado({ precio, costo, rendimientoIndiferencia }: ReferenciasMercadoProps) {
  return (
    <section className="economico-seccion" aria-labelledby="economico-referencias">
      <h2 id="economico-referencias" className="economico-seccion__titulo">
        Referencias del mercado
      </h2>
      <div className="economico-referencias">
        <StatCard
          icon={IconDollar}
          label="Precio de referencia de la soja"
          value={textoUsd(precio.valor, `${precio.moneda}/t`)}
          tone={precio.desactualizado ? 'warning' : 'default'}
          caption={
            <span className="economico-detalle">
              {precio.desactualizado && (
                <span className="badge badge--warning economico-detalle__badge">
                  ⚠ Precio desactualizado
                </span>
              )}
              <span>Cotización del {textoFecha(precio.fecha)}</span>
              <span>Fuente: {precio.fuente}</span>
              {precio.valorPesos !== null && (
                <span>Equivalente: {textoPesos(precio.valorPesos, 'ARS/t')}</span>
              )}
              {precio.tipoCambio !== null && (
                <span>Tipo de cambio: {formatearNumero(precio.tipoCambio, 2)} ARS por USD</span>
              )}
            </span>
          }
        />
        <StatCard
          icon={IconGauge}
          label="Costo de producción vigente"
          value={textoUsd(costo.costoPorHectarea, 'USD/ha')}
          caption={
            <span className="economico-detalle">
              <span>Vigente desde el {textoFecha(costo.vigenciaDesde)}</span>
              {costo.fuente && <span>Fuente: {costo.fuente}</span>}
            </span>
          }
        />
        <StatCard
          icon={IconSprout}
          label="Rendimiento de indiferencia"
          value={textoRendimiento(rendimientoIndiferencia)}
          caption={
            <span className="economico-detalle">
              <span>Equivale a {textoQuintales(rendimientoIndiferencia)} (1 t = 10 qq).</span>
              <span>Rendimiento necesario para cubrir el costo con el precio actual.</span>
            </span>
          }
        />
      </div>
    </section>
  )
}

export default ReferenciasMercado
