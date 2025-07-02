// src/pages/ContactoPage.js

import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import Alerta from '../components/Alerta';
import { useConfig } from '../context/ConfigContext';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaTelegramPlane, FaYoutube, FaUsers } from 'react-icons/fa';

const SocialButton = ({ href, title, icon: Icon, className }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-300 transform hover:scale-110 ${className}`}>
        <Icon size={24} />
    </a>
);

function ContactoPage() {
    const form = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ msg: '', type: '' });
    
    const { datosGenerales, cargandoConfig } = useConfig();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback({ msg: '', type: '' });

        if (!process.env.REACT_APP_EMAILJS_SERVICE_ID || !process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID || !process.env.REACT_APP_EMAILJS_PUBLIC_KEY) {
            console.error("Una o más variables de entorno de EmailJS no están definidas.");
            setFeedback({ msg: 'Error de configuración del servicio de correo.', type: 'error' });
            setIsSubmitting(false);
            return;
        }

        try {
            await emailjs.sendForm(
                process.env.REACT_APP_EMAILJS_SERVICE_ID, 
                process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID, 
                form.current, 
                process.env.REACT_APP_EMAILJS_PUBLIC_KEY
            );
            setFeedback({ msg: '¡Mensaje enviado con éxito! Te responderemos pronto.', type: 'exito' });
            form.current.reset();
        } catch (error) {
            console.error('ERROR AL ENVIAR EL CORREO:', error);
            setFeedback({ msg: 'Hubo un error al enviar el mensaje. Verifica tus claves y la configuración de EmailJS.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cargandoConfig || !datosGenerales) {
        return <div className="bg-background-dark py-12 sm:py-16 text-center">Cargando datos de contacto...</div>;
    }

    return (
        <div className="bg-background-dark py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Contáctanos</h1>
                        <p className="mt-4 text-xl text-text-subtle">
                            ¿Tienes alguna pregunta, sugerencia o problema? Estamos aquí para ayudarte.
                        </p>
                    </div>
                    
                    <div className="mt-12 bg-background-light border border-border-color p-6 sm:p-8 rounded-2xl shadow-lg">
                        <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                            {/* El formulario se mantiene igual */}
                            <div>
                                <label htmlFor="from_name" className="block text-sm font-medium">Tu Nombre</label>
                                <div className="mt-1">
                                    <input type="text" name="from_name" id="from_name" required className="input-field" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="from_email" className="block text-sm font-medium">Tu Correo Electrónico</label>
                                <div className="mt-1">
                                    <input type="email" name="from_email" id="from_email" required className="input-field" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium">Mensaje</label>
                                <div className="mt-1">
                                    <textarea id="message" name="message" rows={4} required className="input-field"></textarea>
                                </div>
                            </div>
                            
                            {feedback.msg && <Alerta mensaje={feedback.msg} tipo={feedback.type} onClose={() => setFeedback({ msg: '', type: '' })} />}

                            <div>
                                <button type="submit" disabled={isSubmitting} className="w-full btn btn-primary disabled:opacity-50">
                                    {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-16 text-center">
                        <h3 className="text-2xl font-bold">Síguenos en Nuestras Redes</h3>
                        <p className="mt-2 text-lg text-text-subtle">
                            Mantente al día con los últimos sorteos, noticias y ganadores.
                        </p>
                        <div className="mt-8 flex justify-center items-center flex-wrap gap-4 sm:gap-6">
                            {/* LÓGICA DE VISIBILIDAD: El icono solo aparece si el enlace existe Y su interruptor para Contacto está en 'true' */}
                            {datosGenerales.urlWhatsappContacto && datosGenerales.mostrarWhatsappContactoEnContacto && <SocialButton href={datosGenerales.urlWhatsappContacto} title="WhatsApp" icon={FaWhatsapp} className="bg-[#25D366]"/>}
                            {datosGenerales.urlFacebook && datosGenerales.mostrarFacebookEnContacto && <SocialButton href={datosGenerales.urlFacebook} title="Facebook" icon={FaFacebook} className="bg-[#1877F2]"/>}
                            {datosGenerales.urlInstagram && datosGenerales.mostrarInstagramEnContacto && <SocialButton href={datosGenerales.urlInstagram} title="Instagram" icon={FaInstagram} className="bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600"/>}
                            {datosGenerales.urlTiktok && datosGenerales.mostrarTiktokEnContacto && <SocialButton href={datosGenerales.urlTiktok} title="TikTok" icon={FaTiktok} className="bg-black"/>}
                            {datosGenerales.urlTelegram && datosGenerales.mostrarTelegramEnContacto && <SocialButton href={datosGenerales.urlTelegram} title="Telegram" icon={FaTelegramPlane} className="bg-[#24A1DE]"/>}
                            {datosGenerales.urlYoutube && datosGenerales.mostrarYoutubeEnContacto && <SocialButton href={datosGenerales.urlYoutube} title="YouTube" icon={FaYoutube} className="bg-[#FF0000]"/>}
                            {datosGenerales.urlGrupoWhatsapp && datosGenerales.mostrarGrupoWhatsappEnContacto && <SocialButton href={datosGenerales.urlGrupoWhatsapp} title="Grupo de WhatsApp" icon={FaUsers} className="bg-[#25D366]"/>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactoPage;
