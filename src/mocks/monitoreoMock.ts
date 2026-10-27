// DATOS SIMULADOS: valores ilustrativos para desarrollar la interfaz.
// No representan resultados reales ni validados del sistema.
import type { Lote, MonitoreoLote, ResultadoAnalisis } from '../types/monitoreo'

export const LOTES_MOCK: Lote[] = [
  { id: 'sl-01', nombre: 'Lote El Algarrobo', provincia: 'San Luis', fechaSiembra: '2025-11-18' },
  { id: 'sl-02', nombre: 'Lote Las Totoras', provincia: 'San Luis', fechaSiembra: '2025-12-02' },
  { id: 'se-01', nombre: 'Lote La Florida', provincia: 'Santiago del Estero', fechaSiembra: '2025-12-10' },
  { id: 'se-02', nombre: 'Lote Monte Quemado', provincia: 'Santiago del Estero', fechaSiembra: '2025-12-20' },
]

export const MONITOREO_MOCK: MonitoreoLote[] = [
  {
    loteId: 'sl-01',
    indicadores: { gdd: 612.4, gdda: 18.7, etapaFenologica: 'R2', descripcionEtapa: 'Floración plena', riesgo: 'Alto' },
    proximoMonitoreo: '2026-02-12',
    clima: { temperatura: 26.4, temperaturaMax: 29.3, temperaturaMin: 18.7, lluvia: 0, humedad: 68, vientoVelocidad: 9.2, vientoDireccion: 'NE' },
  },
  {
    loteId: 'sl-02',
    indicadores: { gdd: 498.1, gdda: 17.2, etapaFenologica: 'R1', descripcionEtapa: 'Inicio de floración', riesgo: 'Medio' },
    proximoMonitoreo: '2026-02-16',
    clima: { temperatura: 24.8, temperaturaMax: 28.1, temperaturaMin: 17.5, lluvia: 4.2, humedad: 72, vientoVelocidad: 12.5, vientoDireccion: 'N' },
  },
  {
    loteId: 'se-01',
    indicadores: { gdd: 455.6, gdda: 21.3, etapaFenologica: 'V6', descripcionEtapa: 'Sexto nudo', riesgo: 'Bajo' },
    proximoMonitoreo: '2026-02-20',
    clima: { temperatura: 31.2, temperaturaMax: 34.6, temperaturaMin: 21.9, lluvia: 0, humedad: 55, vientoVelocidad: 7.8, vientoDireccion: 'SE' },
  },
  {
    loteId: 'se-02',
    indicadores: { gdd: 389.9, gdda: 20.8, etapaFenologica: 'V4', descripcionEtapa: 'Cuarto nudo', riesgo: 'Bajo' },
    proximoMonitoreo: '2026-02-23',
    clima: { temperatura: 30.5, temperaturaMax: 33.9, temperaturaMin: 22.4, lluvia: 12.6, humedad: 61, vientoVelocidad: 15.1, vientoDireccion: 'S' },
  },
]

// Secuencia de resultados que devuelve "Ejecutar nuevo análisis" para cada lote, en orden cíclico.
// Son valores predefinidos: no se calculan ni dependen de las observaciones registradas.
export const RESULTADOS_ANALISIS_MOCK: Record<string, ResultadoAnalisis[]> = {
  'sl-01': [
    {
      indicadores: { gdd: 648.9, gdda: 18.2, etapaFenologica: 'R2', descripcionEtapa: 'Floración plena', riesgo: 'Alto' },
      proximoMonitoreo: '2026-02-14',
    },
    {
      indicadores: { gdd: 701.3, gdda: 19.1, etapaFenologica: 'R3', descripcionEtapa: 'Inicio de formación de vainas', riesgo: 'Alto' },
      proximoMonitoreo: '2026-02-17',
    },
    {
      indicadores: { gdd: 756.0, gdda: 17.6, etapaFenologica: 'R3', descripcionEtapa: 'Inicio de formación de vainas', riesgo: 'Medio' },
      proximoMonitoreo: '2026-02-21',
    },
  ],
  'sl-02': [
    {
      indicadores: { gdd: 531.7, gdda: 16.8, etapaFenologica: 'R1', descripcionEtapa: 'Inicio de floración', riesgo: 'Medio' },
      proximoMonitoreo: '2026-02-18',
    },
    {
      indicadores: { gdd: 579.4, gdda: 17.9, etapaFenologica: 'R2', descripcionEtapa: 'Floración plena', riesgo: 'Alto' },
      proximoMonitoreo: '2026-02-20',
    },
    {
      indicadores: { gdd: 622.5, gdda: 16.4, etapaFenologica: 'R2', descripcionEtapa: 'Floración plena', riesgo: 'Medio' },
      proximoMonitoreo: '2026-02-24',
    },
  ],
  'se-01': [
    {
      indicadores: { gdd: 492.8, gdda: 21.9, etapaFenologica: 'V7', descripcionEtapa: 'Séptimo nudo', riesgo: 'Bajo' },
      proximoMonitoreo: '2026-02-22',
    },
    {
      indicadores: { gdd: 547.2, gdda: 22.4, etapaFenologica: 'R1', descripcionEtapa: 'Inicio de floración', riesgo: 'Medio' },
      proximoMonitoreo: '2026-02-24',
    },
    {
      indicadores: { gdd: 598.6, gdda: 21.1, etapaFenologica: 'R2', descripcionEtapa: 'Floración plena', riesgo: 'Alto' },
      proximoMonitoreo: '2026-02-26',
    },
  ],
  'se-02': [
    {
      indicadores: { gdd: 421.3, gdda: 20.5, etapaFenologica: 'V5', descripcionEtapa: 'Quinto nudo', riesgo: 'Bajo' },
      proximoMonitoreo: '2026-02-25',
    },
    {
      indicadores: { gdd: 468.0, gdda: 21.7, etapaFenologica: 'V6', descripcionEtapa: 'Sexto nudo', riesgo: 'Bajo' },
      proximoMonitoreo: '2026-02-27',
    },
    {
      indicadores: { gdd: 515.9, gdda: 22.2, etapaFenologica: 'R1', descripcionEtapa: 'Inicio de floración', riesgo: 'Medio' },
      proximoMonitoreo: '2026-03-02',
    },
  ],
}
