// src/components/RifaDetalle.js

import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from '../context/AuthContext';
import { useBoletos } from "../hooks/useBoletos";
import { useConfig } from "../context/ConfigContext";
import ModalDatosComprador from "../components/ModalDatosComprador";
import ModalImagen from "../components/ModalImagen";
import SelectorBoletos from "../components/SelectorBoletos";
import ModalMaquinaSuerte from "../components/ModalMaquinaSuerte";
import BuscadorBoletos from "../components/BuscadorBoletos";
import { getDrawConditionText, formatTicketNumber } from "../utils/rifaHelper";
import ModalInvitacionRegistro from "../components/ModalInvitacionRegistro";
import Alerta from "../components/Alerta";
import ModalCooldown from "../components/ModalCooldown";

function RifaDetalle() {
    const { id: rifaId } = useParams();
    const { currentUser, userData } = useAuth();
    const { config, cargandoConfig } = useConfig();
    
    const { 
        boletosSeleccionados, setBoletosSeleccionados, toggleBoleto, limpiarSeleccion,
        agregarBoletosEspecificos 
    } = useBoletos();

    const [boletosOcupados, setBoletosOcupados] = useState(new Map());
    const [cargandoBoletos, setCargandoBoletos] = useState(true);

    const [rifa, setRifa] = useState(null);
    const [cargandoRifa, setCargandoRifa] = useState(true);
    const [datosPerfil, setDatosPerfil] = useState({});
    const [filtroDisponibles, setFiltroDisponibles] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [boletosPorPagina] = useState(5000);
    const [mostrarModalDatos, setMostrarModalDatos] = useState(false);
    const [mostrarModalSuerte, setMostrarModalSuerte] = useState(false);
    const [imagenIndex, setImagenIndex] = useState(0);
    const [imagenAmpliadaIndex, setImagenAmpliadaIndex] = useState(null);
    const [showInvitationModal, setShowInvitationModal] = useState(false);
    const [cooldownInfo, setCooldownInfo] = useState({ show: false, timeLeft: '' });
    const [alertaGeneral, setAlertaGeneral] = useState('');
    
    const location = useLocation();
    const selectionProcessed = useRef(false);

    useEffect(() => {
        if (!rifaId) return;

        setCargandoBoletos(true);
        const ventasRef = collection(db, 'rifas', rifaId, 'ventas');
        const q = query(ventasRef, where("estado", "in", ["comprado", "apartado"]));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ocupados = new Map();
            snapshot.forEach((doc) => {
                const venta = doc.data();
                if (venta.numeros && venta.estado) {
                    venta.numeros.forEach(num => ocupados.set(Number(num), venta.estado));
                }
            });
            setBoletosOcupados(ocupados);
            setCargandoBoletos(false);
        }, (error) => {
            console.error("[RifaDetalle] Error en listener de Firestore:", error);
            setCargandoBoletos(false);
        });

        return () => unsubscribe();
    }, [rifaId]);

    useEffect(() => {
        if (location.state?.boletoSeleccionado && !selectionProcessed.current && !cargandoBoletos) {
            const numero = Number(location.state.boletoSeleccionado);
            if (!boletosOcupados.has(numero) && !boletosSeleccionados.includes(numero)) {
                agregarBoletosEspecificos([numero]);
            }
            selectionProcessed.current = true;
        }
    }, [location.state, cargandoBoletos, boletosOcupados, boletosSeleccionados, agregarBoletosEspecificos]);
    
    useEffect(() => {
        setCargandoRifa(true);
        const docRef = doc(db, "rifas", rifaId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) { setRifa({ id: docSnap.id, ...docSnap.data() }); } 
            else { setRifa(null); }
            setCargandoRifa(false);
        });
        return () => unsubscribe();
    }, [rifaId]);

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
        if (cargandoConfig || !config) {
            setAlertaGeneral("Cargando configuración, por favor espera un momento...");
            return;
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
    
    const cambiarImagen = (direccion) => {
        if (!rifa?.imagenes || rifa.imagenes.length < 2) return;
        setImagenIndex((prev) => (prev + direccion + rifa.imagenes.length) % rifa.imagenes.length);
    };

    if (cargandoRifa || cargandoConfig || cargandoBoletos) return <div className="text-center py-40">Cargando sorteo...</div>;
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
                        <BuscadorBoletos totalBoletos={rifa.boletos} boletosOcupados={boletosOcupados} boletosSeleccionados={boletosSeleccionados} onSelectBoleto={(num) => toggleBoleto(num, boletosOcupados)} />
                        {boletosSeleccionados.length > 0 && ( 
                            <div className="text-center my-4 p-4 bg-background-dark border border-border-color rounded-lg w-full max-w-lg animate-fade-in"> 
                                <p className="font-bold mb-2">{boletosSeleccionados.length} BOLETO(S) SELECCIONADO(S)</p> 
                                <div className="flex justify-center flex-wrap gap-2 mb-2"> 
                                    {boletosSeleccionados.sort((a, b) => a - b).map((n) => ( <span key={n} onClick={() => toggleBoleto(n, boletosOcupados)} className="px-3 py-1 bg-success text-white rounded-md font-mono cursor-pointer hover:bg-danger" title="Haz clic para quitar">{formatTicketNumber(n, rifa.boletos)}</span> ))} 
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
                                onToggleBoleto={(num) => toggleBoleto(num, boletosOcupados)} 
                                filtroActivo={filtroDisponibles} 
                                rangoInicio={rangoInicio} 
                                rangoFin={rangoFin}
                            /> 
                        }
                    </div>
                </div>
            </div>
            
            {mostrarModalDatos && <ModalDatosComprador 
                onCerrar={() => setMostrarModalDatos(false)} 
                datosIniciales={datosPerfil}
                rifa={rifa}
                boletosSeleccionados={boletosSeleccionados}
                boletosOcupados={boletosOcupados}
                limpiarSeleccion={limpiarSeleccion}
            />}
            {mostrarModalSuerte && 
                <ModalMaquinaSuerte 
                    totalBoletos={rifa.boletos} 
                    boletosOcupados={boletosOcupados}
                    boletosYaSeleccionados={boletosSeleccionados}
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
