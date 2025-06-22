// src/pages/RifaDetalle.js

import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from '../context/AuthContext';
import { useBoletos } from "../hooks/useBoletos";
import { nanoid } from 'nanoid';
import ModalImagen from "../components/ModalImagen";
import SelectorBoletos from "../components/SelectorBoletos";
import ModalMaquinaSuerte from "../components/ModalMaquinaSuerte";
import BuscadorBoletos from "../components/BuscadorBoletos";
import ModalDatosComprador from "../components/ModalDatosComprador";
import { getDrawConditionText, formatTicketNumber } from "../utils/rifaHelper";
import ModalInvitacionRegistro from "../components/ModalInvitacionRegistro";
import { usePurchaseCooldown } from '../hooks/usePurchaseCooldown';
import { FEATURES } from '../config/features';
import Alerta from "../components/Alerta";
import ModalCooldown from "../components/ModalCooldown";


function RifaDetalle() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [rifa, setRifa] = useState(null);
  const [cargandoRifa, setCargandoRifa] = useState(true);
  const [datosPerfil, setDatosPerfil] = useState({});
  const [filtroDisponibles, setFiltroDisponibles] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [boletosPorPagina] = useState(500);
  const [mostrarModalDatos, setMostrarModalDatos] = useState(false);
  const [mostrarModalSuerte, setMostrarModalSuerte] = useState(false);
  const [imagenIndex, setImagenIndex] = useState(0);
  const [imagenAmpliadaIndex, setImagenAmpliadaIndex] = useState(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [cooldownInfo, setCooldownInfo] = useState({ show: false, timeLeft: '' });
  const [alertaGeneral, setAlertaGeneral] = useState('');

  const {
    boletosOcupados, boletosSeleccionados, cargandoBoletos, toggleBoleto, 
    seleccionarBoleto, limpiarSeleccion, agregarBoletosEspecificos,
  } = useBoletos(id);

  const { checkCooldown, setCooldown } = usePurchaseCooldown();
  
  const location = useLocation();
  
  useEffect(() => {
    if (location.state?.boletoSeleccionado) {
      const numero = location.state.boletoSeleccionado;
      if (!cargandoBoletos && !boletosOcupados.has(numero) && !boletosSeleccionados.includes(numero)) {
        seleccionarBoleto(numero);
      }
    }
  }, [location.state, cargandoBoletos, boletosOcupados, boletosSeleccionados, seleccionarBoleto]);

  useEffect(() => {
    setCargandoRifa(true);
    const docRef = doc(db, "rifas", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) { setRifa({ id: docSnap.id, ...docSnap.data() }); } 
      else { setRifa(null); }
      setCargandoRifa(false);
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'usuarios', currentUser.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) { setDatosPerfil(docSnap.data()); }
      });
      return () => unsubscribe();
    } else {
      setDatosPerfil({});
    }
  }, [currentUser]);

  const handleReservarPorWhatsapp = async () => {
    if (boletosSeleccionados.length === 0) { 
        setAlertaGeneral("Debes seleccionar al menos un boleto para continuar.");
        return; 
    }

    if (FEATURES.cooldownActivado) {
        const { isOnCooldown, timeLeft } = await checkCooldown(currentUser, datosPerfil);
        if (isOnCooldown) {
            setCooldownInfo({ show: true, timeLeft: timeLeft });
            return;
        }
    }

    if (currentUser) {
      setMostrarModalDatos(true);
    } else {
      setShowInvitationModal(true);
    }
  };

  const handleContinueAsGuest = () => {
    setShowInvitationModal(false);
    setMostrarModalDatos(true);
  }
  
  const confirmarApartado = async (datosDelFormulario) => {
    const boletosYaComprados = boletosSeleccionados.filter(b => boletosOcupados.has(b));
    if (boletosYaComprados.length > 0) {
      setAlertaGeneral(`¡Error! El/los boleto(s) ${boletosYaComprados.join(', ')} ya fue(ron) comprado(s) mientras elegías. La página se recargará.`);
      setTimeout(() => window.location.reload(), 3000);
      return;
    }
    try {
      const DOCE_HORAS_EN_MS = 12 * 60 * 60 * 1000;
      const idCompra = nanoid(8).toUpperCase();
      const ventaData = {
        idCompra,
        comprador: datosDelFormulario,
        numeros: boletosSeleccionados,
        cantidad: boletosSeleccionados.length,
        estado: 'apartado',
        fechaApartado: serverTimestamp(),
        fechaExpiracion: Timestamp.fromDate(new Date(Date.now() + DOCE_HORAS_EN_MS)),
        userId: currentUser ? currentUser.uid : null,
        rifaId: id,
        nombreRifa: rifa.nombre,
        imagenRifa: (rifa.imagenes && rifa.imagenes[0]) || null,
        precioBoleto: rifa.precio,
      };

      await addDoc(collection(db, "rifas", id, "ventas"), ventaData);
      
      await setCooldown(currentUser);

      setMostrarModalDatos(false);
      const tuNumeroDeWhatsApp = '527773367064';
      const nombreSorteo = rifa.nombre;
      const boletosTexto = boletosSeleccionados.map(n => formatTicketNumber(n, rifa.boletos)).join(', ');
      const totalAPagar = rifa.precio * boletosSeleccionados.length;
      const nombreCliente = `${datosDelFormulario.nombre} ${datosDelFormulario.apellidos || ''}`;
      let mensaje = `¡Hola! 👋 Quiero apartar mis boletos para el sorteo "${nombreSorteo}".\n\n*ID de Compra: ${idCompra}*\n\nMis números seleccionados son: *${boletosTexto}*.\nTotal a pagar: *$${totalAPagar.toLocaleString('es-MX')}*.\nMi nombre es: ${nombreCliente}.\n\nQuedo a la espera de las instrucciones para realizar el pago. ¡Tengo 12 horas para completarlo! Gracias.`;
      const waUrl = `https://wa.me/${tuNumeroDeWhatsApp}?text=${encodeURIComponent(mensaje)}`;
      window.open(waUrl, '_blank');
      limpiarSeleccion();
    } catch (error) {
      console.error("Error al apartar boletos:", error);
      setAlertaGeneral("Ocurrió un error al intentar apartar los boletos.");
    }
  };

  const cambiarImagen = (direccion) => {
    if (!rifa?.imagenes || rifa.imagenes.length < 2) return;
    setImagenIndex((prev) => (prev + direccion + rifa.imagenes.length) % rifa.imagenes.length);
  };

  if (cargandoRifa) return <div className="text-center py-40">Cargando sorteo...</div>;
  if (!rifa) return <div className="p-4 text-center"><p>Sorteo no encontrado.</p></div>;
  
  const boletosVendidos = rifa.boletosVendidos || 0;
  const porcentajeVendido = rifa.boletos > 0 ? (boletosVendidos / rifa.boletos) * 100 : 0;
  const conditionText = getDrawConditionText(rifa, 'detallado');
  const imagenActual = rifa.imagenes?.[imagenIndex] || rifa.imagen;
  const totalPaginas = Math.ceil(rifa.boletos / boletosPorPagina);
  const rangoInicio = (currentPage - 1) * boletosPorPagina;
  const rangoFin = Math.min(currentPage * boletosPorPagina, rifa.boletos);

  return (
    <div className="bg-background-dark">
      <div className="p-4 max-w-5xl mx-auto">
        {alertaGeneral && (
            <div className="my-4">
                <Alerta mensaje={alertaGeneral} tipo="advertencia" onClose={() => setAlertaGeneral('')}/>
            </div>
        )}
        <div className="bg-background-light border border-border-color rounded-lg shadow-lg p-6">
          <div className="md:flex md:gap-8 items-start">
            <div className="md:w-1/2">
              {imagenActual && (
                <div className="mb-4 relative group">
                  <img src={imagenActual} alt={rifa.nombre} className="w-full h-auto max-h-[450px] object-contain rounded-lg cursor-zoom-in mx-auto border border-border-color" onClick={() => setImagenAmpliadaIndex(imagenIndex)} />
                  {rifa.imagenes?.length > 1 && (
                    <>
                      <button onClick={() => cambiarImagen(-1)} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-background-dark/50 text-white p-2 rounded-full hover:bg-background-dark/80 transition opacity-0 group-hover:opacity-100">←</button>
                      <button onClick={() => cambiarImagen(1)} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-background-dark/50 text-white p-2 rounded-full hover:bg-background-dark/80 transition opacity-0 group-hover:opacity-100">→</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="md:w-1/2 mt-4 md:mt-0">
              <h2 className="text-3xl font-bold mb-2">{rifa.nombre}</h2>
              <p className="whitespace-pre-wrap text-text-subtle mb-3">{rifa.descripcion}</p>
              
              <div className="flex items-baseline mb-2">
                <p className="text-3xl font-bold">${rifa.precio.toLocaleString('es-MX')}</p>
                <span className="ml-2 text-base text-text-subtle">por boleto</span>
              </div>
              
              <div className="my-3 flex items-center gap-2">
                <strong className="text-md">Estado:</strong>
                <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold capitalize ${rifa.estado === "activa" ? "bg-success" : "bg-danger"}`}>{rifa.estado}</span>
              </div>
              <p className="text-sm text-text-subtle mb-4 italic">{conditionText}</p>
              {rifa.boletos > 0 && (
                <div className="mb-6 w-full">
                  <p className="text-sm font-medium mb-1">{porcentajeVendido.toFixed(1)}% Vendido</p>
                  <div className="w-full h-4 bg-background-dark border border-border-color rounded-full"><div className="bg-gradient-to-r from-accent-start to-accent-end h-full rounded-full" style={{ width: `${porcentajeVendido}%` }}></div></div>
                </div>
              )}
            </div>
          </div>
          <div className="text-center my-6 border-t border-border-color pt-6">
            <button onClick={() => setMostrarModalSuerte(true)} className="bg-gradient-to-r from-accent-start to-accent-end text-white px-8 py-3 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-accent-start/20 transition transform hover:scale-105">★ MÁQUINA DE LA SUERTE ★</button>
          </div>
          <div className="flex justify-center flex-wrap gap-4 text-sm my-4 p-2 bg-background-dark rounded-md border border-border-color">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div><span className="text-text-subtle">Disponible</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 border border-yellow-500 rounded-sm"></div><span className="text-text-subtle">Apartado</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 border border-red-700 rounded-sm"></div><span className="text-text-subtle">Pagado</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 border border-green-600 rounded-sm"></div><span className="text-text-subtle">Seleccionado</span></div>
          </div>
          <div className="flex flex-col items-center">
            <BuscadorBoletos totalBoletos={rifa.boletos} boletosOcupados={boletosOcupados} boletosSeleccionados={boletosSeleccionados} onSelectBoleto={seleccionarBoleto} />
            {boletosSeleccionados.length > 0 && ( 
              <div className="text-center my-4 p-4 bg-background-dark border border-border-color rounded-lg w-full max-w-lg animate-fade-in"> 
                <p className="font-bold mb-2">{boletosSeleccionados.length} BOLETO(S) SELECCIONADO(S)</p> 
                <div className="flex justify-center flex-wrap gap-2 mb-2"> 
                  {boletosSeleccionados.sort((a, b) => a - b).map((n) => ( <span key={n} onClick={() => toggleBoleto(n)} className="px-3 py-1 bg-success text-white rounded-md font-mono cursor-pointer hover:bg-danger" title="Haz clic para quitar">{formatTicketNumber(n, rifa.boletos)}</span> ))} 
                </div> 
                <p className="text-xs text-text-subtle italic my-2">Para eliminar un boleto, solo haz clic sobre él.</p> 
                <button onClick={limpiarSeleccion} className="mt-1 text-danger underline text-sm hover:text-red-400">Eliminar todos</button> 
                <div className="mt-4 pt-4 border-t border-border-color flex justify-center">
                  <button onClick={handleReservarPorWhatsapp} className="w-full sm:w-auto bg-success text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg">Apartar por WhatsApp</button>
                </div> 
              </div> 
            )}
            <div className="w-full max-w-lg text-center my-2">
              <button onClick={() => setFiltroDisponibles(!filtroDisponibles)} className="text-sm bg-background-light border border-border-color hover:bg-border-color font-semibold py-2 px-4 rounded-lg transition-colors"> 
                {filtroDisponibles ? 'Mostrar Todos los Boletos' : 'Mostrar Solo Disponibles'} 
              </button> 
            </div>
            <div className="flex justify-center items-center gap-4 my-4 w-full">
              <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-background-light border border-border-color font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"> Anterior </button>
              <span className="font-mono text-lg text-text-subtle"> Página {currentPage} de {totalPaginas} </span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPaginas} className="px-4 py-2 bg-background-light border border-border-color font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"> Siguiente </button>
            </div>
            {cargandoBoletos ? <p className="text-center py-10">Cargando boletos...</p> : 
              <SelectorBoletos 
                totalBoletos={rifa.boletos}
                boletosOcupados={boletosOcupados} 
                boletosSeleccionados={boletosSeleccionados} 
                onToggleBoleto={toggleBoleto} 
                filtroActivo={filtroDisponibles} 
                rangoInicio={rangoInicio} 
                rangoFin={rangoFin}
              /> 
            }
          </div>
        </div>
      </div>
      
      {mostrarModalDatos && <ModalDatosComprador onCerrar={() => setMostrarModalDatos(false)} onConfirmar={confirmarApartado} datosIniciales={datosPerfil} />}
      {mostrarModalSuerte && 
        <ModalMaquinaSuerte 
          totalBoletos={rifa.boletos} 
          boletosOcupados={boletosOcupados} 
          onCerrar={() => setMostrarModalSuerte(false)} 
          onSeleccionar={(numeros) => { 
            agregarBoletosEspecificos(numeros); 
            setMostrarModalSuerte(false); 
          }}
        />
      }
      {imagenAmpliadaIndex !== null && <ModalImagen imagenes={rifa.imagenes} indexInicial={imagenAmpliadaIndex} onClose={() => setImagenAmpliadaIndex(null)} />}
      {showInvitationModal && (
        <ModalInvitacionRegistro
          onClose={() => setShowInvitationModal(false)}
          onContinueAsGuest={handleContinueAsGuest}
        />
      )}
      {cooldownInfo.show && (
          <ModalCooldown 
              onClose={() => setCooldownInfo({ show: false, timeLeft: '' })}
              timeLeft={cooldownInfo.timeLeft}
          />
      )}
    </div>
  );
}

export default RifaDetalle;
