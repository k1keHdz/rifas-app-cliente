// src/components/RifaDetalle.js

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// CAMBIO: Se añadió 'onSnapshot' a la lista de importaciones
import { doc, getDoc, collection, addDoc, serverTimestamp, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from '../context/AuthContext';
import { useBoletos } from "../hooks/useBoletos";

// Componentes
import ModalImagen from "./ModalImagen";
import SelectorBoletos from "./SelectorBoletos";
import ModalMaquinaSuerte from "./ModalMaquinaSuerte";
import BuscadorBoletos from "./BuscadorBoletos";
import ModalDatosComprador from "./ModalDatosComprador";
import { getDrawConditionText } from "../utils/rifaHelper";

function RifaDetalle() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  
  const [rifa, setRifa] = useState(null);
  const [cargandoRifa, setCargandoRifa] = useState(true);
  const [datosPerfil, setDatosPerfil] = useState({});
  const [modoCompra, setModoCompra] = useState(null);
  const [filtroDisponibles, setFiltroDisponibles] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [boletosPorPagina] = useState(500);

  const [mostrarModalDatos, setMostrarModalDatos] = useState(false);
  const [mostrarModalSuerte, setMostrarModalSuerte] = useState(false);
  const [imagenIndex, setImagenIndex] = useState(0);
  const [imagenAmpliadaIndex, setImagenAmpliadaIndex] = useState(null);

  const {
    boletosOcupados, boletosSeleccionados, cargandoBoletos, toggleBoleto,
    seleccionarBoleto, limpiarSeleccion, agregarMultiplesBoletos,
  } = useBoletos(id);

  useEffect(() => {
    setCargandoRifa(true);
    const docRef = doc(db, "rifas", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setRifa({ id: docSnap.id, ...docSnap.data() });
      } else {
        setRifa(null);
      }
      setCargandoRifa(false);
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (currentUser) {
      const fetchUserProfile = async () => {
        const userRef = doc(db, 'usuarios', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setDatosPerfil(docSnap.data());
        }
      };
      fetchUserProfile();
    } else {
      setDatosPerfil({});
    }
  }, [currentUser]);

  const handleApartar = () => {
    if (boletosSeleccionados.length === 0) return alert("Selecciona boletos primero.");
    if (boletosSeleccionados.length > 10) return alert("Máximo 10 boletos para apartar.");
    setModoCompra('apartar');
    setMostrarModalDatos(true);
  };

  const handleComprar = () => {
    if (boletosSeleccionados.length === 0) return alert("Selecciona boletos primero.");
    setModoCompra('comprar');
    setMostrarModalDatos(true);
  };

  const confirmarApartado = async (datosDelFormulario) => {
    const boletosYaComprados = boletosSeleccionados.filter(b => boletosOcupados.has(b));
    if (boletosYaComprados.length > 0) {
      alert(`¡Error! El/los boleto(s) ${boletosYaComprados.join(', ')} ya fue(ron) comprado(s) mientras decidías. La página se refrescará.`);
      window.location.reload();
      return;
    }

    try {
      const ventaData = {
        comprador: datosDelFormulario,
        numeros: boletosSeleccionados,
        cantidad: boletosSeleccionados.length,
        estado: 'apartado',
        fechaApartado: serverTimestamp(),
        fechaExpiracion: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        userId: currentUser ? currentUser.uid : null,
      };
      
      await addDoc(collection(db, "rifas", id, "ventas"), ventaData);
      
      setMostrarModalDatos(false);
      
      if (modoCompra === 'comprar') {
        const tuNumeroDeWhatsApp = '527773367064';

        const nombreRifa = rifa.nombre;
        const boletosTexto = boletosSeleccionados.map(n => String(n).padStart(5, '0')).join(', ');
        const totalAPagar = rifa.precio * boletosSeleccionados.length;
        const nombreCliente = datosDelFormulario.nombre;

        let mensaje = `¡Hola! 👋 Me interesa comprar boletos para la rifa "${nombreRifa}".\n\n`;
        mensaje += `Mis números seleccionados son: *${boletosTexto}*.\n`;
        mensaje += `Total a pagar: *$${totalAPagar.toLocaleString('es-MX')}*.\n`;
        mensaje += `Mi nombre es: ${nombreCliente}.\n\n`;
        mensaje += `Quedo a la espera de las instrucciones para realizar el pago. ¡Gracias!`;

        const waUrl = `https://wa.me/${tuNumeroDeWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        
        window.open(waUrl, '_blank');
        limpiarSeleccion();

      } else {
        alert("¡Boletos apartados con éxito por 24 horas!");
        limpiarSeleccion();
      }

    } catch (error) {
      console.error("Error al apartar boletos:", error);
      alert("Ocurrió un error al intentar apartar los boletos.");
    }
  };

  const cambiarImagen = (direccion) => {
    if (!rifa?.imagenes || rifa.imagenes.length < 2) return;
    setImagenIndex((prev) => (prev + direccion + rifa.imagenes.length) % rifa.imagenes.length);
  };

  if (cargandoRifa) return <p className="text-center mt-20">Cargando rifa...</p>;
  if (!rifa) return <div className="p-4 text-center"><p>Rifa no encontrada.</p></div>;
  
  const boletosVendidos = rifa.boletosVendidos || 0;
  const porcentajeVendido = rifa.boletos > 0 ? (boletosVendidos / rifa.boletos) * 100 : 0;
  const conditionText = getDrawConditionText(rifa);
  const imagenActual = rifa.imagenes?.[imagenIndex] || rifa.imagen;
  const paddingLength = 5;

  const totalPaginas = Math.ceil(rifa.boletos / boletosPorPagina);
  const rangoFin = currentPage * boletosPorPagina;
  const rangoInicio = rangoFin - boletosPorPagina;

  return (
    <>
      <div className="p-4 max-w-5xl mx-auto">
        <Link to="/rifas" className="text-blue-600 underline block mb-4">← Volver a rifas</Link>
        <div className="bg-white rounded shadow-lg p-6">
          
          <div className="md:flex md:gap-8 items-start">
            <div className="md:w-1/2">
              {imagenActual && (
                <div className="mb-4 relative">
                  <img src={imagenActual} alt={rifa.nombre} className="w-full h-auto max-h-[450px] object-contain rounded-lg cursor-zoom-in mx-auto" onClick={() => setImagenAmpliadaIndex(imagenIndex)} />
                  {rifa.imagenes?.length > 1 && (
                    <>
                      <button onClick={() => cambiarImagen(-1)} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition">←</button>
                      <button onClick={() => cambiarImagen(1)} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition">→</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="md:w-1/2 mt-4 md:mt-0">
              <h2 className="text-3xl font-bold mb-2">{rifa.nombre}</h2>
              <p className="text-gray-700 mb-3">{rifa.descripcion}</p>
              <p className="text-2xl font-bold mb-2 text-blue-600">${rifa.precio.toLocaleString('es-MX')}</p>
              <div className="my-3 flex items-center gap-2">
                <strong className="text-md">Estado:</strong>
                <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold capitalize ${rifa.estado === "activa" ? "bg-green-500" : "bg-red-500"}`}>{rifa.estado}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 italic">{conditionText}</p>
              
              {rifa.boletos > 0 && (
                <div className="mb-6 w-full">
                  <p className="text-sm font-medium mb-1 text-gray-700">{porcentajeVendido.toFixed(1)}% Vendido</p>
                  <div className="w-full h-4 bg-gray-200 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{ width: `${porcentajeVendido}%` }}></div></div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center my-6 border-t pt-6">
            <button onClick={() => setMostrarModalSuerte(true)} className="bg-blue-800 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition shadow-md">★ MÁQUINA DE LA SUERTE ★</button>
          </div>

          <div className="flex justify-center flex-wrap gap-4 text-sm my-4 p-2 bg-gray-50 rounded-md">
            <div className="flex items-center gap-1"><div className="w-4 h-4 bg-white border border-gray-400 rounded-sm"></div> Disponible</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 bg-yellow-400 border border-gray-400 rounded-sm"></div> Apartado</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 bg-red-600 rounded-sm"></div> Comprado</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 bg-green-600 rounded-sm"></div> Seleccionado</div>
          </div>
          
          <div className="flex flex-col items-center">
             <BuscadorBoletos totalBoletos={rifa.boletos} boletosOcupados={boletosOcupados} boletosSeleccionados={boletosSeleccionados} onSelectBoleto={seleccionarBoleto} />
             {boletosSeleccionados.length > 0 && ( <div className="text-center my-4 p-4 bg-gray-50 border rounded-lg w-full max-w-lg animate-fade-in"> <p className="font-bold mb-2 text-gray-800">{boletosSeleccionados.length} BOLETO(S) SELECCIONADO(S)</p> <div className="flex justify-center flex-wrap gap-2 mb-2"> {boletosSeleccionados.sort((a, b) => a - b).map((n) => ( <span key={n} onClick={() => toggleBoleto(n)} className="px-3 py-1 bg-green-600 text-white rounded-md font-mono cursor-pointer hover:bg-red-600" title="Haz clic para quitar">{String(n).padStart(paddingLength, "0")}</span> ))} </div> <p className="text-xs text-gray-500 italic my-2">Para eliminar un boleto, solo haz clic sobre él.</p> <button onClick={limpiarSeleccion} className="mt-1 text-red-600 underline text-sm hover:text-red-800">Eliminar todos</button> <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-center gap-3"> <button onClick={handleApartar} className="w-full sm:w-auto bg-yellow-500 text-black font-semibold px-4 py-2 rounded-md hover:bg-yellow-600 transition shadow-sm text-sm">Solo Apartar (Máx. 10)</button> <button onClick={handleComprar} className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm text-sm">Comprar Ahora</button> </div> </div> )}
             <div className="w-full max-w-lg text-center my-2"> <button onClick={() => setFiltroDisponibles(!filtroDisponibles)} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"> {filtroDisponibles ? 'Mostrar Todos los Boletos' : 'Mostrar Solo Disponibles'} </button> </div>
             <div className="flex justify-center items-center gap-4 my-4 w-full"> <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"> Anterior </button> <span className="font-mono text-lg"> Página {currentPage} de {totalPaginas} </span> <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPaginas} className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"> Siguiente </button> </div>
             {cargandoBoletos ? <p className="text-center py-10">Cargando boletos...</p> : <SelectorBoletos boletosOcupados={boletosOcupados} boletosSeleccionados={boletosSeleccionados} onToggleBoleto={toggleBoleto} filtroActivo={filtroDisponibles} rangoInicio={rangoInicio} rangoFin={Math.min(rangoFin, rifa.boletos)} /> }
          </div>
        </div>
      </div>
      
      {imagenAmpliadaIndex !== null && <ModalImagen imagenes={rifa.imagenes} indexInicial={imagenAmpliadaIndex} onClose={() => setImagenAmpliadaIndex(null)} />}
      {mostrarModalSuerte && <ModalMaquinaSuerte totalBoletos={rifa.boletos} boletosOcupados={boletosOcupados} onCerrar={() => setMostrarModalSuerte(false)} onSeleccionar={(numeros) => { agregarMultiplesBoletos(numeros); setMostrarModalSuerte(false); }} />}
      {mostrarModalDatos && <ModalDatosComprador onCerrar={() => setMostrarModalDatos(false)} onConfirmar={confirmarApartado} datosIniciales={datosPerfil} />}
    </>
  );
}

export default RifaDetalle;