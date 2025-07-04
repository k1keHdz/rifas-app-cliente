// src/components/admin/RifaForm.js

import React, { useEffect, useState } from "react";
// CORREGIDO: Se eliminó 'addDoc' que no se usaba.
import { collection, doc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// CORREGIDO: Rutas actualizadas
import { db, storage } from "../../config/firebaseConfig";
import { useRifas } from "../../context/RifasContext";

// Íconos
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const RulesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 18a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2Z"/><path d="m14 14-2.5 2.5L14 19"/><path d="M18 14l-2.5 2.5L18 19"/></svg>;
const StarIcon = ({ filled }) => filled ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 4.517 1.48-8.279L0 12.134l8.332-1.151z"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 18.14l-5-4.87 6.91-1.01L12 2z"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;

function RifaForm() {
    const { rifaSeleccionada, ocultarFormulario, showFeedback } = useRifas();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [formulario, setFormulario] = useState({
        nombre: "", precio: "", boletos: "", estado: "pendiente",
        descripcion: "", tipoRifa: "porcentaje", porcentajeVenta: "", fechaCierre: "",
    });
    const [imagenes, setImagenes] = useState([]);
    const [reorderMode, setReorderMode] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    useEffect(() => {
        if (rifaSeleccionada) {
            setFormulario({
                ...rifaSeleccionada,
                porcentajeVenta: rifaSeleccionada.porcentajeVenta || "",
                fechaCierre: rifaSeleccionada.fechaCierre?.toDate ? rifaSeleccionada.fechaCierre.toDate().toISOString().split("T")[0] : "",
            });
            setImagenes(rifaSeleccionada.imagenes ? rifaSeleccionada.imagenes.map(url => ({ file: null, preview: url, id: url })) : []);
        } else {
            setFormulario({ nombre: "", precio: "", boletos: "", estado: "pendiente", descripcion: "", tipoRifa: "porcentaje", porcentajeVenta: "", fechaCierre: "" });
            setImagenes([]);
        }
        setReorderMode(false);
        setSelectedImageIndex(null);
    }, [rifaSeleccionada]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'boletos' && Number(value) > 100000) {
            showFeedback("El número máximo de boletos es 100,000.", "error");
            return;
        }
        setFormulario((prev) => ({ ...prev, [name]: value }));
    };

    const handleImagenesChange = (e) => {
        const files = Array.from(e.target.files);
        const nuevasImagenes = files.map(file => ({ file, preview: URL.createObjectURL(file), id: `temp-${file.name}-${Date.now()}` }));
        setImagenes(prev => [...prev, ...nuevasImagenes]);
    };

    const subirYOrdenarImagenes = async (rifaId) => {
        const uploadPromises = imagenes.map(async (img) => {
            if (img.file) {
                const imagenRef = ref(storage, `sorteos/${rifaId}/${Date.now()}_${img.file.name}`);
                await uploadBytes(imagenRef, img.file);
                return getDownloadURL(imagenRef);
            }
            return img.preview;
        });
        return Promise.all(uploadPromises);
    };

    const handleSetCover = (indexToMakeCover) => {
        if (indexToMakeCover === 0) return;
        const newImagenes = [...imagenes];
        const [item] = newImagenes.splice(indexToMakeCover, 1);
        newImagenes.unshift(item);
        setImagenes(newImagenes);
    };

    const handleRemoveImage = (indexToRemove) => {
        if (reorderMode) return;
        setImagenes(imagenes.filter((_, index) => index !== indexToRemove));
    };
    
    const handleImageClick = (index) => {
        if (!reorderMode) return;
        if (selectedImageIndex === null) {
            setSelectedImageIndex(index);
        } else {
            if (selectedImageIndex === index) {
                setSelectedImageIndex(null);
                return;
            }
            const newImagenes = [...imagenes];
            const [itemToMove] = newImagenes.splice(selectedImageIndex, 1);
            newImagenes.splice(index, 0, itemToMove);
            setImagenes(newImagenes);
            setSelectedImageIndex(null); 
        }
    };
    
    const toggleReorderMode = () => {
        setReorderMode(!reorderMode);
        setSelectedImageIndex(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (reorderMode) { return showFeedback("Debes finalizar el modo 'Cambiar Orden' antes de guardar.", "error"); }
        
        if (!formulario.nombre || !formulario.precio || !formulario.boletos || !formulario.descripcion) {
            return showFeedback("Completa los campos obligatorios de la pestaña 'Información General'.", "error");
        }
        if (formulario.tipoRifa === 'fecha' && !formulario.fechaCierre) {
            return showFeedback("Debes elegir una fecha de cierre para esta regla.", "error");
        }
        if (formulario.tipoRifa === 'porcentaje' && !formulario.porcentajeVenta) {
            return showFeedback("Debes indicar un porcentaje de venta para esta regla.", "error");
        }
        if (formulario.tipoRifa === 'fechaConCondicion' && (!formulario.fechaCierre || !formulario.porcentajeVenta)) {
            return showFeedback("Para la 'Fecha con Condición', debes especificar una fecha Y un porcentaje.", "error");
        }
        if (imagenes.length === 0) {
            return showFeedback("Debes subir al menos una imagen para el sorteo.", "error");
        }

        setIsSubmitting(true);
        try {
            const idSorteo = rifaSeleccionada ? rifaSeleccionada.id : doc(collection(db, "rifas")).id;
            const urlsFinales = await subirYOrdenarImagenes(idSorteo);
            
            const datosSorteo = {
                ...formulario,
                precio: Number(formulario.precio),
                boletos: Number(formulario.boletos),
                porcentajeVenta: (formulario.tipoRifa === "porcentaje" || formulario.tipoRifa === "fechaConCondicion") ? Number(formulario.porcentajeVenta) : null,
                fechaCierre: (formulario.tipoRifa === "fecha" || formulario.tipoRifa === "fechaConCondicion") && formulario.fechaCierre ? new Date(formulario.fechaCierre + 'T23:59:59') : null,
                tipoRifa: formulario.tipoRifa,
                imagen: urlsFinales[0],
                imagenes: urlsFinales,
            };

            if (rifaSeleccionada) {
                const rifaRef = doc(db, "rifas", rifaSeleccionada.id);
                await updateDoc(rifaRef, datosSorteo);
                showFeedback("Sorteo actualizado correctamente", "exito");
            } else {
                const nuevaRifa = {
                    ...datosSorteo,
                    fechaCreacion: serverTimestamp(),
                    boletosVendidos: 0 
                };
                await setDoc(doc(db, "rifas", idSorteo), nuevaRifa);
                showFeedback("Sorteo agregado exitosamente", "exito");
            }
            ocultarFormulario();
        } catch (error) {
            console.error("Error al guardar el sorteo:", error);
            showFeedback("Hubo un error al guardar el sorteo.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="bg-background-light rounded-xl shadow-lg p-6 mb-6 border border-border-color animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{rifaSeleccionada ? "Editando Sorteo" : "Crear Nuevo Sorteo"}</h2>
            </div>
            <div className="border-b border-border-color mb-6">
                <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
                    <button type="button" onClick={() => setActiveTab('general')} className={`flex-shrink-0 flex items-center whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'general' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><InfoIcon/> Información General</button>
                    <button type="button" onClick={() => setActiveTab('imagenes')} className={`flex-shrink-0 flex items-center whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'imagenes' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><ImageIcon/> Imágenes</button>
                    <button type="button" onClick={() => setActiveTab('reglas')} className={`flex-shrink-0 flex items-center whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'reglas' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><RulesIcon/> Reglas</button>
                </nav>
            </div>
            <div className="animate-fade-in min-h-[250px]">
                {activeTab === 'general' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block col-span-2">Nombre del Sorteo: <input type="text" name="nombre" value={formulario.nombre} onChange={handleChange} required className="input-field mt-1" /></label>
                        <label className="block col-span-2">Descripción: <textarea name="descripcion" value={formulario.descripcion} onChange={handleChange} className="input-field mt-1" rows="4" /></label>
                        <label className="block">Precio por Boleto ($): <input type="number" name="precio" value={formulario.precio} onChange={handleChange} required className="input-field mt-1" min="0" /></label>
                        <label className="block">Total de Boletos: <input type="number" name="boletos" value={formulario.boletos} onChange={handleChange} required className="input-field mt-1" min="1" max="100000" /></label>
                    </div>
                )}
                {activeTab === 'imagenes' && (
                    <div>
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                            <label className="block">Añadir Nuevas Imágenes: <input type="file" accept="image/*" multiple onChange={handleImagenesChange} disabled={reorderMode} className="block w-full text-sm text-text-subtle file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-primary/10 file:text-accent-primary hover:file:bg-accent-primary/20 disabled:opacity-50"/></label>
                            <button type="button" onClick={toggleReorderMode} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${reorderMode ? 'bg-danger text-white' : 'btn-secondary'}`}>
                               {reorderMode ? 'Finalizar Orden' : 'Cambiar Orden'}
                            </button>
                        </div>
                        <p className="text-xs text-text-subtle mb-4">
                            {reorderMode 
                                ? "Modo 'Cambiar Orden' activado: 1) Haz clic en la imagen que quieres mover. 2) Haz clic en la posición a donde la quieres enviar."
                                : "La primera imagen de la lista será la portada. Usa la estrella (⭐) para designar una nueva portada."
                            }
                        </p>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {imagenes.map((img, i) => (
                                <div 
                                    key={img.id || i} 
                                    onClick={() => handleImageClick(i)} 
                                    className={`relative group border-4 rounded-lg overflow-hidden aspect-w-1 aspect-h-1 transition-all
                                        ${reorderMode ? 'cursor-pointer' : ''}
                                        ${selectedImageIndex === i ? 'border-success scale-105 shadow-2xl' : 'border-transparent'}
                                    `}
                                >
                                    <img src={img.preview} alt={`preview-${i}`} className="w-full h-full object-cover" />
                                    {!reorderMode && (
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2 p-1">
                                            <button type="button" title="Establecer como portada" onClick={() => handleSetCover(i)} disabled={i === 0} className="p-2 bg-white rounded-full text-yellow-400 hover:bg-gray-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"><StarIcon filled={i === 0} /></button>
                                            <button type="button" title="Eliminar imagen" onClick={() => handleRemoveImage(i)} className="p-2 bg-white rounded-full text-danger hover:bg-gray-200 opacity-0 group-hover:opacity-100"><TrashIcon /></button>
                                        </div>
                                    )}
                                     {i === 0 && !reorderMode && <div className="absolute top-1 right-1 bg-yellow-400 text-white p-1 rounded-full" title="Imagen de portada"><StarIcon filled={true} /></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'reglas' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block">
                                Estado del Sorteo:
                                <select name="estado" value={formulario.estado} onChange={handleChange} className="input-field mt-1">
                                    <option value="pendiente">Pendiente</option>
                                    <option value="activa">Activa</option>
                                    <option value="finalizada">Finalizada</option>
                                </select>
                            </label>
                            <label className="block">
                                Condición para realizar el Sorteo:
                                <select name="tipoRifa" value={formulario.tipoRifa} onChange={handleChange} className="input-field mt-1">
                                    <option value="porcentaje">Solo por Porcentaje de Venta</option>
                                    <option value="fecha">Solo por Fecha (incondicional)</option>
                                    <option value="fechaConCondicion">Por Fecha (con condición de venta)</option>
                                </select>
                            </label>
                        </div>
                        <div className="space-y-4 bg-background-dark p-4 rounded-lg border border-border-color">
                            {(formulario.tipoRifa === 'porcentaje' || formulario.tipoRifa === 'fechaConCondicion') && (
                                <label className="block">
                                    Porcentaje de Venta (%):
                                    <input type="number" name="porcentajeVenta" value={formulario.porcentajeVenta} onChange={handleChange} required={formulario.tipoRifa !== 'fecha'} className="input-field mt-1" min="1" max="100" />
                                </label>
                            )}
                            {(formulario.tipoRifa === 'fecha' || formulario.tipoRifa === 'fechaConCondicion') && (
                                <label className="block">
                                    Fecha Programada del Sorteo:
                                    <input type="date" name="fechaCierre" value={formulario.fechaCierre} onChange={handleChange} required={formulario.tipoRifa !== 'porcentaje'} className="input-field mt-1" />
                                </label>
                            )}
                             {formulario.tipoRifa === 'fechaConCondicion' && (
                                <p className="text-xs text-text-subtle italic mt-2">
                                    El sorteo se realizará en la fecha indicada solo si se alcanza la meta de venta. De lo contrario, se pospondrá.
                                </p>
                             )}
                             {formulario.tipoRifa === 'fecha' && (
                                <p className="text-xs text-text-subtle italic mt-2">
                                    El sorteo se realizará en la fecha indicada sin importar el porcentaje de venta.
                                </p>
                             )}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4 mt-8 border-t border-border-color pt-6">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : (rifaSeleccionada ? "Actualizar Sorteo" : "Guardar Sorteo")}
                </button>
                <button type="button" onClick={ocultarFormulario} className="btn btn-secondary">
                    Cancelar
                </button>
            </div>
        </form>
    );
}

export default RifaForm;
