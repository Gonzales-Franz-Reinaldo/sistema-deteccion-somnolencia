import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

interface ExportPdfOptions {
  sesiones: SesionResumen[];
  fileName?: string;
  filtrosInfo?: string;
}

export function exportToPDF({ sesiones, fileName = 'reportes_somnolencia', filtrosInfo }: ExportPdfOptions) {
  if (!sesiones || sesiones.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14);
  doc.text('Reportes de Somnolencia', 14, 14);
  doc.setFontSize(9);
  if (filtrosInfo) {
    doc.text(filtrosInfo, 14, 20);
  }
  doc.text(`Total sesiones: ${sesiones.length}`, 14, filtrosInfo ? 26 : 20);

  const headers = [[
    'Chofer','Empresa','Fecha Inicio','Fecha Fin','Micro.','Bost.','Parp.','Cab.','Frot.','Total','Nivel'
  ]];

  const body = sesiones.map(s => [
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

  autoTable(doc, {
    head: headers,
    body,
    startY: filtrosInfo ? 30 : 24,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [240,240,240], textColor: 30 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 28 },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { cellWidth: 12 },
      5: { cellWidth: 12 },
      6: { cellWidth: 12 },
      7: { cellWidth: 12 },
      8: { cellWidth: 12 },
      9: { cellWidth: 14 },
      10: { cellWidth: 16 }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 10) {
        const nivel = data.cell.raw as string;
        let fill: number[] | undefined;
        if (nivel === 'normal') fill = [205, 240, 205];
        else if (nivel === 'alerta') fill = [255, 245, 190];
        else if (nivel === 'critico') fill = [255, 200, 200];
        if (fill) {
          const { x, y } = data.cell;
          const w = data.cell.width;
          const h = data.cell.height;
          doc.setFillColor(fill[0], fill[1], fill[2]);
          doc.rect(x, y, w, h, 'F');
          doc.text(String(nivel), x + 2, y + h / 2 + 2, { baseline: 'middle' });
        }
      }
    }
  });

  const stamp = new Date().toISOString().replace(/[:T]/g,'-').split('.')[0];
  doc.save(`${fileName}_${stamp}.pdf`);
}
