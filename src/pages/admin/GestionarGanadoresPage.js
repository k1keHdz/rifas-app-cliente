// src/pages/admin/GestionarGanadoresPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '../../firebase/firebaseConfig';
import { RIFAS_ESTADOS } from '../../constants/rifas';
import Alerta from '../../components/Alerta';

// Sub-componente para el buscador
const BuscadorGanador = ({ todasLasRifas, loadingRifas }) => {
  const [rifaId, setRifaId] = useState('');
  const [boleto, setBoleto] = useState('');
  const [resultado, setResultado] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setResultado(null);
    try {
      const numBoleto = parseInt(boleto, 10);
      if (isNaN(numBoleto)) {
        setResultado('no_encontrado');
        return;
      }
      const ventasRef = collection(db, "rifas", rifaId, "ventas");
      const q = query(ventasRef, where("numeros", "array-contains", numBoleto), where("estado", "==", "comprado"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setResultado('no_encontrado');
      } else {
        setResultado(querySnapshot.docs[0].data());
      }
    } catch (error) {
      console.error("Error buscando ganador por boleto:", error);
      setResultado('no_encontrado');
    } finally {
      setIsSearching(false);
    }
  };

  const notificarGanadorWhatsApp = () => {
    const rifa = todasLasRifas.find(r => r.id === rifaId);
    let mensaje = `🎉 ¡MUCHAS FELICIDADES, ${resultado.comprador.nombre}! 🎉\n\n`;
    mensaje += `¡Eres el afortunado ganador del sorteo "${rifa.nombre}" con el boleto número *${String(boleto).padStart(5, '0')}*!\n\n`;
    mensaje += `Nos pondremos en contacto contigo muy pronto para coordinar la entrega de tu premio. ¡Gracias por participar!`;
    const waUrl = `https://wa.me/52${resultado.comprador.telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="bg-background-light rounded-xl shadow-lg p-6 mb-8 border border-border-color">
      {/* REPARACIÓN: Se eliminan clases de color. */}
      <h2 className="text-2xl font-bold mb-4">Buscar y Notificar Ganador</h2>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* REPARACIÓN: Se usa la clase .input-field para consistencia. */}
          <select value={rifaId} onChange={(e) => { setRifaId(e.target.value); setResultado(null); }} className="input-field" required>
            <option value="">{loadingRifas ? "Cargando..." : "-- Selecciona Sorteo --"}</option>
            {todasLasRifas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          <input type="number" value={boleto} onChange={(e) => setBoleto(e.target.value)} placeholder="No. de Boleto Ganador" className="input-field" required />
        </div>
        <button type="submit" disabled={isSearching || !rifaId} className="w-full btn btn-primary disabled:opacity-50">
          {isSearching ? "Buscando..." : "Buscar Comprador"}
        </button>
      </form>

      {resultado === 'no_encontrado' && <p className="mt-4 text-center text-danger font-semibold">No se encontró un comprador para este boleto o no ha sido pagado.</p>}

      {resultado && resultado !== 'no_encontrado' && (
        <div className="mt-6 border-t border-border-color pt-4 animate-fade-in">
          <h3 className="font-bold text-lg text-success">¡Ganador Encontrado!</h3>
          <div className="mt-2 p-4 bg-success/10 rounded-lg text-text-subtle">
            <p><strong className="text-text-primary">Nombre:</strong> {resultado.comprador.nombre} {resultado.comprador.apellidos || ''}</p>
            <p><strong>Teléfono:</strong> {resultado.comprador.telefono}</p>
            <p><strong>Email:</strong> {resultado.comprador.email || 'No proporcionado'}</p>
            <p><strong>ID de Compra:</strong> {resultado.idCompra || 'N/A'}</p>
          </div>
          {resultado.estado === 'comprado' && (
            <div className="mt-4 flex gap-4">
              <button onClick={notificarGanadorWhatsApp} className="btn bg-success text-white hover:bg-green-700">Felicitar por WhatsApp</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GestionarGanadoresPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [todasLasRifas, setTodasLasRifas] = useState([]);
  const [loadingRifas, setLoadingRifas] = useState(true);
  
  const [selectedRifaId, setSelectedRifaId] = useState('');
  const [selectedRifaNombre, setSelectedRifaNombre] = useState('');
  const [numeroGanador, setNumeroGanador] = useState('');
  const [datosGanador, setDatosGanador] = useState(null);
  const [testimonio, setTestimonio] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const q = query(collection(db, "rifas"), orderBy("fechaCreacion", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rifasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTodasLasRifas(rifasData);
      setLoadingRifas(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setNumeroGanador('');
    setDatosGanador(null);
    setTestimonio('');
    setFotoFile(null);
    setFotoPreview('');
    setVideoFile(null);
    const rifa = todasLasRifas.find(r => r.id === selectedRifaId);
    setSelectedRifaNombre(rifa ? rifa.nombre : '');
  }, [selectedRifaId, todasLasRifas]);

  const handleBuscarGanadorEnFormulario = async () => {
    if (!selectedRifaId || !numeroGanador) { setError("Por favor, selecciona un sorteo e introduce un número de boleto."); return; }
    setIsSearching(true);
    setError('');
    setDatosGanador(null);
    try {
      const numBoleto = parseInt(numeroGanador, 10);
      const ventasRef = collection(db, "rifas", selectedRifaId, "ventas");
      const q = query(ventasRef, where("numeros", "array-contains", numBoleto), where("estado", "==", "comprado"));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError("No se encontró ningún comprador pagado para este boleto.");
      } else {
        const ganadorData = querySnapshot.docs[0].data().comprador;
        setDatosGanador(ganadorData);
        setMensaje(`¡Ganador encontrado!: ${ganadorData.nombre}`);
        setTimeout(() => setMensaje(''), 3000);
      }
    } catch (err) {
      console.error("Error buscando al ganador:", err);
      setError("Ocurrió un error al realizar la búsqueda.");
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmitGanador = async (e) => {
    e.preventDefault();
    if (!datosGanador || !fotoFile) { setError("Debes buscar un ganador y seleccionar una foto (obligatoria) antes de guardar."); return; }
    setIsSubmitting(true);
    setError('');
    try {
      const fotoRef = ref(storage, `ganadores/fotos/${selectedRifaId}_${Date.now()}`);
      await uploadBytes(fotoRef, fotoFile);
      const fotoURL = await getDownloadURL(fotoRef);
      let videoURL = null;
      if (videoFile) {
        const videoRef = ref(storage, `ganadores/videos/${selectedRifaId}_${Date.now()}`);
        await uploadBytes(videoRef, videoFile);
        videoURL = await getDownloadURL(videoRef);
      }
      const ganadorData = {
        rifaId: selectedRifaId,
        nombreRifa: selectedRifaNombre,
        numeroGanador: parseInt(numeroGanador, 10),
        datosComprador: datosGanador,
        testimonio: testimonio,
        fotoURL: fotoURL,
        videoURL: videoURL,
        fechaRegistro: serverTimestamp(),
      };
      await addDoc(collection(db, "ganadores"), ganadorData);
      alert("¡Ganador registrado con éxito para la galería!");
      setIsFormVisible(false);
    } catch (err) {
      console.error("Error al guardar el ganador:", err);
      setError("Ocurrió un error al guardar el ganador.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // REPARACIÓN: Se eliminan clases de color del div principal.
  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen">
      <Link to="/admin" className="text-accent-primary hover:underline mb-8 inline-block">
        ← Volver al Panel Principal
      </Link>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Gestor de Ganadores</h1>
        <p className="mt-2 text-lg text-text-subtle">
          Busca y notifica ganadores, o regístralos para mostrarlos en la galería pública.
        </p>
      </div>

      <BuscadorGanador todasLasRifas={todasLasRifas} loadingRifas={loadingRifas} />
      
      <div className="flex justify-center my-8">
        <button onClick={() => setIsFormVisible(!isFormVisible)} className="btn btn-secondary">
          {isFormVisible ? 'Ocultar Formulario de Galería' : '+ Registrar Ganador para Galería'}
        </button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmitGanador} className="bg-background-light rounded-xl shadow-lg p-6 mb-8 animate-fade-in border border-border-color">
          <h2 className="text-2xl font-bold mb-6">Registrar Ganador para Galería</h2>
          {(error || mensaje) && <div className="mb-4"><Alerta mensaje={error || mensaje} tipo={error ? 'error' : 'exito'} onClose={() => { setError(''); setMensaje(''); }} /></div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-subtle mb-1">1. Selecciona el Sorteo</label>
              <select value={selectedRifaId} onChange={(e) => setSelectedRifaId(e.target.value)} className="input-field" disabled={loadingRifas}>
                <option value="">{loadingRifas ? "Cargando..." : "-- Elige un sorteo --"}</option>
                {todasLasRifas.map(rifa => (<option key={rifa.id} value={rifa.id}>{rifa.nombre}</option>))}
              </select>
            </div>
            {selectedRifaId && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-text-subtle mb-1">2. Introduce el Número de Boleto Ganador</label>
                <div className="flex gap-2">
                  <input type="number" value={numeroGanador} onChange={(e) => setNumeroGanador(e.target.value)} placeholder="Ej. 00123" className="input-field flex-grow" />
                  <button type="button" onClick={handleBuscarGanadorEnFormulario} disabled={isSearching} className="btn btn-primary disabled:opacity-50">{isSearching ? 'Buscando...' : 'Buscar'}</button>
                </div>
              </div>
            )}
            {datosGanador && (
              <div className="animate-fade-in border-t border-border-color pt-6 mt-6 space-y-4">
                <div className="bg-success/10 p-4 rounded-lg"><p className="font-bold text-green-300">Ganador Encontrado:</p><p><strong>Nombre:</strong> {datosGanador.nombre}</p><p><strong>Teléfono:</strong> {datosGanador.telefono}</p></div>
                <div><label className="block text-sm font-medium text-text-subtle mb-1">3. Testimonio del Ganador (Opcional)</label><textarea value={testimonio} onChange={(e) => setTestimonio(e.target.value)} rows="3" className="input-field" placeholder="Ej. ¡Increíble!"></textarea></div>
                <div><label className="block text-sm font-medium text-text-subtle mb-1">4. Foto del Ganador (Obligatoria)</label><input type="file" accept="image/*" onChange={handleFotoChange} required className="block w-full text-sm text-text-subtle file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-primary/10 file:text-accent-primary hover:file:bg-accent-primary/20"/>{fotoPreview && <img src={fotoPreview} alt="Vista previa" className="mt-4 rounded-lg h-32 w-auto"/>}</div>
                <div><label className="block text-sm font-medium text-text-subtle mb-1">5. Video del Ganador (Opcional)</label><input type="file" accept="video/*" onChange={handleVideoChange} className="block w-full text-sm text-text-subtle file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-primary/10 file:text-accent-primary hover:file:bg-accent-primary/20"/>{videoFile && <p className="text-xs text-text-subtle mt-1">Video: <span className="font-medium">{videoFile.name}</span></p>}</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-8 border-t border-border-color pt-6">
            <button type="submit" disabled={isSubmitting || !datosGanador} className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Guardando...' : 'Guardar Ganador'}</button>
            <button type="button" onClick={() => setIsFormVisible(false)} className="btn btn-secondary">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default GestionarGanadoresPage;
