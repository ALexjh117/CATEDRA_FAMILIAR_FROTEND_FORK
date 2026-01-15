import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Exportar datos a Excel
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Datos') {
  // Crear un libro de trabajo
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generar archivo y descargarlo
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Exportar datos a PDF
export function exportToPDF(
  data: any[],
  filename: string,
  title: string,
  columns: { header: string; dataKey: string }[]
) {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Fecha del reporte
  doc.setFontSize(11);
  doc.setTextColor(100);
  const today = new Date().toLocaleDateString('es-ES');
  doc.text(`Generado: ${today}`, 14, 30);

  // Tabla
  autoTable(doc, {
    startY: 35,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey] || '-')),
    theme: 'striped',
    headStyles: { fillColor: [14, 116, 144] }, // Color teal
    styles: { fontSize: 10 },
  });

  // Guardar PDF
  doc.save(`${filename}.pdf`);
}

// Exportar estadísticas a PDF con formato especial
export function exportEstadisticasToPDF(
  stats: any,
  filename: string,
  title: string
) {
  const doc = new jsPDF();

  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(14, 116, 144); // Teal
  doc.text(title, 14, 20);

  // Fecha
  doc.setFontSize(10);
  doc.setTextColor(100);
  const today = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generado el ${today}`, 14, 28);

  // Línea separadora
  doc.setDrawColor(14, 116, 144);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  let yPos = 45;

  // Renderizar estadísticas
  Object.entries(stats).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Sección
      doc.setFontSize(14);
      doc.setTextColor(14, 116, 144);
      doc.text(formatKey(key), 14, yPos);
      yPos += 8;

      // Sub-estadísticas
      doc.setFontSize(11);
      doc.setTextColor(60);
      Object.entries(value).forEach(([subKey, subValue]) => {
        doc.text(`${formatKey(subKey)}: ${subValue}`, 20, yPos);
        yPos += 6;
      });
      yPos += 5;
    } else {
      // Estadística simple
      doc.setFontSize(12);
      doc.setTextColor(60);
      doc.text(`${formatKey(key)}: ${value}`, 14, yPos);
      yPos += 7;
    }

    // Nueva página si se acaba el espacio
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  doc.save(`${filename}.pdf`);
}

// Formatea claves para mostrar (camelCase a Title Case)
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Exportar tabla con totales a Excel
export function exportToExcelWithTotals(
  data: any[],
  filename: string,
  sheetName: string = 'Datos',
  totalsRow?: any
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Agregar fila de totales si existe
  if (totalsRow) {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const newRow = range.e.r + 2; // Dejar una fila en blanco
    
    Object.keys(totalsRow).forEach((key, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: newRow, c: index });
      worksheet[cellAddress] = { v: totalsRow[key], t: 's' };
    });
    
    // Actualizar rango
    worksheet['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: newRow, c: Object.keys(totalsRow).length - 1 }
    });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
