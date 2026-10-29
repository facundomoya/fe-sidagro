// Permisos del backend (ValidPermissions) que usa el frontend para mostrar u ocultar acciones.
// El backend vuelve a controlarlos en cada petición.
export const PERMISOS = {
  consultarCatalogo: 'AGRO_PARAM_GET',
  crearCampania: 'CAMPANIA_POST',
  crearLote: 'LOTE_POST',
  modificarLote: 'LOTE_PUT',
  consultarMonitoreo: 'MONITOREO_GET',
  consultarEconomico: 'ECONOMICO_GET',
  registrarCosto: 'COSTO_POST',
} as const
