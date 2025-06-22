// src/components/AddAdminForm.js

import React, { useState } from 'react';
import { getFunctions, httpsCallable } from "firebase/functions";
import Alerta from './Alerta';
import { FaUserShield, FaSpinner } from 'react-icons/fa';

/**
 * Componente con un formulario para nombrar nuevos administradores
 * llamando a la Cloud Function 'addAdminRole'.
 */
function AddAdminForm() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ msg: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback({ msg: '', type: '' });

        if (!email) {
            setFeedback({ msg: 'Por favor, introduce un correo electrónico.', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            // Inicializa la conexión con las Cloud Functions
            const functions = getFunctions();
            // Apunta a la función específica que queremos llamar
            const addAdminRole = httpsCallable(functions, 'addAdminRole');
            
            // Llama a la función y le pasa el email en el cuerpo de la petición
            const result = await addAdminRole({ email: email });
            
            // Muestra el mensaje de éxito que devuelve la función
            setFeedback({ msg: result.data.result, type: 'exito' });
            setEmail(''); // Limpia el campo después del éxito

        } catch (error) {
            console.error("Error al nombrar administrador:", error);
            // Firebase devuelve un mensaje de error claro, lo mostramos al usuario
            setFeedback({ msg: error.message || 'Ocurrió un error inesperado.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light p-6 sm:p-8 rounded-xl shadow-lg border border-border-color">
            <div className="flex items-start sm:items-center mb-4">
                 <FaUserShield className="w-8 h-8 mr-4 text-accent-primary flex-shrink-0" />
                 <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-text-primary">Nombrar Nuevo Administrador</h3>
                    <p className="text-text-subtle mt-1">Otorga privilegios de administrador a un usuario existente por su correo electrónico.</p>
                 </div>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo.del.usuario@ejemplo.com"
                        required
                        className="input-field flex-grow"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-primary flex items-center justify-center sm:w-auto"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Nombrando...
                            </>
                        ) : (
                            'Nombrar Admin'
                        )}
                    </button>
                </div>
            </form>
            {feedback.msg && (
                <div className="mt-4">
                    <Alerta mensaje={feedback.msg} tipo={feedback.type} onClose={() => setFeedback({ msg: '', type: '' })} />
                </div>
            )}
        </div>
    );
}

export default AddAdminForm;
