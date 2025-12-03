/**
 * Utilidades para exportar eventos a Excel y PDF
 */
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EventoConChofer } from '../types';
import { TIPO_EVENTO_LABELS, SEVERIDAD_LABELS } from '../types';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatFecha(fecha: string): string {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function getTimestamp(): string {
  return new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
}

// ═══════════════════════════════════════════════════════════════
// EXPORTAR A EXCEL
// ═══════════════════════════════════════════════════════════════

interface ExportExcelOptions {
  eventos: EventoConChofer[];
  fileName?: string;
  titulo?: string;
}

export function exportEventosToExcel({ 
  eventos, 
  fileName = 'eventos_somnolencia',
  titulo = 'Reporte de Eventos de Somnolencia'
}: ExportExcelOptions): void {
  if (!eventos || eventos.length === 0) {
    throw new Error('No hay eventos para exportar');
  }

  // Encabezados
  const headers = [
    'ID',
    'Fecha/Hora',
    'Chofer',
    'Tipo Evento',
    'Severidad',
    'Duración (s)',
    'Cantidad',
    'Velocidad (km/h)',
    'Latitud',
    'Longitud'
  ];

  // Datos
  const rows = eventos.map(e => [
    e.id_evento,
    formatFecha(e.timestamp_evento),
    e.nombre_chofer || 'Desconocido',
    TIPO_EVENTO_LABELS[e.tipo_evento] || e.tipo_evento,
    e.nivel_severidad ? SEVERIDAD_LABELS[e.nivel_severidad] : '',
    e.duracion_segundos?.toFixed(2) || '',
    e.cantidad_eventos || '',
    e.velocidad_kmh || '',
    e.latitud || '',
    e.longitud || ''
  ]);

  // Crear worksheet
  const data = [
    [titulo],
    [`Generado: ${new Date().toLocaleString('es-ES')}`],
    [`Total eventos: ${eventos.length}`],
    [], // Fila vacía
    headers,
    ...rows
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Ajustar anchos de columna
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map(r => String(r[i] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 30) };
  });
  ws['!cols'] = colWidths;

  // Crear workbook y guardar
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Eventos');
  XLSX.writeFile(wb, `${fileName}_${getTimestamp()}.xlsx`);
}

// ═══════════════════════════════════════════════════════════════
// EXPORTAR A PDF
// ═══════════════════════════════════════════════════════════════

interface ExportPdfOptions {
  eventos: EventoConChofer[];
  fileName?: string;
  titulo?: string;
  filtrosInfo?: string;
}

export function exportEventosToPDF({
  eventos,
  fileName = 'eventos_somnolencia',
  titulo = 'Reporte de Eventos de Somnolencia',
  filtrosInfo
}: ExportPdfOptions): void {
  if (!eventos || eventos.length === 0) {
    throw new Error('No hay eventos para exportar');
  }

  // Crear documento PDF en landscape para más espacio
  const doc = new jsPDF({ orientation: 'landscape' });

  // Título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 14, 15);

  // Subtítulo con fecha
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 22);
  doc.text(`Total eventos: ${eventos.length}`, 14, 28);

  // Filtros aplicados (si hay)
  let startY = 35;
  if (filtrosInfo) {
    doc.setFontSize(9);
    doc.text(`Filtros: ${filtrosInfo}`, 14, startY);
    startY += 7;
  }

  // Encabezados de tabla
  const headers = [
    ['Fecha/Hora', 'Chofer', 'Tipo', 'Severidad', 'Duración', 'Velocidad', 'Ubicación']
  ];

  // Datos de tabla
  const body = eventos.map(e => [
    formatFecha(e.timestamp_evento),
    e.nombre_chofer || 'Desconocido',
    TIPO_EVENTO_LABELS[e.tipo_evento] || e.tipo_evento,
    e.nivel_severidad ? SEVERIDAD_LABELS[e.nivel_severidad] : '-',
    e.duracion_segundos ? `${e.duracion_segundos.toFixed(1)}s` : (e.cantidad_eventos ? `${e.cantidad_eventos}x` : '-'),
    e.velocidad_kmh ? `${e.velocidad_kmh} km/h` : '-',
    e.latitud && e.longitud ? `${e.latitud.toFixed(4)}, ${e.longitud.toFixed(4)}` : '-'
  ]);

  // Generar tabla
  autoTable(doc, {
    head: headers,
    body,
    startY,
    styles: { 
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: { 
      fillColor: [79, 70, 229], // Indigo
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250]
    },
    columnStyles: {
      0: { cellWidth: 40 },  // Fecha
      1: { cellWidth: 45 },  // Chofer
      2: { cellWidth: 35 },  // Tipo
      3: { cellWidth: 25 },  // Severidad
      4: { cellWidth: 22 },  // Duración
      5: { cellWidth: 25 },  // Velocidad
      6: { cellWidth: 45 }   // Ubicación
    },
    // Colorear celdas de severidad
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const severidad = data.cell.raw as string;
        if (severidad === 'Crítico') {
          data.cell.styles.fillColor = [254, 226, 226]; // red-100
          data.cell.styles.textColor = [153, 27, 27];   // red-800
        } else if (severidad === 'Alto') {
          data.cell.styles.fillColor = [255, 237, 213]; // orange-100
          data.cell.styles.textColor = [154, 52, 18];   // orange-800
        } else if (severidad === 'Medio') {
          data.cell.styles.fillColor = [254, 249, 195]; // yellow-100
          data.cell.styles.textColor = [133, 77, 14];   // yellow-800
        }
      }
    }
  });

  // Guardar PDF
  doc.save(`${fileName}_${getTimestamp()}.pdf`);
}

// ═══════════════════════════════════════════════════════════════
// EXPORTAR POR CHOFER (REPORTE INDIVIDUAL)
// ═══════════════════════════════════════════════════════════════

interface ExportChoferOptions {
  eventos: EventoConChofer[];
  nombreChofer: string;
  fileName?: string;
}

export function exportEventosChoferToPDF({
  eventos,
  nombreChofer,
  fileName
}: ExportChoferOptions): void {
  exportEventosToPDF({
    eventos,
    fileName: fileName || `eventos_${nombreChofer.replace(/\s+/g, '_').toLowerCase()}`,
    titulo: `Reporte de Eventos - ${nombreChofer}`,
    filtrosInfo: `Chofer: ${nombreChofer}`
  });
}