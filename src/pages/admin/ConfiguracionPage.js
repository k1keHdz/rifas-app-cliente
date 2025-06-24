// src/pages/admin/ConfiguracionPage.js

import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
// 1. Importamos las herramientas de Firebase Storage
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Alerta from '../../components/Alerta';
// 2. Importamos los nuevos iconos que usaremos
import { FaSave, FaSpinner, FaToggleOn, FaToggleOff, FaClock, FaEye, FaImage, FaUpload } from 'react-icons/fa';

const Switch = ({ isEnabled, onToggle }) => (
    <button onClick={onToggle} className="focus:outline-none">
        {isEnabled ? (
            <FaToggleOn className="text-success h-8 w-8" />
        ) : (
            <FaToggleOff className="text-text-subtle h-8 w-8" />
        )}
    </button>
);

function ConfiguracionPage() {
    const [config, setConfig] = useState({
        showGanadoresPage: true,
        cooldownActivado: true,
        cooldownMinutos: 5,
        logoURL: '', // Añadimos el campo para la URL del logo
    });
    // 3. Nuevos estados para gestionar el archivo del logo
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const fileInputRef = useRef(null);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [feedback, setFeedback] = useState({ msg: '', type: '' });

    const configDocRef = doc(db, 'configuracion', 'features');

    useEffect(() => {
        const fetchConfig = async () => {
            setCargando(true);
            try {
                const docSnap = await getDoc(configDocRef);
                if (docSnap.exists()) {
                    const fetchedConfig = docSnap.data();
                    setConfig(fetchedConfig);
                    // 4. Mostramos el logo guardado al cargar
                    if (fetchedConfig.logoURL) {
                        setLogoPreview(fetchedConfig.logoURL);
                    }
                } else {
                    await setDoc(configDocRef, config);
                }
            } catch (error) {
                console.error("Error cargando la configuración:", error);
                setFeedback({ msg: 'No se pudo cargar la configuración.', type: 'error' });
            } finally {
                setCargando(false);
            }
        };
        fetchConfig();
        // La dependencia `config` se omite intencionadamente para evitar bucles.
    }, []);

    // 5. Nueva función para manejar la selección de un archivo de imagen
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setLogoFile(file);
            // Creamos una URL local para la vista previa instantánea
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoFile(null);
            setFeedback({ msg: 'Por favor, selecciona un archivo de imagen válido.', type: 'error' });
        }
    };

    // 6. Modificamos la función de guardado para que suba el logo si hay uno nuevo
    const handleSave = async () => {
        setGuardando(true);
        setFeedback({ msg: '', type: '' });
        
        try {
            let finalConfig = { ...config };

            // Si se ha seleccionado un nuevo archivo de logo...
            if (logoFile) {
                const storage = getStorage();
                // Usamos una ruta fija para que el nuevo logo siempre reemplace al anterior
                const logoRef = ref(storage, 'config/site-logo'); 
                
                // Subimos el nuevo archivo
                await uploadBytes(logoRef, logoFile);
                
                // Obtenemos la URL pública del archivo que acabamos de subir
                const downloadURL = await getDownloadURL(logoRef);
                
                // Actualizamos la configuración con la nueva URL
                finalConfig.logoURL = downloadURL;
            }

            // Guardamos el objeto de configuración completo en Firestore
            await setDoc(configDocRef, finalConfig, { merge: true });
            setFeedback({ msg: '¡Configuración guardada con éxito!', type: 'exito' });
            setLogoFile(null); // Limpiamos el estado del archivo para evitar re-subidas accidentales

        } catch (error) {
            console.error("Error guardando la configuración:", error);
            setFeedback({ msg: 'Hubo un error al guardar la configuración.', type: 'error' });
        } finally {
            setGuardando(false);
        }
    };

    const handleToggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const numValue = Math.max(0, parseInt(value, 10));
        setConfig(prev => ({ ...prev, [name]: numValue }));
    };

    if (cargando) {
        return <div className="text-center p-10"><FaSpinner className="animate-spin mx-auto text-4xl" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-background-dark min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Panel de Configuración</h1>
                    <p className="text-text-subtle mt-1">Activa o desactiva funcionalidades de tu sitio en tiempo real.</p>
                </div>
                <div className="bg-background-light p-6 rounded-lg shadow-lg border border-border-color space-y-8">
                    
                    {/* Sección para el Logo del Sitio */}
                    <div>
                        <h3 className="text-lg font-bold flex items-center">
                            <FaImage className="mr-3 text-accent-primary" />
                            Logo del Sitio
                        </h3>
                        <p className="text-sm text-text-subtle">Sube el logo que aparecerá en la barra de navegación y el pie de página.</p>
                        <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-32 h-32 bg-background-dark rounded-md flex items-center justify-center border border-border-color flex-shrink-0">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Vista previa del logo" className="h-full w-full object-contain p-2 rounded-md" />
                                ) : (
                                    <span className="text-xs text-text-subtle text-center p-2">Sin logo</span>
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="btn btn-secondary flex items-center"
                                >
                                    <FaUpload className="mr-2" />
                                    Cambiar Logo
                                </button>
                                <p className="text-xs text-text-subtle mt-2">Recomendado: .PNG con fondo transparente.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border-color"></div>

                    {/* Sección Página de Ganadores */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold flex items-center">
                                <FaEye className="mr-3 text-accent-primary" />
                                Página de Ganadores
                            </h3>
                            <p className="text-sm text-text-subtle">Muestra u oculta la página pública de la galería de ganadores.</p>
                        </div>
                        <Switch isEnabled={config.showGanadoresPage} onToggle={() => handleToggle('showGanadoresPage')} />
                    </div>

                    <div className="border-t border-border-color"></div>

                    {/* Sección Cooldown de Compra */}
                    <div>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold flex items-center">
                                    <FaClock className="mr-3 text-accent-primary" />
                                    Tiempo de Espera entre Compras
                                </h3>
                                <p className="text-sm text-text-subtle">Evita que un mismo usuario haga compras consecutivas demasiado rápido.</p>
                            </div>
                            <Switch isEnabled={config.cooldownActivado} onToggle={() => handleToggle('cooldownActivado')} />
                        </div>
                        {config.cooldownActivado && (
                            <div className="mt-4 pl-10 animate-fade-in">
                                <label htmlFor="cooldownMinutos" className="block text-sm font-medium mb-2">Minutos de espera:</label>
                                <input
                                    type="number"
                                    id="cooldownMinutos"
                                    name="cooldownMinutos"
                                    value={config.cooldownMinutos}
                                    onChange={handleInputChange}
                                    className="input-field w-40"
                                    min="0"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {feedback.msg && (
                    <div className="my-4">
                        <Alerta mensaje={feedback.msg} tipo={feedback.type} onClose={() => setFeedback({ msg: '', type: '' })} />
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} disabled={guardando} className="btn btn-primary flex items-center">
                        {guardando ? ( <> <FaSpinner className="animate-spin mr-2" /> Guardando... </> ) : ( <> <FaSave className="mr-2" /> Guardar Cambios </> )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfiguracionPage;
