// src/pages/admin/ConfiguracionPage.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from '../../config/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Alerta from '../../components/ui/Alerta';
import { FaSave, FaSpinner, FaToggleOn, FaToggleOff, FaClock, FaEye, FaImage, FaUpload, FaLink, FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaTelegramPlane, FaWhatsapp, FaUsers, FaChevronDown, FaFlask } from 'react-icons/fa';

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

const initialFeaturesConfig = {
    showGanadoresPage: true,
    cooldownActivado: true,
    cooldownMinutos: 5,
};

const initialGeneralesConfig = {
    logoURL: '',
    WhatsappPrincipal: '',
};

function ConfiguracionPage() {
    const [featuresConfig, setFeaturesConfig] = useState(initialFeaturesConfig);
    const [datosGenerales, setDatosGenerales] = useState(initialGeneralesConfig);
    const [isSocialConfigOpen, setIsSocialConfigOpen] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const fileInputRef = useRef(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [feedback, setFeedback] = useState({ msg: '', type: '' });
    const [testRifaId, setTestRifaId] = useState('');
    const [testVentasCount, setTestVentasCount] = useState(100);
    const [isTesting, setIsTesting] = useState(false);
    const [testFeedback, setTestFeedback] = useState({ text: '', type: '' });

    const fetchAllConfig = useCallback(async () => {
        setCargando(true);
        try {
            const featuresDocRef = doc(db, 'configuracion', 'features');
            const generalesDocRef = doc(db, 'configuracion', 'datosGenerales');
            const featuresSnap = await getDoc(featuresDocRef);
            if (featuresSnap.exists()) {
                setFeaturesConfig(featuresSnap.data());
            } else {
                await setDoc(featuresDocRef, initialFeaturesConfig);
            }
            const generalesSnap = await getDoc(generalesDocRef);
            if (generalesSnap.exists()) {
                const fetchedGenerales = generalesSnap.data();
                setDatosGenerales(fetchedGenerales);
                // CORRECCIÓN: La vista previa se toma de datosGenerales.
                if (fetchedGenerales.logoURL) {
                    setLogoPreview(fetchedGenerales.logoURL);
                }
            } else {
                await setDoc(generalesDocRef, initialGeneralesConfig);
            }
        } catch (error) {
            console.error("Error cargando la configuración:", error);
            setFeedback({ msg: 'No se pudo cargar la configuración.', type: 'error' });
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        fetchAllConfig();
    }, [fetchAllConfig]);

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
            // CORRECCIÓN CLAVE: La URL del logo se gestiona en una copia de datosGenerales.
            let finalGeneralesConfig = { ...datosGenerales };
            if (logoFile) {
                const storage = getStorage();
                const logoRef = ref(storage, 'config/site-logo'); 
                await uploadBytes(logoRef, logoFile);
                const downloadURL = await getDownloadURL(logoRef);
                // La URL se asigna al objeto de datos generales.
                finalGeneralesConfig.logoURL = downloadURL;
            }
            
            const featuresDocRef = doc(db, 'configuracion', 'features');
            const generalesDocRef = doc(db, 'configuracion', 'datosGenerales');
            
            // Se guarda 'featuresConfig' como antes.
            const saveFeatures = setDoc(featuresDocRef, featuresConfig, { merge: true });
            // Se guarda el objeto 'finalGeneralesConfig' que ahora contiene la URL del logo.
            const saveGenerales = setDoc(generalesDocRef, finalGeneralesConfig, { merge: true });
            
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
    
    const handleRunLoadTest = async () => {
        if (!testRifaId || !testVentasCount) {
            setTestFeedback({ text: 'Debes proporcionar un ID de sorteo y una cantidad.', type: 'error' });
            return;
        }
        setIsTesting(true);
        setTestFeedback({ text: '', type: '' });
        try {
            const functions = getFunctions();
            const generarVentas = httpsCallable(functions, 'generarVentasDePrueba');
            const result = await generarVentas({ rifaId: testRifaId, cantidad: testVentasCount });
            setTestFeedback({ text: result.data.message, type: 'exito' });
        } catch (error) {
            console.error("Error al ejecutar la prueba de carga:", error);
            setTestFeedback({ text: error.message, type: 'error' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleFeaturesToggle = (key) => setFeaturesConfig(prev => ({ ...prev, [key]: !prev[key] }));
    const handleFeaturesInputChange = (e) => {
        const { name, value } = e.target;
        setFeaturesConfig(prev => ({ ...prev, [name]: Math.max(0, parseInt(value, 10)) }));
    };
    const handleGeneralesInputChange = (e) => {
        const { name, value } = e.target;
        setDatosGenerales(prev => ({ ...prev, [name]: value }));
    };
    const handleGeneralesToggleChange = (key) => setDatosGenerales(prev => ({ ...prev, [key]: !prev[key] }));

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
                    
                    <div>
                        <h3 className="text-lg font-bold flex items-center"><FaImage className="mr-3 text-accent-primary" /> Logo del Sitio</h3>
                        <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-32 h-32 bg-background-dark rounded-md flex items-center justify-center border border-border-color flex-shrink-0">
                                {logoPreview ? <img src={logoPreview} alt="Vista previa del logo" className="h-full w-full object-contain p-2 rounded-md" /> : <span className="text-xs text-text-subtle text-center p-2">Sin logo</span>}
                            </div>
                            <div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                                <button type="button" onClick={() => fileInputRef.current.click()} className="btn btn-secondary flex items-center"><FaUpload className="mr-2" /> Cambiar Logo</button>
                                <p className="text-xs text-text-subtle mt-2">Recomendado: .PNG con fondo transparente.</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-border-color"></div>
                    <div>
                        <button className="w-full flex justify-between items-center text-left" onClick={() => setIsSocialConfigOpen(!isSocialConfigOpen)}>
                            <div>
                                <h3 className="text-lg font-bold flex items-center"><FaLink className="mr-3 text-accent-primary" /> Datos de Contacto y Redes Sociales</h3>
                                <p className="text-sm text-text-subtle">Edita los enlaces y la visibilidad de tus redes en todo el sitio.</p>
                            </div>
                            <FaChevronDown className={`text-accent-primary transition-transform duration-300 ${isSocialConfigOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isSocialConfigOpen && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <div className="space-y-2 rounded-lg border border-border-color p-4 md:col-span-2">
                                    <label htmlFor="WhatsappPrincipal" className="text-md font-bold text-text-primary flex items-center"><FaWhatsapp className="mr-2 text-green-500"/> Número de WhatsApp Principal</label>
                                    <input type="text" id="WhatsappPrincipal" name="WhatsappPrincipal" value={datosGenerales.WhatsappPrincipal || ''} onChange={handleGeneralesInputChange} className="input-field" placeholder="Ej: 5215512345678" />
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
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold flex items-center"><FaEye className="mr-3 text-accent-primary" /> Página de Ganadores</h3>
                            <p className="text-sm text-text-subtle">Muestra u oculta la página pública de la galería de ganadores.</p>
                        </div>
                        <Switch isEnabled={featuresConfig.showGanadoresPage} onToggle={() => handleFeaturesToggle('showGanadoresPage')} />
                    </div>
                    <div className="border-t border-border-color"></div>
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
                
                <div className="mt-12 bg-background-light p-6 rounded-lg shadow-lg border-2 border-dashed border-warning">
                    <h3 className="text-xl font-bold flex items-center text-warning mb-4">
                        <FaFlask className="mr-3" />
                        Herramientas de Prueba (Solo Desarrollo)
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="testRifaId" className="block text-sm font-medium text-text-subtle">ID del Sorteo de Prueba</label>
                            <input
                                type="text"
                                id="testRifaId"
                                value={testRifaId}
                                onChange={(e) => setTestRifaId(e.target.value)}
                                placeholder="Pega aquí el ID del sorteo de estrés"
                                className="input-field mt-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="testVentasCount" className="block text-sm font-medium text-text-subtle">Cantidad de Ventas a Generar</label>
                            <input
                                type="number"
                                id="testVentasCount"
                                value={testVentasCount}
                                onChange={(e) => setTestVentasCount(Number(e.target.value))}
                                className="input-field mt-1 w-40"
                                min="1"
                            />
                        </div>
                        <button
                            onClick={handleRunLoadTest}
                            disabled={isTesting}
                            className="btn bg-warning text-black hover:bg-amber-400 disabled:opacity-50"
                        >
                            {isTesting ? ( <> <FaSpinner className="animate-spin mr-2" /> Generando Datos... </> ) : "Ejecutar Prueba de Carga"}
                        </button>
                        {testFeedback.text && (
                            <div className="mt-4">
                                <Alerta mensaje={testFeedback.text} tipo={testFeedback.type} onClose={() => setTestFeedback({ text: '', type: '' })} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfiguracionPage;
