// src/components/RifaForm.js

import { useEffect, useState } from "react";
import { addDoc, collection, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
import Alerta from "./Alerta";
import { useRifas } from "../context/RifasContext";

function RifaForm() {
  const { rifaSeleccionada, ocultarFormulario } = useRifas();

  const [formulario, setFormulario] = useState({
    nombre: "",
    precio: "",
    boletos: "",
    estado: "pendiente",
    descripcion: "",
    tipoRifa: "porcentaje",
    porcentajeVenta: "",
    fechaCierre: "",
  });

  const [imagenesFiles, setImagenesFiles] = useState([]);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("info");

  useEffect(() => {
    if (rifaSeleccionada) {
      setFormulario({
        ...rifaSeleccionada,
        porcentajeVenta: rifaSeleccionada.porcentajeVenta || "",
        fechaCierre: rifaSeleccionada.fechaCierre?.toDate ? rifaSeleccionada.fechaCierre.toDate().toISOString().split("T")[0] : "",
      });
      setImagenesPreview(rifaSeleccionada.imagenes || []);
    }
  }, [rifaSeleccionada]);

  const mostrarAlertaConTimeout = (msg, tipo) => {
    setMensaje(msg);
    setTipoMensaje(tipo);
    setTimeout(() => {
      setMensaje("");
    }, 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // CAMBIO: Añadimos una validación directa en el handleChange para el número de boletos
    if (name === 'boletos') {
      if (Number(value) > 100000) {
        mostrarAlertaConTimeout("El número máximo de boletos es 100,000.", "error");
        return;
      }
    }
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenesFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagenesPreview(previews);
  };

  const subirImagenes = async (rifaId) => {
    const urls = [];
    for (const [i, file] of imagenesFiles.entries()) {
      const imagenRef = ref(storage, `imagenes/${rifaId}/${Date.now()}_${i}`);
      await uploadBytes(imagenRef, file);
      const url = await getDownloadURL(imagenRef);
      urls.push(url);
    }
    return urls;
  };

  const borrarImagenesAnteriores = async (rifaId) => {
    const carpetaRef = ref(storage, `imagenes/${rifaId}`);
    try {
      const listado = await listAll(carpetaRef);
      await Promise.all(listado.items.map((imgRef) => deleteObject(imgRef)));
    } catch (error) {
      console.warn("No se pudieron borrar imágenes anteriores (puede que no existieran):", error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formulario.nombre || !formulario.precio || !formulario.boletos) {
      return mostrarAlertaConTimeout("Completa los campos obligatorios: Nombre, Precio y Boletos.", "error");
    }
    // CAMBIO: Doble validación en el submit por si acaso
    if (Number(formulario.boletos) > 100000) {
      return mostrarAlertaConTimeout("El número máximo de boletos no puede ser mayor a 100,000.", "error");
    }
    if (!rifaSeleccionada && imagenesFiles.length === 0) {
      return mostrarAlertaConTimeout("Debes seleccionar al menos una imagen para una nueva rifa.", "error");
    }

    try {
      const datosRifa = {
        ...formulario,
        precio: Number(formulario.precio),
        boletos: Number(formulario.boletos),
        porcentajeVenta: formulario.tipoRifa === "porcentaje" ? Number(formulario.porcentajeVenta) : null,
        fechaCierre: formulario.tipoRifa === "fecha" && formulario.fechaCierre ? new Date(formulario.fechaCierre) : null,
      };

      if (rifaSeleccionada) {
        // Lógica para ACTUALIZAR una rifa existente
        const rifaRef = doc(db, "rifas", rifaSeleccionada.id);
        if (imagenesFiles.length > 0) {
          await borrarImagenesAnteriores(rifaSeleccionada.id);
          const nuevasUrls = await subirImagenes(rifaSeleccionada.id);
          await updateDoc(rifaRef, { ...datosRifa, imagenes: nuevasUrls });
        } else {
          await updateDoc(rifaRef, datosRifa);
        }
        mostrarAlertaConTimeout("Rifa actualizada correctamente", "exito");
      } else {
        // Lógica para CREAR una rifa nueva
        const nuevaRifa = {
          ...datosRifa,
          fechaCreacion: serverTimestamp(),
          boletosVendidos: 0,
        };
        const docRef = await addDoc(collection(db, "rifas"), nuevaRifa);
        const nuevasUrls = await subirImagenes(docRef.id);
        await updateDoc(docRef, { imagenes: nuevasUrls });
        mostrarAlertaConTimeout("Rifa agregada exitosamente", "exito");
      }
      ocultarFormulario();
    } catch (error) {
      console.error("Error al guardar la rifa:", error);
      mostrarAlertaConTimeout("Hubo un error al guardar la rifa.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow-lg p-6 mb-6 border border-gray-200 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">
        {rifaSeleccionada ? "Editando Rifa" : "Crear Nueva Rifa"}
      </h2>

      {mensaje && <Alerta mensaje={mensaje} tipo={tipoMensaje} onClose={() => setMensaje("")} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block mb-2">Nombre: <input type="text" name="nombre" value={formulario.nombre} onChange={handleChange} className="w-full border rounded p-2 mt-1" /></label>
        <label className="block mb-2">Precio: <input type="number" name="precio" value={formulario.precio} onChange={handleChange} className="w-full border rounded p-2 mt-1" min="0" /></label>
        <div>
            <label className="block mb-2">Total de Boletos:</label>
            {/* CAMBIO: Añadimos min y max al input de boletos */}
            <input type="number" name="boletos" value={formulario.boletos} onChange={handleChange} className="w-full border rounded p-2 mt-1" min="1" max="100000" />
            <p className="text-xs text-gray-500 mt-1">Máximo 100,000 boletos para compatibilidad con Lotería Nacional.</p>
        </div>
        <label className="block mb-2">Estado: 
          <select name="estado" value={formulario.estado} onChange={handleChange} className="w-full border rounded p-2 mt-1">
            <option value="pendiente">Pendiente</option>
            <option value="activa">Activa</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </label>
        <label className="block mb-2 col-span-2">Descripción: <textarea name="descripcion" value={formulario.descripcion} onChange={handleChange} className="w-full border rounded p-2 mt-1" /></label>
        <label className="block mb-2">Tipo de Rifa: 
          <select name="tipoRifa" value={formulario.tipoRifa} onChange={handleChange} className="w-full border rounded p-2 mt-1">
            <option value="porcentaje">Porcentaje de Venta</option>
            <option value="fecha">Fecha de Cierre</option>
          </select>
        </label>
        {formulario.tipoRifa === 'porcentaje' ?
          <label className="block mb-2">Porcentaje Mínimo (%): <input type="number" name="porcentajeVenta" value={formulario.porcentajeVenta} onChange={handleChange} className="w-full border rounded p-2 mt-1" min="1" max="100" /></label>
          :
          <label className="block mb-2">Fecha de Cierre: <input type="date" name="fechaCierre" value={formulario.fechaCierre} onChange={handleChange} className="w-full border rounded p-2 mt-1" /></label>
        }
        <div className="col-span-2">
          <label className="block mb-4">Imágenes: <input type="file" accept="image/*" multiple onChange={handleImagenesChange} /></label>
          {imagenesPreview.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {imagenesPreview.map((src, i) => (<img key={i} src={src} alt={`preview-${i}`} className="h-32 w-full object-cover border rounded" />))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-700 transition-colors">
          {rifaSeleccionada ? "Actualizar Rifa" : "Guardar Rifa"}
        </button>
        <button type="button" onClick={ocultarFormulario} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default RifaForm;