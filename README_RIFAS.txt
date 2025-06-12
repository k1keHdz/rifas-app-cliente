
Proyecto: Plataforma de Rifas (React + Firebase + EmailJS)
Ubicación: C:\Proyectos\rifas-app

=============================================
🛠️ Tecnologías utilizadas:
=============================================
- React + Tailwind CSS
- Firebase Firestore (rifas y ventas)
- Firebase Storage (imágenes y PDF)
- EmailJS para envío de correos
- jsPDF + html2canvas + autoTable para PDF
- Visual Studio Code (Auto Save + Hot Exit)

=============================================
✅ Funcionalidades implementadas:
=============================================

🎟️ Formulario de rifas (RifaForm.js)
- Agrega y edita rifas con:
  nombre, precio, boletos, estado, descripción, tipoRifa, porcentajeVenta, fechaCierre, fechaCreacion
- Subida de imagen con vista previa
- Borra imagen anterior al editar

📋 Lista de rifas (RifasList.js)
- Muestra todas las rifas con imagen y datos
- Botón Editar (rellena formulario)
- Botón Eliminar (borra rifa + imagen del Storage)
- Visual con título arriba, descripción debajo de imagen

🛒 Registro de ventas (RegistroVenta.js)
- Registra ventas por rifa seleccionada
- Guarda en subcolección: rifas/{rifaId}/ventas

📈 Historial y gráfica de ventas
- Archivos: HistorialVentas.js y GraficaVentas.js
- Filtro por fecha
- Modo resumen agrupado
- Sincronización total

📤 Exportación de PDF (ExportarInformePDF.js)
- PDF incluye título, gráfica, historial
- Se guarda como: informes/informe_{rifaId}.pdf
- Se envía por EmailJS tras preguntar el correo

📩 EmailJS
- serviceID: service_png1ebl
- templateID: template_i8y2ycs
- publicKey: XXTXKGS8_sAeLDyl9

🌐 Vista pública (RifasPublic.js)
- Muestra rifas activas para clientes (ruta /rifas)

🔔 Alertas visuales (Alerta.js)
- Tipos: exito, error, info
- Animación fade-in desde Tailwind

⚙️ Configuración adicional:
- Auto Save y Hot Exit activados en VS Code
- tailwind.config.js extendido para animaciones

=============================================
📦 Archivos clave:
src/components/RifaForm.js
src/components/RifasList.js
src/components/RegistroVenta.js
src/components/HistorialVentas.js
src/components/GraficaVentas.js
src/components/ExportarInformePDF.js
src/components/Navbar.js
src/components/Alerta.js
src/firebase/firebaseConfig.js

=============================================
📌 Estado actual: ESTABLE Y FUNCIONAL
=============================================

🔒 Pendientes sugeridos:
- Reglas seguras en Firebase Storage
- Eliminar PDF al finalizar rifa
- Pasar claves a archivo .env
- Descargar PDF directamente
- Mejorar diseño del correo
- Agregar caducidad automática al PDF
