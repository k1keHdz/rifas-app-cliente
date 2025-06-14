// src/pages/admin/GestionarGanadoresPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// ==================================================================
// INICIO DE CAMBIOS: Importaciones adicionales para guardar
// ==================================================================
import { collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '../../firebase/firebaseConfig';
// ==================================================================
// FIN DE CAMBIOS
// ==================================================================
import { RIFAS_ESTADOS } from '../../constants/rifas';
import Alerta from '../../components/Alerta';

function GestionarGanadoresPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [rifasFinalizadas, setRifasFinalizadas] = useState([]);
  const [loadingRifas, setLoadingRifas] = useState(true);

  const [selectedRifaId, setSelectedRifaId] = useState('');
  const [selectedRifaNombre, setSelectedRifaNombre] = useState('');
  const [numeroGanador, setNumeroGanador] = useState('');
  const [datosGanador, setDatosGanador] = useState(null);
  const [testimonio, setTestimonio] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const q = query(collection(db, "rifas"), where("estado", "==", RIFAS_ESTADOS.FINALIZADA));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rifasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRifasFinalizadas(rifasData);
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
    const rifa = rifasFinalizadas.find(r => r.id === selectedRifaId);
    setSelectedRifaNombre(rifa ? rifa.nombre : '');
  }, [selectedRifaId, rifasFinalizadas]);

  const handleBuscarGanador = async () => {
    if (!selectedRifaId || !numeroGanador) {
      setError("Por favor, selecciona una rifa e introduce un número de boleto.");
      return;
    }
    setIsSearching(true);
    setError('');
    setDatosGanador(null);
    try {
      const numBoleto = parseInt(numeroGanador, 10);
      const ventasRef = collection(db, "rifas", selectedRifaId, "ventas");
      const q = query(ventasRef, where("numeros", "array-contains", numBoleto), where("estado", "==", "comprado"));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError("No se encontró ningún comprador para este boleto, o el boleto no ha sido pagado.");
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

  // ==================================================================
  // INICIO DE CAMBIOS: Implementación de la lógica para guardar el ganador
  // ==================================================================
  const handleSubmitGanador = async (e) => {
    e.preventDefault();
    if (!datosGanador || !fotoFile) {
      setError("Debes buscar un ganador y seleccionar una foto antes de guardar.");
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Subir la foto a Storage
      const fotoRef = ref(storage, `ganadores/${selectedRifaId}_${numeroGanador}_${Date.now()}`);
      await uploadBytes(fotoRef, fotoFile);
      const fotoURL = await getDownloadURL(fotoRef);

      // 2. Preparar los datos para Firestore
      const ganadorData = {
        rifaId: selectedRifaId,
        nombreRifa: selectedRifaNombre,
        numeroGanador: parseInt(numeroGanador, 10),
        datosComprador: datosGanador, // Objeto con nombre, tel, email
        testimonio: testimonio,
        fotoURL: fotoURL,
        fechaRegistro: serverTimestamp(),
      };

      // 3. Guardar en la nueva colección 'ganadores'
      await addDoc(collection(db, "ganadores"), ganadorData);

      alert("¡Ganador registrado con éxito!");
      setIsFormVisible(false); // Ocultamos el formulario
    
    } catch (err) {
      console.error("Error al guardar el ganador:", err);
      setError("Ocurrió un error al guardar el ganador. Revisa la consola.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestor de Ganadores</h1>
        {!isFormVisible && (
          <button onClick={() => setIsFormVisible(true)} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors shadow-md">
            + Registrar Nuevo Ganador
          </button>
        )}
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmitGanador} className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Ganador</h2>
          {(error || mensaje) && <div className="mb-4"><Alerta mensaje={error || mensaje} tipo={error ? 'error' : 'exito'} onClose={() => { setError(''); setMensaje(''); }} /></div>}
          <div className="space-y-4">
            <div>
              <label htmlFor="rifaSelect" className="block text-sm font-medium text-gray-700 mb-1">1. Selecciona la Rifa Finalizada</label>
              <select id="rifaSelect" value={selectedRifaId} onChange={(e) => setSelectedRifaId(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" disabled={loadingRifas}>
                <option value="">{loadingRifas ? "Cargando rifas..." : "-- Elige una rifa --"}</option>
                {rifasFinalizadas.map(rifa => (<option key={rifa.id} value={rifa.id}>{rifa.nombre}</option>))}
              </select>
            </div>
            {selectedRifaId && (
              <div className="animate-fade-in">
                <label htmlFor="numeroGanador" className="block text-sm font-medium text-gray-700 mb-1">2. Introduce el Número de Boleto Ganador</label>
                <div className="flex gap-2">
                  <input id="numeroGanador" type="number" value={numeroGanador} onChange={(e) => setNumeroGanador(e.target.value)} placeholder="Ej. 00123" className="flex-grow border-gray-300 rounded-md shadow-sm" />
                  <button type="button" onClick={handleBuscarGanador} disabled={isSearching} className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400">
                    {isSearching ? 'Buscando...' : 'Buscar Comprador'}
                  </button>
                </div>
              </div>
            )}
            {datosGanador && (
              <div className="animate-fade-in border-t pt-6 mt-6 space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-bold text-green-800">Ganador Encontrado:</p>
                  <p><strong>Nombre:</strong> {datosGanador.nombre}</p>
                  <p><strong>Teléfono:</strong> {datosGanador.telefono}</p>
                </div>
                <div>
                  <label htmlFor="testimonio" className="block text-sm font-medium text-gray-700 mb-1">3. Testimonio del Ganador (Opcional)</label>
                  <textarea id="testimonio" value={testimonio} onChange={(e) => setTestimonio(e.target.value)} rows="3" className="w-full border-gray-300 rounded-md shadow-sm" placeholder="Ej. ¡Increíble, nunca había ganado nada! ¡Muchas gracias!"></textarea>
                </div>
                <div>
                  <label htmlFor="fotoGanador" className="block text-sm font-medium text-gray-700 mb-1">4. Foto del Ganador (Obligatoria)</label>
                  <input id="fotoGanador" type="file" accept="image/*" onChange={handleFotoChange} required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                  {fotoPreview && <img src={fotoPreview} alt="Vista previa" className="mt-4 rounded-lg h-32 w-auto"/>}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-8 border-t pt-6">
            <button type="submit" disabled={isSubmitting || !datosGanador} className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSubmitting ? 'Guardando...' : 'Guardar Ganador'}
            </button>
            <button type="button" onClick={() => setIsFormVisible(false)} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500 mt-8">
        <p className="font-semibold">Historial de Ganadores</p>
        <p>Aquí aparecerá la lista de los ganadores que ya has registrado.</p>
      </div>
    </div>
  );
}

export default GestionarGanadoresPage;