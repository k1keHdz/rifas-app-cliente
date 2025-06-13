// src/components/MiPerfil.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuth, updatePassword, verifyBeforeUpdateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, collectionGroup, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Link } from 'react-router-dom';
import ContadorRegresivo from './ContadorRegresivo';

// Iconos
const HistorialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const DatosIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SeguridadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ChevronDownIcon = ({ isOpen }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>);
const WhatsAppIcon = () => <svg viewBox="0 0 32 32" className="w-6 h-6"><path d=" M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.044-.53-.044a.765.765 0 0 0-.51.235c-.41.372-1.016 1.38-1.016 2.484s.281 3.58.91 4.098c.63.518 2.045 3.23 4.925 4.925 1.016.582 1.56.674 1.99.674.214 0 .487-.044.732-.214.582-.372.827-.85.91-1.094s.044-.674-.044-1.094c-.089-.419-.372-1.016-.6-.945z" fill="#43d854"></path><path d=" M16.035 32C7.195 32 0 24.82 0 16 0 7.18 7.195 0 16.035 0c8.84 0 16.035 7.18 16.035 16 0 8.82-7.195 16-16.035 16z" fill="none"></path></svg>;
const TelegramIcon = () => <svg viewBox="0 0 48 48" className="w-6 h-6"><path fill="#29a9ea" d="M42.7,4.2c-1.3-1.3-3.2-1.8-5-1.5L6,14.5c-3.5,0.6-5.4,4.2-3.8,7.4l6.6,12.2c1.6,2.9,5.4,4,8.5,2.4l5.1-2.7c0.8-0.4,1.8-0.4,2.6,0l7.8,4.7c3,1.8,6.8,0,7.8-3.3l5.5-18.1C50.2,7.9,47.2,3.2,42.7,4.2z M22.9,32.3c-0.6,0.6-1.6,0.7-2.3,0.3l-5.1-2.7c-1-0.5-2.2,0-2.7,1l-2.6,5.1c-0.8,1.6-2.9,1.9-4.1,0.6c-1.2-1.3-1.1-3.3,0.3-4.4l6.6-12.2c0.7-1.3,2.4-1.8,3.8-1.1l20.8,9.7c1.6,0.8,2,2.9,0.9,4.1L22.9,32.3z"></path></svg>;
const FacebookIcon = () => <svg viewBox="0 0 50 50" className="w-6 h-6"><path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z" fill="#3B5998"></path><path d="M34.5,46V30h5.5l0.8-6.4h-6.3v-4.1c0-1.8,0.5-3.1,3.1-3.1h3.3V11c-0.6-0.1-2.5-0.2-4.8-0.2c-4.8,0-8,2.9-8,8.3v4.7h-8v6.4h8V46H34.5z" fill="#FFFFFF"></path></svg>;


function MiPerfil() {
  const { currentUser, userData } = useAuth();
  
  const [activeTab, setActiveTab] = useState('historial');
  const [nombre, setNombre] = useState(userData?.nombre || '');
  const [telefono, setTelefono] = useState(userData?.telefono || '');
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [currentPasswordForPass, setCurrentPasswordForPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [misCompras, setMisCompras] = useState([]);
  const [cargandoCompras, setCargandoCompras] = useState(true);
  const [openAccordionId, setOpenAccordionId] = useState(null);
  
  const tuNumeroDeWhatsApp = '527773367064';
  const tuUsuarioDeTelegram = 'tu_usuario_tg';
  const tuPaginaDeFacebook = 'https://facebook.com/tu_pagina';

  const generarMensajeSoporte = (compra) => {
    const boletosTexto = compra.numeros.map(n => String(n).padStart(5, '0')).join(', ');
    let mensaje = `¡Hola! 👋 Tengo una consulta sobre mi compra para la rifa "${compra.nombreRifa}".\n\n`;
    mensaje += `Mis números son: *${boletosTexto}*.\n`;
    mensaje += `Mi compra aún aparece como 'apartado' y me gustaría verificar el estado de mi pago. ¡Gracias!`;
    return encodeURIComponent(mensaje);
  };

  useEffect(() => {
    if (!currentUser || activeTab !== 'historial') {
      return;
    }

    setCargandoCompras(true);
    
    const q = query(
      collectionGroup(db, 'ventas'), 
      where('userId', '==', currentUser.uid), 
      orderBy('fechaApartado', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const comprasData = querySnapshot.docs.map((ventaDoc) => ({
        ...ventaDoc.data(),
        id: ventaDoc.id,
      }));
      setMisCompras(comprasData);
      setCargandoCompras(false);
    }, (error) => {
      console.error("Error al obtener historial de compras en tiempo real:", error);
      setError("No se pudo cargar el historial de compras.");
      setCargandoCompras(false);
    });

    return () => unsubscribe();

  }, [currentUser, activeTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (nombre === userData.nombre && telefono === userData.telefono) {
      setMessage('No hay cambios para guardar.');
      return;
    }
    try {
      const userRef = doc(db, 'usuarios', currentUser.uid);
      await updateDoc(userRef, { nombre, telefono });
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

  if (!userData) { return <p className="text-center mt-20">Cargando perfil...</p>; }
  const isPasswordUser = currentUser.providerData.some(p => p.providerId === 'password');

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="text-center mb-8">
            <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.nombre)}&background=random&color=fff`} alt="Avatar" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"/>
            <h1 className="text-4xl font-bold text-gray-800">Hola, {userData.nombre}</h1>
            <p className="text-lg text-gray-600">Bienvenido a tu panel personal</p>
        </div>
        
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex justify-center -mb-px sm:space-x-6 space-x-2" aria-label="Tabs">
            <button onClick={() => setActiveTab('historial')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors ${ activeTab === 'historial' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}><HistorialIcon/> Mi Historial</button>
            <button onClick={() => setActiveTab('datos')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors ${ activeTab === 'datos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}><DatosIcon/> Mis Datos</button>
            {isPasswordUser && ( <button onClick={() => setActiveTab('seguridad')} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors ${ activeTab === 'seguridad' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}><SeguridadIcon/> Seguridad</button> )}
          </nav>
        </div>
        
        <div className="animate-fade-in">
          {activeTab === 'historial' && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Historial de Boletos</h2>
              {cargandoCompras ? <p className="text-center py-8">Cargando tu historial...</p> : misCompras.length === 0 ? <p className="text-gray-600 text-center py-8">Aún no has participado en ninguna rifa.</p> : (
                <div className="space-y-3">
                  {misCompras.map(compra => (
                    <div key={compra.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => setOpenAccordionId(openAccordionId === compra.id ? null : compra.id)}
                      >
                        <div className="flex-1 pr-4">
                          <p className="font-bold text-gray-800">{compra.nombreRifa}</p>
                          <p className="text-sm text-gray-500">{compra.cantidad} boleto(s)</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${compra.estado === 'comprado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {compra.estado}
                          </span>
                          <ChevronDownIcon isOpen={openAccordionId === compra.id} />
                        </div>
                      </button>

                      {openAccordionId === compra.id && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50 animate-fade-in">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <img 
                              src={compra.imagenRifa || `https://ui-avatars.com/api/?name=${encodeURIComponent(compra.nombreRifa || 'R')}&background=random&color=fff`} 
                              alt={compra.nombreRifa} 
                              className="w-full sm:w-32 h-32 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-700 mb-2">Números comprados:</p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {compra.numeros.map(n => <span key={n} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono text-sm">{String(n).padStart(5, '0')}</span>)}
                              </div>
                              <p className="text-xs text-gray-500 mb-4">
                                Fecha de compra: {compra.fechaApartado?.seconds ? new Date(compra.fechaApartado.seconds * 1000).toLocaleString('es-MX') : 'N/A'}
                              </p>
                              <Link to={`/rifa/${compra.rifaId}`} className="text-sm font-semibold text-blue-600 hover:underline">
                                Ir a la Rifa →
                              </Link>
                            </div>
                          </div>
                          
                          {compra.estado === 'apartado' && (
                            <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                              <div className="flex justify-center mb-4">
                                <ContadorRegresivo fechaExpiracion={compra.fechaExpiracion} />
                              </div>
                              <p className="text-xs text-center text-gray-600 mb-4 italic max-w-md mx-auto">
                                Si ya realizaste el pago, por favor espera a que un administrador lo confirme. El estado cambiará a 'Pagado'.
                              </p>
                              <div className="text-center mt-6">
                                <p className="text-sm font-semibold text-gray-700 mb-2">¿Necesitas ayuda con tu compra?</p>
                                <div className="flex justify-center items-center space-x-4">
                                  <a href={`https://wa.me/${tuNumeroDeWhatsApp}?text=${generarMensajeSoporte(compra)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"><WhatsAppIcon /></a>
                                  <a href={`https://t.me/${tuUsuarioDeTelegram}`} target="_blank" rel="noopener noreferrer" title="Telegram"><TelegramIcon /></a>
                                  <a href={tuPaginaDeFacebook} target="_blank" rel="noopener noreferrer" title="Facebook"><FacebookIcon /></a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'datos' && (
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Datos</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700">Correo Electrónico</label><input type="email" value={currentUser.email} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"/></div>
                <div><label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre Completo</label><input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/></div>
                <div><label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label><input id="telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/></div>
                <button type="submit" className="w-full mt-4 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Guardar Cambios</button>
              </form>
            </div>
          )}

          {activeTab === 'seguridad' && isPasswordUser && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cambiar Correo</h2>
                <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <div><label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">Nuevo Correo Electrónico</label><input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
                  <div><label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Contraseña Actual (para confirmar)</label><input id="currentPassword" type="password" value={currentPasswordForEmail} onChange={(e) => setCurrentPasswordForEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
                  <button type="submit" className="w-full mt-4 px-4 py-2 font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-800">Actualizar Correo</button>
                </form>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cambiar Contraseña</h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div><label htmlFor="currentPassForPass" className="block text-sm font-medium text-gray-700">Contraseña Actual</label><input id="currentPassForPass" type="password" value={currentPasswordForPass} onChange={(e) => setCurrentPasswordForPass(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
                  <div><label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nueva Contraseña</label><input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
                  <div><label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label><input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
                  <button type="submit" className="w-full mt-4 px-4 py-2 font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-800">Actualizar Contraseña</button>
                </form>
              </div>
            </div>
          )}
        </div>
        
        {(message || error) && (
          <div className="mt-6 text-center max-w-lg mx-auto">
            {message && <p className="text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md break-words">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default MiPerfil;