import { reportesApi } from '../services/reportesApi';
import type { ReporteFiltros, SesionResumen } from '../types';

/**
 * Recupera todas las sesiones según filtros ignorando la paginación visual.
 * Itera skip hasta alcanzar total o tope defensivo.
 */
export async function fetchAllReportes(filtros: ReporteFiltros = {}): Promise<SesionResumen[]> {
  const limitPorLote = 100; // usar límite máximo permitido
  let skip = 0;
  let total = 0;
  const acumulado: SesionResumen[] = [];
  const topeMaximo = 5000; // defensa para evitar bucles excesivos

  while (true) {
    const resp = await reportesApi.getReportes({ ...filtros, skip, limit: limitPorLote });
    if (skip === 0) total = resp.total;
    acumulado.push(...resp.sesiones);
    skip += limitPorLote;
    if (acumulado.length >= total || acumulado.length >= topeMaximo || resp.sesiones.length === 0) {
      break;
    }
  }

  // Orden descendente por fecha_inicio (más recientes primero) para consistencia con la vista y export
  return acumulado.sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime());
}
