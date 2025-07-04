// src/pages/MiPerfilPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { getAuth, updatePassword, verifyBeforeUpdateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, collectionGroup, query, where, onSnapshot } from 'firebase/firestore';
// CORREGIDO: Ruta actualizada para la configuración de Firebase
import { db } from '../config/firebaseConfig';
import { Link } from 'react-router-dom';
import { formatTicketNumber } from '../utils/rifaHelper';
// CORREGIDO: Rutas actualizadas para los componentes
import ContadorRegresivo from '../components/ui/ContadorRegresivo';
import Avatar from '../components/ui/Avatar';
import FeedbackModal from '../components/modals/FeedbackModal';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaTelegramPlane, FaYoutube, FaUsers } from 'react-icons/fa';

// --- Iconos (sin cambios) ---
const HistorialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const DatosIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SeguridadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ChevronDownIcon = ({ isOpen }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 text-text-subtle transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>);
const PrivacyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 flex-shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

const SocialIcon = ({ href, title, icon: Icon, className }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-300 transform hover:scale-110 ${className}`}>
        <Icon size={22} />
    </a>
);

// CORREGIDO: Renombrado el componente para que coincida con el nombre del archivo
function MiPerfilPage() {
    const { currentUser, userData, updateUserData } = useAuth();
    const { datosGenerales, cargandoConfig } = useConfig();
    
    const [activeTab, setActiveTab] = useState('historial');
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [telefono, setTelefono] = useState('');
    const [estado, setEstado] = useState('');
    const [misCompras, setMisCompras] = useState([]);
    const [cargandoCompras, setCargandoCompras] = useState(true);
    const [openAccordionId, setOpenAccordionId] = useState(null);
    const [modalInfo, setModalInfo] = useState({ type: '', title: '', message: '' });
    const [newEmail, setNewEmail] = useState('');
    const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
    const [currentPasswordForPass, setCurrentPasswordForPass] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rifasData, setRifasData] = useState({});

    const displayName = userData?.nombre || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
    const photo = userData?.photoURL || currentUser?.photoURL;

    const generarMensajeSoporte = (compra) => {
        const totalBoletos = rifasData[compra.rifaId]?.boletos || 100;
        const boletosTexto = compra.numeros.map(n => formatTicketNumber(n, totalBoletos)).join(', ');
        
        let mensaje = `¡Hola! 👋 Tengo una consulta sobre mi compra para: "${compra.nombreRifa}".\n\n`;
        mensaje += `Mis números son: *${boletosTexto}*.\n`;
        mensaje += `Mi compra aún aparece como 'apartado' y me gustaría verificar el estado de mi pago. ¡Gracias!`;
        
        return encodeURIComponent(mensaje);
    };
    
    useEffect(() => {
        if (userData) {
            setNombre(userData.nombre || '');
            setApellidos(userData.apellidos || '');
            setTelefono(userData.telefono || '');
            setEstado(userData.estado || '');
        }
    }, [userData]);

    useEffect(() => {
        if (!currentUser || activeTab !== 'historial') return;

        setCargandoCompras(true);
        const q = query(collectionGroup(db, 'ventas'), where('userId', '==', currentUser.uid));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const comprasData = querySnapshot.docs.map(ventaDoc => ({ ...ventaDoc.data(), id: ventaDoc.id }));
            comprasData.sort((a, b) => (b.fechaApartado?.seconds || 0) - (a.fechaApartado?.seconds || 0));
            setMisCompras(comprasData);
            setCargandoCompras(false);
        }, (error) => {
            console.error("Error al obtener historial de compras:", error);
            setModalInfo({type: 'error', title: 'Error de Historial', message: 'No se pudo cargar tu historial de compras.'});
            setCargandoCompras(false);
        });

        return () => unsubscribe();
    }, [currentUser, activeTab]);

    useEffect(() => {
        if (misCompras.length === 0) return;
        const fetchRifaData = async () => {
            const rifaIdsUnicas = [...new Set(misCompras.map(c => c.rifaId))];
            const nuevasRifasData = {};
            
            const promises = rifaIdsUnicas.map(async (rifaId) => {
                if (!rifasData[rifaId]) {
                    try {
                        const rifaRef = doc(db, 'rifas', rifaId);
                        const rifaSnap = await getDoc(rifaRef);
                        if (rifaSnap.exists()) {
                            nuevasRifasData[rifaId] = rifaSnap.data();
                        }
                    } catch (error) {
                        console.error(`Error al cargar datos del sorteo ${rifaId}:`, error);
                    }
                }
            });
            
            await Promise.all(promises);

            if (Object.keys(nuevasRifasData).length > 0) {
                setRifasData(prev => ({ ...prev, ...nuevasRifasData }));
            }
        };
        fetchRifaData();
    }, [misCompras, rifasData]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setModalInfo({ type: '' });
        if (nombre === userData.nombre && apellidos === userData.apellidos && telefono === userData.telefono && estado === userData.estado) {
            setModalInfo({ type: 'advertencia', title: 'Sin Cambios', message: 'No has modificado ningún dato para guardar.' });
            return;
        }
        try {
            const userRef = doc(db, 'usuarios', currentUser.uid);
            const updatedData = { nombre, apellidos, telefono, estado };
            await updateDoc(userRef, updatedData);
            updateUserData(updatedData);
            setModalInfo({ type: 'exito', title: '¡Éxito!', message: 'Tus datos del perfil han sido actualizados.' });
        } catch (err) {
            console.error("Error al actualizar perfil:", err);
            setModalInfo({ type: 'error', title: 'Error', message: 'No se pudo actualizar tu perfil. Inténtalo de nuevo.' });
        }
    };
    
    const handleEmailUpdate = async (e) => {
        e.preventDefault();
        setModalInfo({ type: '' });
        if (!newEmail || !currentPasswordForEmail) {
            setModalInfo({ type: 'error', title: 'Campos Vacíos', message: 'Debes proporcionar el nuevo correo y tu contraseña actual.' });
            return;
        }
        const auth = getAuth();
        const user = auth.currentUser;
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPasswordForEmail);
            await reauthenticateWithCredential(user, credential);
            
            const userRef = doc(db, 'usuarios', currentUser.uid);
            await updateDoc(userRef, { email: newEmail });
            
            updateUserData({ email: newEmail });

            await verifyBeforeUpdateEmail(user, newEmail);
            
            setNewEmail('');
            setCurrentPasswordForEmail('');
            setModalInfo({ type: 'exito', title: 'Correo de Verificación Enviado', message: `Revisa la bandeja de entrada de ${newEmail} y haz clic en el enlace para completar el cambio.` });
        } catch (err) {
            console.error("Error al solicitar cambio de email:", err.code);
            let message = 'Ocurrió un error inesperado.';
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                message = 'La contraseña actual que ingresaste es incorrecta.';
            } else if (err.code === 'auth/email-already-in-use') {
                message = 'El nuevo correo electrónico ya está en uso por otra cuenta.';
            }
            setModalInfo({ type: 'error', title: 'Error al Cambiar Correo', message: message });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setModalInfo({ type: '' });
        if (!currentPasswordForPass || !newPassword || !confirmPassword) {
            setModalInfo({ type: 'error', title: 'Campos Vacíos', message: 'Por favor, completa todos los campos.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setModalInfo({ type: 'error', title: 'Error de Coincidencia', message: 'Las contraseñas nuevas no coinciden.' });
            return;
        }
        if (newPassword.length < 6) {
            setModalInfo({ type: 'error', title: 'Contraseña Corta', message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        const auth = getAuth();
        const user = auth.currentUser;
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPasswordForPass);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setCurrentPasswordForPass('');
            setNewPassword('');
            setConfirmPassword('');
            setModalInfo({ type: 'exito', title: '¡Éxito!', message: 'Tu contraseña ha sido actualizada correctamente.' });
        } catch (err) {
            console.error("Error al cambiar contraseña:", err);
            setModalInfo({ type: 'error', title: 'Error', message: 'Hubo un error al cambiar la contraseña. Verifica que tu contraseña actual sea correcta.' });
        }
    };

    if (!userData || cargandoConfig || !datosGenerales) { return <div className="min-h-screen text-center pt-20">Cargando perfil...</div>; }
    const isPasswordUser = currentUser.providerData.some(p => p.providerId === 'password');

    return (
        <>
            <FeedbackModal 
                type={modalInfo.type}
                title={modalInfo.title}
                message={modalInfo.message}
                onClose={() => setModalInfo({ type: '' })}
            />
            <div className="bg-background-dark min-h-screen">
                <div className="max-w-4xl mx-auto p-4 sm:p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto">
                            <Avatar 
                                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-background-light shadow-lg object-cover text-4xl"
                                photoURL={photo} 
                                name={displayName}
                            />
                        </div>
                        <h1 className="text-4xl font-bold">{displayName}</h1>
                        <p className="text-lg text-text-subtle">Bienvenido a tu panel personal</p>
                    </div>
                    
                    <div className="border-b border-border-color mb-8">
                        <nav className="flex justify-center -mb-px sm:space-x-6 space-x-2" aria-label="Tabs">
                            <button onClick={() => setActiveTab('historial')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors ${ activeTab === 'historial' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><HistorialIcon/> Mi Historial</button>
                            <button onClick={() => setActiveTab('datos')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors ${ activeTab === 'datos' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><DatosIcon/> Mis Datos</button>
                            {isPasswordUser && ( <button onClick={() => setActiveTab('seguridad')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors ${ activeTab === 'seguridad' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color' }`}><SeguridadIcon/> Seguridad</button> )}
                        </nav>
                    </div>
                    
                    <div className="animate-fade-in">
                        {activeTab === 'historial' && (
                            <div className="bg-background-light p-4 sm:p-6 rounded-xl shadow-lg border border-border-color">
                                <h2 className="text-2xl font-bold mb-6">Mi Historial de Boletos</h2>
                                {cargandoCompras ? <p className="text-center py-8 text-text-subtle">Cargando tu historial...</p> : misCompras.length === 0 ? <p className="text-text-subtle text-center py-8">Aún no has participado en ningún sorteo.</p> : (
                                    <div className="space-y-3">
                                        {misCompras.map(compra => {
                                            const rifaActual = rifasData[compra.rifaId];
                                            const totalBoletos = rifaActual?.boletos || 100;
                                            return (
                                                <div key={compra.id} className="border border-border-color rounded-lg overflow-hidden bg-background-dark">
                                                    <button 
                                                        className="w-full flex justify-between items-center p-4 text-left hover:bg-border-color/20 transition-colors"
                                                        onClick={() => setOpenAccordionId(openAccordionId === compra.id ? null : compra.id)}
                                                    >
                                                        <div className="flex-1 pr-4">
                                                            <p className="font-bold">{compra.nombreRifa}</p>
                                                            <p className="text-sm text-text-subtle">{compra.cantidad} boleto(s)</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${compra.estado === 'comprado' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                                                {compra.estado === 'comprado' ? 'Pagado' : 'Apartado'}
                                                            </span>
                                                            <ChevronDownIcon isOpen={openAccordionId === compra.id} />
                                                        </div>
                                                    </button>

                                                    {openAccordionId === compra.id && (
                                                        <div className="border-t border-border-color p-4 bg-background-dark/50 animate-fade-in">
                                                            <div className="flex flex-col sm:flex-row gap-4">
                                                                <img 
                                                                    src={compra.imagenRifa || `https://placehold.co/400x400/374151/9ca3af?text=S`}
                                                                    alt={compra.nombreRifa} 
                                                                    className="w-full sm:w-32 h-32 object-cover rounded-md"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="font-semibold mb-2">Números comprados:</p>
                                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                                        {compra.numeros.map(n => 
                                                                            <span key={n} className="bg-accent-primary/20 text-accent-primary px-3 py-1 rounded-full font-mono text-sm">
                                                                                {formatTicketNumber(n, totalBoletos)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-text-subtle mb-4">
                                                                        Fecha de compra: {compra.fechaApartado?.seconds ? new Date(compra.fechaApartado.seconds * 1000).toLocaleString('es-MX') : 'N/A'}
                                                                    </p>
                                                                    {rifaActual && rifaActual.estado === 'activa' && (
                                                                        <Link to={`/rifa/${compra.rifaId}`} className="text-sm font-semibold text-accent-primary hover:underline">
                                                                            Ir al Sorteo →
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            {compra.estado === 'apartado' && (
                                                                <div className="mt-4 pt-4 border-t border-dashed border-border-color">
                                                                    <div className="flex justify-center mb-4">
                                                                        <ContadorRegresivo fechaExpiracion={compra.fechaExpiracion} />
                                                                    </div>
                                                                    <p className="text-xs text-center text-text-subtle mb-4 italic max-w-md mx-auto">
                                                                        Si ya realizaste el pago, por favor espera a que un administrador lo confirme. El estado cambiará a 'Pagado'.
                                                                    </p>
                                                                    <div className="text-center mt-6">
                                                                        <p className="text-sm font-semibold mb-2">¿Necesitas ayuda con tu compra?</p>
                                                                        <div className="flex justify-center items-center flex-wrap gap-4">
                                                                            {datosGenerales.WhatsappPrincipal && datosGenerales.mostrarWhatsappContactoEnPerfil && <SocialIcon href={`https://wa.me/${datosGenerales.WhatsappPrincipal}?text=${generarMensajeSoporte(compra)}`} title="Contactar por WhatsApp" icon={FaWhatsapp} className="bg-[#25D366]"/>}
                                                                            {datosGenerales.urlFacebook && datosGenerales.mostrarFacebookEnPerfil && <SocialIcon href={datosGenerales.urlFacebook} title="Visita nuestro Facebook" icon={FaFacebook} className="bg-[#1877F2]"/>}
                                                                            {datosGenerales.urlInstagram && datosGenerales.mostrarInstagramEnPerfil && <SocialIcon href={datosGenerales.urlInstagram} title="Síguenos en Instagram" icon={FaInstagram} className="bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600"/>}
                                                                            {datosGenerales.urlTiktok && datosGenerales.mostrarTiktokEnPerfil && <SocialIcon href={datosGenerales.urlTiktok} title="Encuéntranos en TikTok" icon={FaTiktok} className="bg-black"/>}
                                                                            {datosGenerales.urlTelegram && datosGenerales.mostrarTelegramEnPerfil && <SocialIcon href={datosGenerales.urlTelegram} title="Contactar por Telegram" icon={FaTelegramPlane} className="bg-[#24A1DE]"/>}
                                                                            {datosGenerales.urlYoutube && datosGenerales.mostrarYoutubeEnPerfil && <SocialIcon href={datosGenerales.urlYoutube} title="YouTube" icon={FaYoutube} className="bg-[#FF0000]"/>}
                                                                            {datosGenerales.urlGrupoWhatsapp && datosGenerales.mostrarGrupoWhatsappEnPerfil && <SocialIcon href={datosGenerales.urlGrupoWhatsapp} title="Grupo de WhatsApp" icon={FaUsers} className="bg-[#25D366]"/>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'datos' && (
                            <div className="bg-background-light p-8 rounded-xl shadow-lg max-w-lg mx-auto border border-border-color">
                                <h2 className="text-2xl font-bold mb-6">Mis Datos</h2>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div><label className="block text-sm font-medium text-text-subtle">Correo Electrónico</label><input type="email" value={currentUser.email} disabled className="input-field mt-1 bg-background-dark/50 cursor-not-allowed"/></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="nombre" className="block text-sm font-medium text-text-subtle">Nombre(s)</label>
                                            <input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-field mt-1"/>
                                        </div>
                                        <div>
                                            <label htmlFor="apellidos" className="block text-sm font-medium text-text-subtle">Apellidos</label>
                                            <input id="apellidos" type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="input-field mt-1"/>
                                        </div>
                                    </div>
                                    <div><label htmlFor="telefono" className="block text-sm font-medium text-text-subtle">Teléfono</label><input id="telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="input-field mt-1"/></div>
                                    <div>
                                        <label htmlFor="estado" className="block text-sm font-medium text-text-subtle">Estado de Residencia</label>
                                        <input id="estado" type="text" value={estado} onChange={(e) => setEstado(e.target.value)} className="input-field mt-1"/>
                                    </div>
                                    <button type="submit" className="w-full mt-4 btn btn-primary">Guardar Cambios</button>
                                </form>
                                <div className="mt-6 p-3 bg-background-dark text-text-subtle rounded-lg text-sm flex items-start border border-border-color">
                                    <PrivacyIcon />
                                    <div>
                                        <span className="font-bold text-text-primary">Aviso de Privacidad:</span> Si resultas ganador, solo se mostrará tu primer nombre y la inicial de tu primer apellido en la galería pública (Ej. "Juan P.") para proteger tu identidad.
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'seguridad' && isPasswordUser && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-background-light p-8 rounded-xl shadow-lg border border-border-color">
                                    <h2 className="text-2xl font-bold mb-6">Cambiar Correo</h2>
                                    <form onSubmit={handleEmailUpdate} className="space-y-4">
                                        <div><label htmlFor="newEmail" className="block text-sm font-medium text-text-subtle">Nuevo Correo Electrónico</label><input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="input-field mt-1"/></div>
                                        <div><label htmlFor="currentPassword" className="block text-sm font-medium text-text-subtle">Contraseña Actual (para confirmar)</label><input id="currentPassword" type="password" value={currentPasswordForEmail} onChange={(e) => setCurrentPasswordForEmail(e.target.value)} required className="input-field mt-1"/></div>
                                        <button type="submit" className="w-full mt-4 btn btn-secondary">Actualizar Correo</button>
                                    </form>
                                </div>
                                <div className="bg-background-light p-8 rounded-xl shadow-lg border border-border-color">
                                    <h2 className="text-2xl font-bold mb-6">Cambiar Contraseña</h2>
                                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                        <div><label htmlFor="currentPassForPass" className="block text-sm font-medium text-text-subtle">Contraseña Actual</label><input id="currentPassForPass" type="password" value={currentPasswordForPass} onChange={(e) => setCurrentPasswordForPass(e.target.value)} required className="input-field mt-1"/></div>
                                        <div><label htmlFor="newPassword" className="block text-sm font-medium text-text-subtle">Nueva Contraseña</label><input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="input-field mt-1"/></div>
                                        <div><label htmlFor="confirmPassword" className="block text-sm font-medium text-text-subtle">Confirmar Nueva Contraseña</label><input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field mt-1"/></div>
                                        <button type="submit" className="w-full mt-4 btn btn-secondary">Actualizar Contraseña</button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// CORREGIDO: Exportamos el componente con el nuevo nombre
export default MiPerfilPage;
