import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import emailjs from "@emailjs/browser";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";
import Alerta from "./Alerta";
import EMAIL_CONFIG from "../emailConfig"; // ✅ se usa ahora la configuración centralizada

function ExportarInformePDF({
  graficoRef,
  rifaId,
  nombreRifa = "Rifa",
  modoResumen = false,
  ventasFiltradas = [],
  ventasAgrupadas = {},
}) {
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  const exportarTodo = async () => {
    if (!rifaId) {
      setMensaje("Error: no se puede generar PDF sin un rifaId válido.");
      setTipoMensaje("error");
      setTimeout(() => setMensaje(""), 5000);
      return;
    }

    try {
      // 1. Crear PDF
      const doc = new jsPDF("p", "mm", "a4");
      doc.setFontSize(16);
      doc.text(`Informe de ventas - ${nombreRifa}`, 14, 20);

      if (graficoRef?.current) {
        const canvas = await html2canvas(graficoRef.current);
        const imgData = canvas.toDataURL("image/png");
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = 180;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(imgData, "PNG", 14, 30, pdfWidth, pdfHeight);
        doc.text("Historial de ventas", 14, 40 + pdfHeight);
      }

      const startY = 50 + (graficoRef?.current ? 90 : 0);
      const columnas = modoResumen
        ? [["Fecha", "Total vendidos"]]
        : [["Cantidad", "Fecha"]];
      const filas = modoResumen
        ? Object.entries(ventasAgrupadas)
        : ventasFiltradas.map((venta) => [
            venta.cantidad,
            venta.fecha?.toDate?.().toLocaleString() || "",
          ]);

      autoTable(doc, {
        startY,
        head: columnas,
        body: filas,
      });

      const pdfBlob = doc.output("blob");
      const nombreArchivo = `informe_${rifaId}.pdf`;
      const storageRef = ref(storage, `informes/${nombreArchivo}`);

      // 2. Subir a Storage
      await uploadBytes(storageRef, pdfBlob);
      const url = await getDownloadURL(storageRef);

      // 3. Preguntar a qué correo enviar
      const toEmail = prompt("¿A qué correo deseas enviar el informe?");
      if (!toEmail || !toEmail.includes("@")) {
        setMensaje("Correo inválido. El PDF fue generado pero no enviado.");
        setTipoMensaje("info");
        setTimeout(() => setMensaje(""), 5000);
        return;
      }

      // 4. Enviar con EmailJS (usando configuración externa)
      const templateParams = {
        to_email: toEmail,
        nombreRifa,
        message: `Puedes descargar el informe PDF aquí:\n${url}`,
      };

      await emailjs.send(
        EMAIL_CONFIG.serviceID,
        EMAIL_CONFIG.templateID,
        templateParams,
        EMAIL_CONFIG.publicKey
      );

      setMensaje("Informe enviado exitosamente por correo.");
      setTipoMensaje("exito");
      setTimeout(() => setMensaje(""), 5000);
    } catch (error) {
      console.error("Error al exportar o enviar:", error);
      setMensaje("Error al subir el archivo o enviar el correo.");
      setTipoMensaje("error");
      setTimeout(() => setMensaje(""), 5000);
    }
  };

  return (
    <div className="mb-4">
      {mensaje && <Alerta mensaje={mensaje} tipo={tipoMensaje} />}

      <button
        onClick={exportarTodo}
        className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
      >
        Exportar PDF y enviar enlace
      </button>
    </div>
  );
}

export default ExportarInformePDF;
