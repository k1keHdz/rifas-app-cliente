import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from '../../config/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Alerta from '../../components/ui/Alerta';
import { FaSave, FaSpinner, FaToggleOn, FaToggleOff, FaClock, FaEye, FaImage, FaUpload, FaLink, FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaTelegramPlane, FaWhatsapp, FaUsers, FaFlask, FaCommentDots, FaCogs, FaChevronDown } from 'react-icons/fa';
import { initialMensajesConfig } from '../../context/ConfigContext';
import MensajesForm from '../../components/admin/MensajesForm';

// --- Componentes UI internos ---
const Switch = ({ isEnabled, onToggle }) => (
    <button onClick={onToggle} className="focus:outline-none">
        {isEnabled ? <FaToggleOn className="text-success h-8 w-8" /> : <FaToggleOff className="text-text-subtle h-8 w-8" />}
    </button>
);

const SeccionDesplegable = ({ title, description, icon: Icon, isOpen, onToggle, children }) => (
    <div>
        <button className="w-full flex justify-between items-center text-left py-4" onClick={onToggle}>
            <div className="flex items-center">
                <Icon className="mr-3 text-accent-primary h-6 w-6" />
                <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="text-sm text-text-subtle">{description}</p>
                </div>
            </div>
            <FaChevronDown className={`text-accent-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
            <div className="mt-4 pl-4 border-l-2 border-border-color animate-fade-in">
                {children}
            </div>
        )}
    </div>
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


// --- Valores iniciales ---
const initialFeaturesConfig = { showGanadoresPage: true, cooldownActivado: true, cooldownMinutos: 5, tiempoApartadoHoras: 24 };
const initialGeneralesConfig = { logoURL: '', WhatsappPrincipal: '' };
const defaultMensajes = Object.keys(initialMensajesConfig).reduce((acc, key) => {
    acc[key] = initialMensajesConfig[key].template;
    return acc;
}, {});


function ConfiguracionPage() {
    const [activeTab, setActiveTab] = useState('generales');
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        social: false,
    });

    const [featuresConfig, setFeaturesConfig] = useState(initialFeaturesConfig);
    const [datosGenerales, setDatosGenerales] = useState(initialGeneralesConfig);
    const [mensajesConfig, setMensajesConfig] = useState(defaultMensajes);

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

    const toggleSeccion = (seccion) => {
        setSeccionesAbiertas(prev => ({ ...prev, [seccion]: !prev[seccion] }));
    };

    const fetchAllConfig = useCallback(async () => {
        setCargando(true);
        try {
            const featuresDocRef = doc(db, 'configuracion', 'features');
            const generalesDocRef = doc(db, 'configuracion', 'datosGenerales');
            const mensajesDocRef = doc(db, 'configuracion', 'mensajesWhatsapp');

            const [featuresSnap, generalesSnap, mensajesSnap] = await Promise.all([
                getDoc(featuresDocRef),
                getDoc(generalesDocRef),
                getDoc(mensajesDocRef)
            ]);

            setFeaturesConfig(featuresSnap.exists() ? { ...initialFeaturesConfig, ...featuresSnap.data() } : initialFeaturesConfig);
            
            if (generalesSnap.exists()) {
                const fetchedGenerales = generalesSnap.data();
                setDatosGenerales(fetchedGenerales);
                if (fetchedGenerales.logoURL) setLogoPreview(fetchedGenerales.logoURL);
            } else {
                setDatosGenerales(initialGeneralesConfig);
            }

            setMensajesConfig(mensajesSnap.exists() ? { ...defaultMensajes, ...mensajesSnap.data() } : defaultMensajes);

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
            let finalGeneralesConfig = { ...datosGenerales };
            if (logoFile) {
                const storage = getStorage();
                const logoRef = ref(storage, 'config/site-logo');
                await uploadBytes(logoRef, logoFile);
                const downloadURL = await getDownloadURL(logoRef);
                finalGeneralesConfig.logoURL = downloadURL;
            }
            
            const featuresDocRef = doc(db, 'configuracion', 'features');
            const generalesDocRef = doc(db, 'configuracion', 'datosGenerales');
            const mensajesDocRef = doc(db, 'configuracion', 'mensajesWhatsapp');
            
            const featuresToSave = {
                ...featuresConfig,
                cooldownMinutos: parseInt(featuresConfig.cooldownMinutos, 10) || 0,
                tiempoApartadoHoras: parseInt(featuresConfig.tiempoApartadoHoras, 10) || 1,
            };

            await Promise.all([
                setDoc(featuresDocRef, featuresToSave, { merge: true }),
                setDoc(generalesDocRef, finalGeneralesConfig, { merge: true }),
                setDoc(mensajesDocRef, mensajesConfig, { merge: true })
            ]);
            
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
        setFeaturesConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleFeaturesInputBlur = (e) => {
        const { name, value } = e.target;
        let numValue = parseInt(value, 10);

        if (isNaN(numValue)) {
            numValue = initialFeaturesConfig[name];
        }

        if (name === 'tiempoApartadoHoras' && numValue < 1) {
            numValue = initialFeaturesConfig.tiempoApartadoHoras;
        } else if (name === 'cooldownMinutos' && numValue < 0) {
            numValue = initialFeaturesConfig.cooldownMinutos;
        }

        setFeaturesConfig(prev => ({ ...prev, [name]: numValue }));
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

                <div className="mb-6 border-b border-border-color">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('generales')} className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'generales' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color'}`}>
                            <FaCogs className="mr-2" /> Ajustes Generales
                        </button>
                        <button onClick={() => setActiveTab('mensajes')} className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'mensajes' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-subtle hover:border-border-color'}`}>
                            <FaCommentDots className="mr-2" /> Plantillas de Mensajes
                        </button>
                    </nav>
                </div>
                
                {activeTab === 'generales' && (
                    <div className="bg-background-light p-6 rounded-lg shadow-lg border border-border-color space-y-6">
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
                        
                        <SeccionDesplegable
                            title="Datos de Contacto y Redes Sociales"
                            description="Edita los enlaces y la visibilidad de tus redes."
                            icon={FaLink}
                            isOpen={seccionesAbiertas.social}
                            onToggle={() => toggleSeccion('social')}
                        >
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </SeccionDesplegable>

                        <div className="border-t border-border-color"></div>
                        
                        <div className="flex justify-between items-center">
                            <div><h3 className="text-lg font-bold flex items-center"><FaEye className="mr-3 text-accent-primary" /> Página de Ganadores</h3><p className="text-sm text-text-subtle">Muestra u oculta la página pública de la galería de ganadores.</p></div>
                            <Switch isEnabled={featuresConfig.showGanadoresPage} onToggle={() => handleFeaturesToggle('showGanadoresPage')} />
                        </div>
                        
                        <div className="border-t border-border-color"></div>
                        
                        <div>
                            <div className="flex justify-between items-center">
                                <div><h3 className="text-lg font-bold flex items-center"><FaClock className="mr-3 text-accent-primary" /> Tiempo de Espera entre Compras</h3><p className="text-sm text-text-subtle">Evita que un mismo usuario haga compras consecutivas demasiado rápido.</p></div>
                                <Switch isEnabled={featuresConfig.cooldownActivado} onToggle={() => handleFeaturesToggle('cooldownActivado')} />
                            </div>
                            {featuresConfig.cooldownActivado && (
                                <div className="mt-4 pl-10 animate-fade-in">
                                    <label htmlFor="cooldownMinutos" className="block text-sm font-medium mb-2">Minutos de espera:</label>
                                    <input type="number" id="cooldownMinutos" name="cooldownMinutos" value={featuresConfig.cooldownMinutos} onChange={handleFeaturesInputChange} onBlur={handleFeaturesInputBlur} className="input-field w-40" min="0"/>
                                </div>
                            )}
                        </div>
                        
                        <div className="border-t border-border-color"></div>
                        
                        <div>
                            <div><h3 className="text-lg font-bold flex items-center"><FaClock className="mr-3 text-accent-primary" /> Tiempo de Apartado de Boletos</h3><p className="text-sm text-text-subtle">Define cuántas horas tiene un cliente para pagar antes de que su boleto se libere.</p></div>
                            <div className="mt-4">
                                <label htmlFor="tiempoApartadoHoras" className="block text-sm font-medium mb-2">Horas de apartado:</label>
                                <input type="number" id="tiempoApartadoHoras" name="tiempoApartadoHoras" value={featuresConfig.tiempoApartadoHoras} onChange={handleFeaturesInputChange} onBlur={handleFeaturesInputBlur} className="input-field w-40" min="1"/>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'mensajes' && (
                    <div className="bg-background-light p-6 rounded-lg shadow-lg border border-border-color">
                        <MensajesForm 
                            mensajesConfig={mensajesConfig}
                            setMensajesConfig={setMensajesConfig}
                            plantillasDisponibles={initialMensajesConfig}
                        />
                    </div>
                )}

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
