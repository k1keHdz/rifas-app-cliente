import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useBoletos } from "../hooks/useBoletos";
import { useConfig } from "../context/ConfigContext";
import { usePurchaseCooldown } from "../hooks/usePurchaseCooldown";
import ModalDatosComprador from "../components/modals/ModalDatosComprador";
import ModalImagen from "../components/modals/ModalImagen";
import ModalMaquinaSuerte from "../components/modals/ModalMaquinaSuerte";
import ModalInvitacionRegistro from "../components/modals/ModalInvitacionRegistro";
import ModalCooldown from "../components/modals/ModalCooldown";
import SelectorBoletos from "../components/rifas/SelectorBoletos";
import BuscadorBoletos from "../components/rifas/BuscadorBoletos";
import Alerta from "../components/ui/Alerta";
import { getDrawConditionText, formatTicketNumber } from "../utils/rifaHelper";
import { FaExclamationTriangle, FaClock } from 'react-icons/fa';

function RifaDetallePage() {
    const { id: rifaId } = useParams();
    const { currentUser, userData, cargandoAuth } = useAuth();
    const { config, cargandoConfig } = useConfig();
    const { checkCooldown } = usePurchaseCooldown();

    const { 
        boletosSeleccionados,
        boletosOcupados,
        cargandoBoletos,
        toggleBoleto,
        limpiarSeleccion,
        agregarBoletosEspecificos,
        removerBoletos
    } = useBoletos(rifaId);

    const [conflictingTickets, setConflictingTickets] = useState([]);
    const [rifa, setRifa] = useState(null);
    const [cargandoRifa, setCargandoRifa] = useState(true);
    const [filtroDisponibles, setFiltroDisponibles] = useState(false);
    const [mostrarModalDatos, setMostrarModalDatos] = useState(false);
    const [mostrarModalSuerte, setMostrarModalSuerte] = useState(false);
    const [imagenIndex, setImagenIndex] = useState(0);
    const [imagenAmpliadaIndex, setImagenAmpliadaIndex] = useState(null);
    const [showInvitationModal, setShowInvitationModal] = useState(false);
    const [cooldownInfo, setCooldownInfo] = useState({ show: false, timeLeft: '' });
    
    // ===== SISTEMA DE ALERTA CORREGIDO =====
    // Volvemos a usar una alerta general, pero la mostraremos de forma fija.
    const [alerta, setAlerta] = useState({ show: false, message: '', type: 'info' });
    const alertaTimeoutRef = useRef(null);
    
    const location = useLocation();
    const selectionProcessed = useRef(false);

    // Función para mostrar la alerta y hacer que desaparezca
    const showAlert = useCallback((message, type = 'info', duration = 5000) => {
        if (alertaTimeoutRef.current) {
            clearTimeout(alertaTimeoutRef.current);
        }
        setAlerta({ show: true, message, type });
        alertaTimeoutRef.current = setTimeout(() => {
            setAlerta({ show: false, message: '', type: 'info' });
        }, duration);
    }, []);

    const handleToggleBoleto = useCallback((numero) => {
        toggleBoleto(numero);
    }, [toggleBoleto]);

    useEffect(() => {
        const nuevosConflictos = conflictingTickets.filter(ticket => boletosSeleccionados.includes(ticket));
        if (nuevosConflictos.length !== conflictingTickets.length) {
            setConflictingTickets(nuevosConflictos);
        }
    }, [boletosSeleccionados, conflictingTickets]);

    const handleModalClose = () => {
        setMostrarModalDatos(false);
    };

    const handleConflict = useCallback((conflictingTicketsFound) => {
        const ticketsAsNumbers = conflictingTicketsFound.map(Number);
        const boletosTexto = ticketsAsNumbers.map(n => formatTicketNumber(n, rifa.boletos)).join(', ');
        
        showAlert(`¡Atención! Los boletos ${boletosTexto} ya no están disponibles.`, 'advertencia');
        
        setConflictingTickets(ticketsAsNumbers);
        removerBoletos(ticketsAsNumbers);

    }, [rifa, removerBoletos, showAlert]);

    useEffect(() => {
        if (location.state?.boletoSeleccionado && !selectionProcessed.current && !cargandoBoletos) {
            const numero = Number(location.state.boletoSeleccionado);
            agregarBoletosEspecificos([numero]);
            selectionProcessed.current = true;
        }
    }, [location.state, cargandoBoletos, agregarBoletosEspecificos]);
    
    useEffect(() => {
        if (!rifaId) return;
        setCargandoRifa(true);
        const docRef = doc(db, "rifas", rifaId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().estado !== 'finalizado') { 
                setRifa({ id: docSnap.id, ...docSnap.data() });
            } else { 
                setRifa(null); 
            }
            setCargandoRifa(false);
        });
        return () => unsubscribe();
    }, [rifaId]);

    const handleReservarPorWhatsapp = async () => {
        if (boletosSeleccionados.length === 0) { 
            showAlert("Debes seleccionar al menos un boleto para continuar.", 'advertencia');
            return; 
        }
        if (cargandoConfig || !config) {
            showAlert("Cargando configuración, por favor espera un momento...", 'info');
            return;
        }
        const cooldownStatus = await checkCooldown(config, currentUser, userData);
        if (cooldownStatus.isOnCooldown) {
            setCooldownInfo({ show: true, timeLeft: cooldownStatus.timeLeft });
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
    };
    
    const cambiarImagen = (direccion) => {
        if (!rifa?.imagenes || rifa.imagenes.length < 2) return;
        setImagenIndex((prev) => (prev + direccion + rifa.imagenes.length) % rifa.imagenes.length);
    };

    if (cargandoRifa || cargandoConfig || cargandoBoletos || cargandoAuth) {
        return <div className="text-center py-40">Cargando sorteo...</div>;
    }

    if (!rifa) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">Sorteo no encontrado</h2>
                <p className="text-text-subtle mt-2">Este sorteo no existe o ya ha finalizado.</p>
                <Link to="/" className="mt-6 btn btn-primary">Volver al inicio</Link>
            </div>
        );
    }
    
    const isCompraActiva = rifa.estado === 'activa';
    const boletosVendidos = rifa.boletosVendidos || 0;
    const porcentajeVendido = rifa.boletos > 0 ? (boletosVendidos / rifa.boletos) * 100 : 0;
    const conditionText = getDrawConditionText(rifa, 'detallado');
    const imagenActual = rifa.imagenes?.[imagenIndex] || rifa.imagen;

    return (
        <div className="bg-background-dark">
            {/* ===== ALERTA FIJA Y VISIBLE ===== */}
            {alerta.show && (
                <div className="fixed top-0 left-0 right-0 z-[100] p-4 animate-fade-in-down">
                    <div className="max-w-5xl mx-auto">
                        <Alerta 
                            mensaje={alerta.message} 
                            tipo={alerta.type} 
                            onClose={() => setAlerta({ show: false, message: '', type: 'info' })} 
                        />
                    </div>
                </div>
            )}

            <div className="p-4 max-w-5xl mx-auto">
                {!isCompraActiva && (
                    <div className="mb-6 p-4 bg-warning/10 border border-warning/30 text-warning-text rounded-lg flex items-center gap-4">
                        <FaExclamationTriangle className="h-8 w-8 text-warning flex-shrink-0" />
                        <div>
                            <h3 className="font-bold">Este sorteo no está activo en este momento.</h3>
                            <p className="text-sm">Las compras se encuentran pausadas. ¡Vuelve pronto!</p>
                        </div>
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
                            <div className="mt-4 p-3 bg-background-dark rounded-lg border border-border-color flex items-center gap-3">
                                <FaClock className="text-accent-primary h-5 w-5 flex-shrink-0" />
                                <p className="text-sm text-text-subtle">
                                    Una vez que apartes tus boletos, tendrás 
                                    <span className="font-bold text-text-primary"> {config?.tiempoApartadoHoras || 24} horas </span> 
                                    para completar tu pago.
                                </p>
                            </div>
                            <div className="my-3 flex items-center gap-2">
                                <strong className="text-md">Estado:</strong>
                                <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold capitalize ${rifa.estado === "activa" ? "bg-success" : "bg-warning"}`}>{rifa.estado}</span>
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
                    {isCompraActiva && (
                        <>
                            <div className="text-center my-6 border-t border-border-color pt-6">
                                <button onClick={() => setMostrarModalSuerte(true)} className="bg-gradient-to-r from-accent-start to-accent-end text-white px-8 py-3 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-accent-start/20 transition transform hover:scale-105">★ MÁQUINA DE LA SUERTE ★</button>
                            </div>
                            <div className="flex justify-center flex-wrap gap-4 text-sm my-4 p-2 bg-background-dark rounded-md border border-border-color">
                                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div><span className="text-text-subtle">Disponible</span></div>
                                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 border border-yellow-500 rounded-sm"></div><span className="text-text-subtle">Apartado</span></div>
                                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 border border-red-700 rounded-sm"></div><span className="text-text-subtle">Pagado</span></div>
                                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 border border-green-600 rounded-sm"></div><span className="text-text-subtle">Seleccionado</span></div>
                            </div>
                        </>
                    )}
                    <div className="flex flex-col items-center">
                        {isCompraActiva && <BuscadorBoletos totalBoletos={rifa.boletos} boletosOcupados={boletosOcupados} boletosSeleccionados={boletosSeleccionados} onSelectBoleto={handleToggleBoleto} />}
                        {boletosSeleccionados.length > 0 && isCompraActiva && ( 
                            <div className="text-center my-4 p-4 bg-background-dark border border-border-color rounded-lg w-full max-w-lg animate-fade-in"> 
                                <p className="font-bold mb-2">{boletosSeleccionados.length} BOLETO(S) SELECCIONADO(S)</p> 
                                <div className="flex justify-center flex-wrap gap-2 mb-2"> 
                                    {boletosSeleccionados.sort((a, b) => a - b).map((n) => ( <span key={n} onClick={() => handleToggleBoleto(n)} className="px-3 py-1 bg-success text-white rounded-md font-mono cursor-pointer hover:bg-danger" title="Haz clic para quitar">{formatTicketNumber(n, rifa.boletos)}</span> ))} 
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
                        {cargandoBoletos ? <p className="text-center py-10">Cargando boletos...</p> : 
                            <SelectorBoletos 
                                totalBoletos={rifa.boletos}
                                boletosOcupados={boletosOcupados} 
                                boletosSeleccionados={boletosSeleccionados} 
                                conflictingTickets={conflictingTickets}
                                onToggleBoleto={handleToggleBoleto}
                                filtroActivo={filtroDisponibles} 
                                compraActiva={isCompraActiva}
                            /> 
                        }
                    </div>
                </div>
            </div>
            
            {mostrarModalDatos && <ModalDatosComprador 
                onClose={handleModalClose}
                onConflict={handleConflict}
                datosIniciales={userData}
                rifa={rifa}
                boletosSeleccionados={boletosSeleccionados}
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

export default RifaDetallePage;
