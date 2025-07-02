// src/pages/admin/ConfiguracionPage.js

import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Alerta from '../../components/Alerta';
// MODIFICADO: Añadimos FaChevronDown para el desplegable
import { FaSave, FaSpinner, FaToggleOn, FaToggleOff, FaClock, FaEye, FaImage, FaUpload, FaLink, FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaTelegramPlane, FaWhatsapp, FaUsers, FaChevronDown } from 'react-icons/fa';

const Switch = ({ isEnabled, onToggle }) => (
    <button onClick={onToggle} className="focus:outline-none">
        {isEnabled ? (
            <FaToggleOn className="text-success h-8 w-8" />
        ) : (
            <FaToggleOff className="text-text-subtle h-8 w-8" />
        )}
    </button>
);

const SocialConfigSection = ({ id, title, icon: Icon, datos, handleInputChange, handleToggleChange }) => (
    <div className="space-y-4 rounded-lg border border-border-color p-4">
        <h4 className="font-bold text-md flex items-center"><Icon className="mr-2" /> {title}</h4>
        <div className="space-y-2">
            <label htmlFor={`url${id}`} className="text-sm font-medium text-text-subtle">URL del Enlace</label>
            <input
                type="text"
                id={`url${id}`}
                name={`url${id}`}
                value={datos[`url${id}`] || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder={`https://...`}
            />
        </div>
        <div className="space-y-3 text-sm">
            <p className="font-medium text-text-subtle">Mostrar en:</p>
            <div className="flex items-center justify-between">
                <label htmlFor={`mostrar${id}EnFooter`}>Pie de página (Footer)</label>
                <Switch isEnabled={datos[`mostrar${id}EnFooter`]} onToggle={() => handleToggleChange(`mostrar${id}EnFooter`)} />
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor={`mostrar${id}EnContacto`}>Página de Contacto</label>
                <Switch isEnabled={datos[`mostrar${id}EnContacto`]} onToggle={() => handleToggleChange(`mostrar${id}EnContacto`)} />
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor={`mostrar${id}EnPerfil`}>Perfil del Usuario</label>
                <Switch isEnabled={datos[`mostrar${id}EnPerfil`]} onToggle={() => handleToggleChange(`mostrar${id}EnPerfil`)} />
            </div>
        </div>
    </div>
);


function ConfiguracionPage() {
    const [featuresConfig, setFeaturesConfig] = useState({
        showGanadoresPage: true,
        cooldownActivado: true,
        cooldownMinutos: 5,
        logoURL: '',
    });
    
    const [datosGenerales, setDatosGenerales] = useState({});
    // LÓGICA DEL DESPLEGABLE: Nuevo estado para controlar si la sección está abierta
    const [isSocialConfigOpen, setIsSocialConfigOpen] = useState(true);

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const fileInputRef = useRef(null);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [feedback, setFeedback] = useState({ msg: '', type: '' });

    const featuresDocRef = doc(db, 'configuracion', 'features');
    const generalesDocRef = doc(db, 'configuracion', 'datosGenerales');

    useEffect(() => {
        const fetchAllConfig = async () => {
            setCargando(true);
            try {
                const featuresSnap = await getDoc(featuresDocRef);
                if (featuresSnap.exists()) {
                    const fetchedConfig = featuresSnap.data();
                    setFeaturesConfig(fetchedConfig);
                    if (fetchedConfig.logoURL) {
                        setLogoPreview(fetchedConfig.logoURL);
                    }
                } else {
                    await setDoc(featuresDocRef, featuresConfig);
                }

                const generalesSnap = await getDoc(generalesDocRef);
                if (generalesSnap.exists()) {
                    setDatosGenerales(generalesSnap.data());
                } else {
                    await setDoc(generalesDocRef, {}); 
                }

            } catch (error) {
                console.error("Error cargando la configuración:", error);
                setFeedback({ msg: 'No se pudo cargar la configuración.', type: 'error' });
            } finally {
                setCargando(false);
            }
        };
        fetchAllConfig();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoFile(null);
            setFeedback({ msg: 'Por favor, selecciona un archivo de imagen válido.', type: 'error' });
        }
    };

    const handleSave = async () => {
        setGuardando(true);
        setFeedback({ msg: '', type: '' });
        
        try {
            let finalFeaturesConfig = { ...featuresConfig };

            if (logoFile) {
                const storage = getStorage();
                const logoRef = ref(storage, 'config/site-logo'); 
                await uploadBytes(logoRef, logoFile);
                const downloadURL = await getDownloadURL(logoRef);
                finalFeaturesConfig.logoURL = downloadURL;
            }

            const saveFeatures = setDoc(featuresDocRef, finalFeaturesConfig, { merge: true });
            const saveGenerales = setDoc(generalesDocRef, datosGenerales, { merge: true });

            await Promise.all([saveFeatures, saveGenerales]);

            setFeedback({ msg: '¡Configuración guardada con éxito!', type: 'exito' });
            setLogoFile(null);

        } catch (error) {
            console.error("Error guardando la configuración:", error);
            setFeedback({ msg: 'Hubo un error al guardar la configuración.', type: 'error' });
        } finally {
            setGuardando(false);
        }
    };

    const handleFeaturesToggle = (key) => {
        setFeaturesConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFeaturesInputChange = (e) => {
        const { name, value } = e.target;
        const numValue = Math.max(0, parseInt(value, 10));
        setFeaturesConfig(prev => ({ ...prev, [name]: numValue }));
    };

    const handleGeneralesInputChange = (e) => {
        const { name, value } = e.target;
        setDatosGenerales(prev => ({ ...prev, [name]: value }));
    };

    const handleGeneralesToggleChange = (key) => {
        setDatosGenerales(prev => ({ ...prev, [key]: !prev[key] }));
    };


    if (cargando) {
        return <div className="text-center p-10"><FaSpinner className="animate-spin mx-auto text-4xl" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-background-dark min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Panel de Configuración</h1>
                    <p className="text-text-subtle mt-1">Gestiona los datos y funcionalidades de tu sitio en tiempo real.</p>
                </div>
                <div className="bg-background-light p-6 rounded-lg shadow-lg border border-border-color space-y-8">
                    
                    {/* Sección para el Logo del Sitio */}
                    <div>
                        <h3 className="text-lg font-bold flex items-center"><FaImage className="mr-3 text-accent-primary" /> Logo del Sitio</h3>
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
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                                <button type="button" onClick={() => fileInputRef.current.click()} className="btn btn-secondary flex items-center"><FaUpload className="mr-2" /> Cambiar Logo</button>
                                <p className="text-xs text-text-subtle mt-2">Recomendado: .PNG con fondo transparente.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border-color"></div>

                    {/* LÓGICA DEL DESPLEGABLE: Sección de Datos de Contacto */}
                    <div>
                        {/* El título ahora es un botón que controla el estado */}
                        <button 
                            className="w-full flex justify-between items-center text-left"
                            onClick={() => setIsSocialConfigOpen(!isSocialConfigOpen)}
                        >
                            <div>
                                <h3 className="text-lg font-bold flex items-center"><FaLink className="mr-3 text-accent-primary" /> Datos de Contacto y Redes Sociales</h3>
                                <p className="text-sm text-text-subtle">Edita los enlaces y la visibilidad de tus redes en todo el sitio.</p>
                            </div>
                            <FaChevronDown className={`text-accent-primary transition-transform duration-300 ${isSocialConfigOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* El contenido solo se muestra si el estado es 'true' */}
                        {isSocialConfigOpen && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <div className="space-y-2 rounded-lg border border-border-color p-4 md:col-span-2">
                                    <label htmlFor="WhatsappPrincipal" className="text-md font-bold text-text-primary flex items-center"><FaWhatsapp className="mr-2 text-green-500"/> Número de WhatsApp Principal (para compras)</label>
                                    <p className="text-xs text-text-subtle">Este es el número al que se envían las notificaciones de compra y desde donde se contacta a los clientes.</p>
                                    <input
                                        type="text"
                                        id="WhatsappPrincipal"
                                        name="WhatsappPrincipal"
                                        value={datosGenerales.WhatsappPrincipal || ''}
                                        onChange={handleGeneralesInputChange}
                                        className="input-field"
                                        placeholder="Ej: 5215512345678"
                                    />
                                </div>

                                <SocialConfigSection id="Facebook" title="Facebook" icon={FaFacebook} datos={datosGenerales} handleInputChange={handleGeneralesInputChange} handleToggleChange={handleGeneralesToggleChange} />
                                <SocialConfigSection id="Instagram" title="Instagram" icon={FaInstagram} datos={datosGenerales} handleInputChange={handleGeneralesInputChange} handleToggleChange={handleGeneralesToggleChange} />
                                <SocialConfigSection id="Tiktok" title="TikTok" icon={FaTiktok} datos={datosGenerales} handleInputChange={handleGeneralesInputChange} handleToggleChange={handleGeneralesToggleChange} />
                                <SocialConfigSection id="Youtube" title="YouTube" icon={FaYoutube} datos={datosGenerales} handleInputChange={handleGeneralesInputChange} handleToggleChange={handleGeneralesToggleChange} />
                                <SocialConfigSection id="Telegram" title="Telegram" icon={FaTelegramPlane} datos={datosGenerales} handleInputChange={handleGeneralesInputChange} handleToggleChange={handleGeneralesToggleChange} />
                                <SocialConfigSection id="WhatsappContacto" title="WhatsApp (Contacto)" icon={FaWhatsapp} datos={datosGenerales} handleInputChange={handleGeneralesInputChange} handleToggleChange={handleGeneralesToggleChange} />
                                <SocialConfigSection id="GrupoWhatsapp" title="Grupo de WhatsApp" icon={FaUsers} datos={datosGenerales} handleInputChange={handleGeneralesInputChange} handleToggleChange={handleGeneralesToggleChange} />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border-color"></div>

                    {/* Sección Página de Ganadores */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold flex items-center"><FaEye className="mr-3 text-accent-primary" /> Página de Ganadores</h3>
                            <p className="text-sm text-text-subtle">Muestra u oculta la página pública de la galería de ganadores.</p>
                        </div>
                        <Switch isEnabled={featuresConfig.showGanadoresPage} onToggle={() => handleFeaturesToggle('showGanadoresPage')} />
                    </div>

                    <div className="border-t border-border-color"></div>

                    {/* Sección Cooldown de Compra */}
                    <div>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold flex items-center"><FaClock className="mr-3 text-accent-primary" /> Tiempo de Espera entre Compras</h3>
                                <p className="text-sm text-text-subtle">Evita que un mismo usuario haga compras consecutivas demasiado rápido.</p>
                            </div>
                            <Switch isEnabled={featuresConfig.cooldownActivado} onToggle={() => handleFeaturesToggle('cooldownActivado')} />
                        </div>
                        {featuresConfig.cooldownActivado && (
                            <div className="mt-4 pl-10 animate-fade-in">
                                <label htmlFor="cooldownMinutos" className="block text-sm font-medium mb-2">Minutos de espera:</label>
                                <input type="number" id="cooldownMinutos" name="cooldownMinutos" value={featuresConfig.cooldownMinutos} onChange={handleFeaturesInputChange} className="input-field w-40" min="0"/>
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
