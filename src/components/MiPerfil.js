// src/components/MiPerfil.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuth, updatePassword, verifyBeforeUpdateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, collectionGroup, query, where, getDocs, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Link } from 'react-router-dom';

// Iconos SVG para las pestañas
const HistorialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const DatosIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SeguridadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

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

  useEffect(() => {
    const fetchMisCompras = async () => {
      if (!currentUser) return;
      
      setCargandoCompras(true);
      setError('');
      
      try {
        const q = query(collectionGroup(db, 'ventas'), where('userId', '==', currentUser.uid), orderBy('fechaApartado', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const comprasPromises = querySnapshot.docs.map(async (ventaDoc) => {
          const ventaData = ventaDoc.data();
          const rifaId = ventaDoc.ref.parent.parent.id;
          const rifaRef = doc(db, 'rifas', rifaId);
          const rifaSnap = await getDoc(rifaRef);
          
          return {
            ...ventaData,
            id: ventaDoc.id,
            nombreRifa: rifaSnap.exists() ? rifaSnap.data().nombre : "Rifa ya no disponible",
            rifaId: rifaId,
          };
        });

        const comprasResueltas = await Promise.all(comprasPromises);
        setMisCompras(comprasResueltas);

      } catch (err) {
        console.error("Error al obtener historial de compras:", err);
        setError("No se pudo cargar el historial de compras. Si el problema persiste, puede que falte un índice en Firestore. Revisa la consola (F12) para ver el enlace de creación.");
      }
      setCargandoCompras(false);
    };

    if (activeTab === 'historial') {
      fetchMisCompras();
    }
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
        setError('La contraseña actual que ingresaste es incorrecta.');
      } else {
        setError('Hubo un error al cambiar la contraseña. Inténtalo de nuevo.');
      }
    }
  };

  if (!userData) { return <p className="text-center mt-20">Cargando perfil...</p>; }
  const isPasswordUser = currentUser.providerData.some(p => p.providerId === 'password');

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 sm:p-8">
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
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi Historial de Boletos</h2>
              {cargandoCompras ? <p>Cargando tu historial...</p> : misCompras.length === 0 ? <p className="text-gray-600">Aún no has participado en ninguna rifa.</p> : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {misCompras.map(compra => (
                    <div key={compra.id} className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-bold text-lg text-gray-800">{compra.nombreRifa}</p>
                        <p className="text-sm text-gray-600">Números: <span className="font-mono">{compra.numeros.map(n => String(n).padStart(5, '0')).join(', ')}</span></p>
                        <p className="text-xs text-gray-500">Fecha: {new Date(compra.fechaApartado.seconds * 1000).toLocaleString('es-MX')}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-3 sm:mt-0 self-end sm:self-center">
                        <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${compra.estado === 'comprado' ? 'bg-red-600' : 'bg-yellow-500'}`}>{compra.estado}</span>
                        <Link to={`/rifas/${compra.rifaId}`} className="text-sm text-blue-600 hover:underline whitespace-nowrap">Ir a la Rifa</Link>
                      </div>
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