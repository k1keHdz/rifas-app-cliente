// src/pages/RegistroPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
// CORREGIDO: Ruta actualizada para la configuración de Firebase
import { db } from '../config/firebaseConfig';
// CORREGIDO: Ruta actualizada para el componente Alerta
import Alerta from '../components/ui/Alerta';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// CORREGIDO: Renombrado el componente para que coincida con el nombre del archivo
function RegistroPage() {
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [telefono, setTelefono] = useState('');
    const [estado, setEstado] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userRef = doc(db, 'usuarios', user.uid);
            
            await setDoc(userRef, {
                nombre: nombre,
                apellidos: apellidos,
                telefono: telefono,
                estado: estado,
                email: email,
                rol: 'cliente',
            });
            
            navigate('/perfil');

        } catch (err) {
            console.error("Error al registrar el usuario:", err.code);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo electrónico ya está registrado.');
            } else {
                setError('Ocurrió un error al intentar crear la cuenta.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background-dark p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-background-light border border-border-color rounded-xl shadow-2xl">
                
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Crea tu Cuenta</h2>
                    <p className="mt-2 text-text-subtle">Es rápido y fácil. ¡Únete a nuestros sorteos!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nombre(s)</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="input-field mt-1"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Apellido(s)</label>
                            <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="input-field mt-1"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Teléfono</label>
                        <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required className="input-field mt-1"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Estado de Residencia</label>
                        <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} required placeholder="Ej. Jalisco" className="input-field mt-1"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Correo Electrónico</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field mt-1"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Contraseña</label>
                        <div className="relative mt-1">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className="input-field pr-10"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-text-subtle hover:text-text-primary focus:outline-none"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Confirmar Contraseña</label>
                        <div className="relative mt-1">
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'} 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                className="input-field pr-10"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-text-subtle hover:text-text-primary focus:outline-none"
                                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    
                    {error && <Alerta mensaje={error} tipo="error" onClose={() => setError('')} />}

                    <button type="submit" className="w-full btn btn-primary">
                        Crear Cuenta
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-text-subtle">¿Ya tienes una cuenta? <Link to="/login" className="font-medium text-accent-primary hover:underline">Inicia sesión aquí</Link></p>
                </div>

            </div>
        </div>
    );
}

// CORREGIDO: Exportamos el componente con el nuevo nombre
export default RegistroPage;
