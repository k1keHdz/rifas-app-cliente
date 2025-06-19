// src/components/MiPerfil.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuth, updatePassword, verifyBeforeUpdateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, collectionGroup, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Link } from 'react-router-dom';
import { formatTicketNumber } from '../utils/rifaHelper';
import ContadorRegresivo from './ContadorRegresivo';
import Avatar from './Avatar';
import Alerta from './Alerta';

// --- Iconos ---
const HistorialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const DatosIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SeguridadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ChevronDownIcon = ({ isOpen }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 text-text-subtle transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>);
const PrivacyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 flex-shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

const SocialIcon = ({ href, title, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className="text-text-subtle hover:text-accent-primary transition-all duration-300 transform hover:scale-110">
        {children}
    </a>
);
const WhatsAppIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><path d="M11.999 2C6.486 2 2 6.486 2 12c0 1.63.393 3.183 1.11 4.576L2 22l5.424-1.11a9.944 9.944 0 0 0 4.575 1.11c5.513 0 9.999-4.486 9.999-9.999S17.512 2 11.999 2zM12 3.667c4.603 0 8.333 3.73 8.333 8.333S16.602 20.333 12 20.333a8.283 8.283 0 0 1-4.223-1.157l-.3-.18-3.122.64.65-3.05-.197-.314A8.282 8.282 0 0 1 3.667 12c0-4.603 3.73-8.333 8.333-8.333zm4.568 11.233c-.24-.12-.823-.406-1.012-.456s-.327-.076-.465.076c-.138.152-.38.456-.465.532-.086.076-.172.086-.31.01s-.58-.216-1.106-.682c-.407-.363-.678-.813-.756-.949s-.065-.216 0-.348c.058-.112.138-.282.207-.38.07-.107.094-.18.138-.3s.022-.227-.022-.317c-.044-.09-.465-1.114-.638-1.525-.172-.41-.345-.355-.465-.355h-.402c-.138 0-.35.044-.532.18s-.696.678-.696 1.652c0 .973.714 1.914.81 2.04.1.125 1.4 2.24 3.39 3.003.49.193.877.308 1.18.393.42.118.804.102 1.1-.015.328-.12.823-.5.94-.678s.216-.402.152-.465c-.065-.064-.24-.12-.48-.24z" fill="currentColor"/></svg>;
const TelegramIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zM18 7.898l-1.834 8.572c-.18.834-.683 1.034-1.35.638l-2.658-1.954-1.284 1.238c-.14.14-.258.258-.518.258l.18-2.722 4.88-4.426c.21-.18-.048-.288-.327-.12L8.214 13.39l-2.61-.813c-.85-.267-.87-1.04.18-1.538l9.648-3.74c.73-.284 1.37.18 1.116 1.15z" fill="currentColor"/></svg>;

function MiPerfil() {
  const { currentUser, userData } = useAuth();
  
  const [activeTab, setActiveTab] = useState('historial');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [misCompras, setMisCompras] = useState([]);
  const [cargandoCompras, setCargandoCompras] = useState(true);
  const [openAccordionId, setOpenAccordionId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [currentPasswordForPass, setCurrentPasswordForPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totalesRifas, setTotalesRifas] = useState({});

  const tuNumeroDeWhatsApp = '527773367064';
  const tuUsuarioDeTelegram = 'tu_usuario_tg';
  
  const displayName = userData?.nombre || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
  const photo = userData?.photoURL || currentUser?.photoURL;

  const generarMensajeSoporte = (compra) => {
    const totalBoletos = totalesRifas[compra.rifaId] || 100;
    const boletosTexto = compra.numeros.map(n => formatTicketNumber(n, totalBoletos)).join(', ');
    
    let mensaje = `¡Hola! 👋 Tengo una consulta sobre mi compra para el sorteo "${compra.nombreRifa}".\n\n`;
    mensaje += `Mis números son: *${boletosTexto}*.\n`;
    mensaje += `Mi compra aún aparece como 'apartado' y me gustaría verificar el estado de mi pago. ¡Gracias!`;
    
    return encodeURIComponent(mensaje);
  };

  useEffect(() => {
    if (userData) {
      setNombre(userData.nombre || '');
      setApellidos(userData.apellidos || '');
      setTelefono(userData.telefono || '');
    }
  }, [userData]);

  useEffect(() => {
    if (!currentUser || activeTab !== 'historial') return;

    setCargandoCompras(true);
    const q = query(
      collectionGroup(db, 'ventas'), 
      where('userId', '==', currentUser.uid), 
      orderBy('fechaApartado', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const comprasData = querySnapshot.docs.map(ventaDoc => ({
        ...ventaDoc.data(),
        id: ventaDoc.id,
      }));
      setMisCompras(comprasData);
    }, (error) => {
      console.error("Error al obtener historial de compras:", error);
      setError("No se pudo cargar el historial de compras.");
      setCargandoCompras(false);
    });

    return () => unsubscribe();
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (misCompras.length === 0) {
        setCargandoCompras(false);
        return;
    }

    const fetchRifaData = async () => {
        const rifaIds = [...new Set(misCompras.map(c => c.rifaId))];
        const nuevosTotales = {};
        
        for (const rifaId of rifaIds) {
            if (!totalesRifas[rifaId]) {
                try {
                    const rifaRef = doc(db, 'rifas', rifaId);
                    const rifaSnap = await getDoc(rifaRef);
                    if (rifaSnap.exists()) {
                        nuevosTotales[rifaId] = rifaSnap.data().boletos;
                    }
                } catch (error) {
                    console.error(`Error al cargar datos del sorteo ${rifaId}:`, error);
                }
            }
        }
        
        if (Object.keys(nuevosTotales).length > 0) {
            setTotalesRifas(prev => ({ ...prev, ...nuevosTotales }));
        }
        setCargandoCompras(false);
    };

    fetchRifaData();
  }, [misCompras, totalesRifas]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (nombre === userData.nombre && apellidos === userData.apellidos && telefono === userData.telefono) {
      setMessage('No hay cambios para guardar.');
      return;
    }
    try {
      const userRef = doc(db, 'usuarios', currentUser.uid);
      await updateDoc(userRef, { nombre, apellidos, telefono });
      setMessage('¡Datos del perfil actualizados con éxito!');
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setError('No se pudo actualizar el perfil.');
    }
  };
  
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newEmail || !currentPasswordForEmail) {
      setError('Debes proporcionar el nuevo correo y tu contraseña actual.');
      return;
    }
    const auth = getAuth();
    const user = auth.currentUser;
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPasswordForEmail);
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail);
      setNewEmail('');
      setCurrentPasswordForEmail('');
      setMessage('¡Verificación enviada! Revisa la bandeja de entrada de tu nuevo correo (' + newEmail + ') y haz clic en el enlace para completar el cambio.');
    } catch (err) {
      console.error("Error al solicitar cambio de email:", err.code);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('La contraseña actual que ingresaste es incorrecta.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('El nuevo correo electrónico ya está en uso por otra cuenta.');
      } else {
        setError('Ocurrió un error inesperado. Verifica que tu conexión y los datos sean correctos.');
      }
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!currentPasswordForPass || !newPassword || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
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
      setMessage('¡Contraseña actualizada con éxito!');
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Hubo un error al cambiar la contraseña. Inténtalo de nuevo.');
      }
    }
  };

  if (!userData) { return <div className="min-h-screen text-center pt-20">Cargando perfil...</div>; }
  const isPasswordUser = currentUser.providerData.some(p => p.providerId === 'password');

  return (
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
                    const totalBoletos = totalesRifas[compra.rifaId] || 100;
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
                                <Link to={`/rifa/${compra.rifaId}`} className="text-sm font-semibold text-accent-primary hover:underline">
                                  Ir al Sorteo →
                                </Link>
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
                                  <div className="flex justify-center items-center space-x-6 text-text-subtle">
                                    <SocialIcon href={`https://wa.me/${tuNumeroDeWhatsApp}?text=${generarMensajeSoporte(compra)}`} title="Contactar por WhatsApp"><WhatsAppIcon/></SocialIcon>
                                    <SocialIcon href={`https://t.me/${tuUsuarioDeTelegram}`} title="Contactar por Telegram"><TelegramIcon/></SocialIcon>
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
        
        {(message || error) && (
          <div className="mt-6 text-center max-w-lg mx-auto">
            {message && <Alerta mensaje={message} tipo="exito" onClose={() => setMessage('')} />}
            {error && <Alerta mensaje={error} tipo="error" onClose={() => setError('')} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default MiPerfil;
