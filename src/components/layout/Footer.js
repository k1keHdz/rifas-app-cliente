import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { useModal } from '../../context/ModalContext';
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaTelegramPlane, FaWhatsapp, FaUsers, FaCode } from 'react-icons/fa';

const FooterSocialIcon = ({ href, title, icon: Icon }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className="text-gray-400 hover:text-white transition-colors duration-300">
        <span className="sr-only">{title}</span>
        <Icon className="h-6 w-6" />
    </a>
);

function Footer() {
    const { config, datosGenerales, cargandoConfig } = useConfig();
    const { openDeveloperModal } = useModal();

    if (cargandoConfig || !config || !datosGenerales) {
        return <footer className="bg-background-dark h-48"></footer>;
    }
    
    const developerName = "AxiomaLabs"; 
    const logoToShow = datosGenerales.logoURL || "https://i.imgur.com/a9A1Jps.png";

    return (
        <footer className="bg-background-dark">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                
                    <div className="col-span-2 md:col-span-1">
                        <img src={logoToShow} alt="Logo Sorteos App" className="h-12 w-auto mb-2"/>
                        <p className="mt-2 text-sm text-text-subtle">
                            Participa en nuestros sorteos y sé el próximo en ganar premios increíbles.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text-subtle tracking-wider uppercase">Navegación</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/" className="text-base hover:opacity-75">Inicio</Link></li>
                            {config.showGanadoresPage && (
                                <li><Link to="/ganadores" className="text-base hover:opacity-75">Ganadores</Link></li>
                            )}
                            <li><Link to="/como-participar" className="text-base hover:opacity-75">Cómo Participar</Link></li>
                            <li><Link to="/verificador" className="text-base hover:opacity-75">Verificar Boleto</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text-subtle tracking-wider uppercase">Soporte</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/contacto" className="text-base hover:opacity-75">Contacto</Link></li>
                            <li><Link to="/nosotros" className="text-base hover:opacity-75">Nosotros</Link></li>
                            <li><Link to="/transparencia" className="text-base hover:opacity-75">Transparencia</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-semibold text-text-subtle tracking-wider uppercase">Síguenos</h3>
                        <div className="flex mt-4 space-x-6 flex-wrap gap-y-4">
                            {datosGenerales.urlFacebook && datosGenerales.mostrarFacebookEnFooter && <FooterSocialIcon href={datosGenerales.urlFacebook} title="Facebook" icon={FaFacebook} />}
                            {datosGenerales.urlInstagram && datosGenerales.mostrarInstagramEnFooter && <FooterSocialIcon href={datosGenerales.urlInstagram} title="Instagram" icon={FaInstagram} />}
                            {datosGenerales.urlTiktok && datosGenerales.mostrarTiktokEnFooter && <FooterSocialIcon href={datosGenerales.urlTiktok} title="TikTok" icon={FaTiktok} />}
                            {datosGenerales.urlYoutube && datosGenerales.mostrarYoutubeEnFooter && <FooterSocialIcon href={datosGenerales.urlYoutube} title="YouTube" icon={FaYoutube} />}
                            {datosGenerales.urlTelegram && datosGenerales.mostrarTelegramEnFooter && <FooterSocialIcon href={datosGenerales.urlTelegram} title="Telegram" icon={FaTelegramPlane} />}
                            {datosGenerales.urlWhatsappContacto && datosGenerales.mostrarWhatsappContactoEnFooter && <FooterSocialIcon href={datosGenerales.urlWhatsappContacto} title="WhatsApp" icon={FaWhatsapp} />}
                            {datosGenerales.urlGrupoWhatsapp && datosGenerales.mostrarGrupoWhatsappEnFooter && <FooterSocialIcon href={datosGenerales.urlGrupoWhatsapp} title="Grupo de WhatsApp" icon={FaUsers} />}
                        </div>
                    </div>

                </div>
                <div className="mt-8 border-t border-border-color pt-8 text-center">
                    <p className="text-base text-text-subtle">&copy; 2025 Sorteos El Primo. Todos los derechos reservados.</p>
                    
                    {/* ===== SELLO DE AUTOR CON ESTILO EQUILIBRADO ===== */}
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <FaCode className="h-4 w-4 text-gray-500" />
                        <p className="text-base text-gray-400">
                            Sitio desarrollado por:{' '}
                            <button 
                                onClick={openDeveloperModal} 
                                className="font-semibold text-accent-primary hover:underline"
                            >
                                {developerName}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
