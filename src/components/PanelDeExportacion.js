// src/components/PanelDeExportacion.js
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { formatTicketNumber } from '../utils/rifaHelper';

const PDFIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12v-1a2 2 0 0 1 2-2h1"/><path d="M13 11v6"/><path d="M10 18h2.5a1.5 1.5 0 0 0 0-3H10v-1"/></svg>;
const ExcelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13h-3v10h-2V13H8v-2h8v2z"></path><path d="M4 12h4v2H4z"></path></svg>;

function PanelDeExportacion({ rifa, ventasFiltradas = [], graficoRef }) {
  const calcularEstadisticas = () => {
    const vendidosCount = rifa.boletosVendidos || 0;
    const apartadosArr = ventasFiltradas.filter(v => v.estado === 'apartado');
    const apartadosCount = apartadosArr.reduce((sum, v) => sum + v.cantidad, 0);
    const disponiblesCount = rifa.boletos - vendidosCount - apartadosCount;
    const vendidosDinero = vendidosCount * rifa.precio;
    const apartadosDinero = apartadosCount * rifa.precio;
    return { vendidosCount, apartadosCount, disponiblesCount, vendidosDinero, apartadosDinero };
  };

  const generarPDF = async () => {
    if (!rifa) return alert("No hay datos del sorteo para generar el informe.");
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const hoy = new Date().toLocaleDateString('es-MX');
    const stats = calcularEstadisticas();

    doc.setFontSize(22);
    doc.text(`Informe de Sorteo: ${rifa.nombre}`, 15, 20);
    doc.setFontSize(12);
    doc.text(`Reporte generado el: ${hoy}`, 15, 28);

    autoTable(doc, {
      startY: 40,
      head: [['Estadística', 'Boletos', 'Monto (MXN)']],
      body: [
        ['Total del Sorteo', `${rifa.boletos}`, `$${(rifa.boletos * rifa.precio).toLocaleString()}`],
        ['Pagados', `${stats.vendidosCount}`, `$${stats.vendidosDinero.toLocaleString()}`],
        ['Apartados', `${stats.apartadosCount}`, `$${stats.apartadosDinero.toLocaleString()}`],
        ['Disponibles', `${stats.disponiblesCount}`, ''],
      ],
      theme: 'striped',
    });

    if (graficoRef.current && graficoRef.current.offsetParent !== null) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Gráfica de Ventas", 15, 20);
      try {
        const canvas = await html2canvas(graficoRef.current, { backgroundColor: 'rgb(var(--background-light))' });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
      } catch (error) {
        console.error("Error al renderizar la gráfica:", error);
        doc.text("No se pudo generar la imagen de la gráfica.", 15, 30);
      }
    }
    
    if (ventasFiltradas.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Listado Detallado de Participantes", 15, 20);
        autoTable(doc, {
        startY: 30,
        head: [['Nombre', 'Teléfono', 'Email', 'Números', 'Cant.', 'Precio Boleto', 'Total', 'Estado']],
        body: ventasFiltradas.map(v => {
            const estadoTexto = v.estado === 'comprado' ? 'Pagado' : 'Apartado';
            return [
                v.comprador.nombre,
                v.comprador.telefono,
                v.comprador.email || 'N/A',
                v.numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', '),
                v.cantidad,
                `$${v.precioBoleto || rifa.precio}`,
                `$${(v.cantidad || 0) * (v.precioBoleto || rifa.precio)}`,
                estadoTexto,
            ]
        }),
        theme: 'grid',
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 7) {
            const texto = data.cell.text[0];
            if (texto === 'Pagado') {
                doc.setFillColor(34, 197, 94); // success
            } else if (texto === 'Apartado') {
                doc.setFillColor(234, 179, 8); // warning
            }
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(texto, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
                align: 'center',
                baseline: 'middle'
            });
            }
        },
        });
    }

    doc.save(`Reporte_PDF_${rifa.nombre.replace(/ /g, '_')}.pdf`);
  };

  const generarExcel = () => {
    if (!rifa) return alert("No hay datos del sorteo para generar el informe.");

    const stats = calcularEstadisticas();
    const resumenData = [
      ["Informe de Sorteo", rifa.nombre],
      ["Fecha de Reporte", new Date().toLocaleDateString('es-MX')],
      [],
      ["Estadística", "Cantidad de Boletos", "Monto (MXN)"],
      ['Total del Sorteo', rifa.boletos, rifa.boletos * rifa.precio],
      ['Pagados', stats.vendidosCount, stats.vendidosDinero],
      ['Apartados', stats.apartadosCount, stats.apartadosDinero],
      ['Disponibles', stats.disponiblesCount, ''],
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

    const participantesData = ventasFiltradas.map(v => ({
      'Nombre': v.comprador.nombre,
      'Teléfono': v.comprador.telefono,
      'Email': v.comprador.email || 'N/A',
      'Números': v.numeros.map(n => formatTicketNumber(n, rifa.boletos)).join(', '),
      'Cantidad': v.cantidad,
      'Precio Boleto': v.precioBoleto || rifa.precio,
      'Total Pagado': (v.cantidad || 0) * (v.precioBoleto || rifa.precio),
      'Estado': v.estado === 'comprado' ? 'Pagado' : 'Apartado',
      'Fecha': v.fechaApartado?.toDate().toLocaleString('es-MX') || 'N/A',
    }));
    const wsParticipantes = XLSX.utils.json_to_sheet(participantesData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
    XLSX.utils.book_append_sheet(wb, wsParticipantes, "Participantes");
    XLSX.writeFile(wb, `Reporte_Excel_${rifa.nombre.replace(/ /g, '_')}.xlsx`);
  };

  return (
    <div className="bg-background-dark p-4 rounded-lg mt-6 border border-border-color">
      {/* REPARACIÓN: Se elimina text-text-light. */}
      <h3 className="text-lg font-bold mb-4">Exportar Informes</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* REPARACIÓN: Se usan los colores semánticos del tema. */}
        <button onClick={generarPDF} className="flex-1 bg-danger text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors flex items-center justify-center">
          <PDFIcon />
          Exportar a PDF
        </button>
        <button onClick={generarExcel} className="flex-1 bg-success text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors flex items-center justify-center">
          <ExcelIcon />
          Exportar a Excel
        </button>
      </div>
    </div>
  );
}

export default PanelDeExportacion;
