import * as XLSX from 'xlsx';
import type { SesionResumen } from '../types';

function formatFecha(fecha?: string): string {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const MM = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}`;
}

interface ExportExcelOptions {
  sesiones: SesionResumen[];
  fileName?: string;
}

export function exportToExcel({ sesiones, fileName = 'reportes_somnolencia' }: ExportExcelOptions) {
  if (!sesiones || sesiones.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  const header = [
    'Chofer','Empresa','Fecha Inicio','Fecha Fin','Micro.','Bost.','Parp.','Cab.','Frot.','Total','Nivel'
  ];

  const rows = sesiones.map(s => [
    s.nombre_chofer,
    s.empresa,
    formatFecha(s.fecha_inicio),
    s.fecha_fin ? formatFecha(s.fecha_fin) : '',
    s.total_microsueno,
    s.total_bostezos,
    s.total_parpadeos_excesivos,
    s.total_cabeceos,
    s.total_frotamiento_ojos,
    s.total_alertas,
    s.nivel_alerta
  ]);

  // Fila resumen
  const resumen = [
    'TOTAL','','','','', '', '', '', '',
    rows.reduce((acc,r)=> acc + (Number(r[9])||0),0),
    ''
  ];

  const data = [header, ...rows, resumen];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Ajustar ancho columnas
  const colWidths = header.map((_h,i) => {
    const maxLen = Math.max(
      header[i].length,
      ...rows.map(r => String(r[i] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 30) };
  });
  (ws as any)['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
  const stamp = new Date().toISOString().replace(/[:T]/g,'-').split('.')[0];
  XLSX.writeFile(wb, `${fileName}_${stamp}.xlsx`);
}
