// src/pages/ContactoPage.js

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import Alerta from '../components/Alerta';
import EMAIL_CONFIG from '../emailjsConfig';

// --- Íconos Sociales ---
// REPARACIÓN: Se eliminan las clases de color. El hover ahora usa opacidad para ser compatible con cualquier tema.
const SocialIcon = ({ href, title, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className="hover:opacity-75 transition-opacity duration-300 transform hover:scale-110">
        {children}
    </a>
);
// REPARACIÓN: Se eliminan las clases de color específicas de los iconos para que hereden el color del texto.
const WhatsAppIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><path d="M11.999 2C6.486 2 2 6.486 2 12c0 1.63.393 3.183 1.11 4.576L2 22l5.424-1.11a9.944 9.944 0 0 0 4.575 1.11c5.513 0 9.999-4.486 9.999-9.999S17.512 2 11.999 2zM12 3.667c4.603 0 8.333 3.73 8.333 8.333S16.602 20.333 12 20.333a8.283 8.283 0 0 1-4.223-1.157l-.3-.18-3.122.64.65-3.05-.197-.314A8.282 8.282 0 0 1 3.667 12c0-4.603 3.73-8.333 8.333-8.333zm4.568 11.233c-.24-.12-.823-.406-1.012-.456s-.327-.076-.465.076c-.138.152-.38.456-.465.532-.086.076-.172.086-.31.01s-.58-.216-1.106-.682c-.407-.363-.678-.813-.756-.949s-.065-.216 0-.348c.058-.112.138-.282.207-.38.07-.107.094-.18.138-.3s.022-.227-.022-.317c-.044-.09-.465-1.114-.638-1.525-.172-.41-.345-.355-.465-.355h-.402c-.138 0-.35.044-.532.18s-.696.678-.696 1.652c0 .973.714 1.914.81 2.04.1.125 1.4 2.24 3.39 3.003.49.193.877.308 1.18.393.42.118.804.102 1.1-.015.328-.12.823-.5.94-.678s.216-.402.152-.465c-.065-.064-.24-.12-.48-.24z" fill="currentColor"/></svg>;
const TelegramIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zM18 7.898l-1.834 8.572c-.18.834-.683 1.034-1.35.638l-2.658-1.954-1.284 1.238c-.14.14-.258.258-.518.258l.18-2.722 4.88-4.426c.21-.18-.048-.288-.327-.12L8.214 13.39l-2.61-.813c-.85-.267-.87-1.04.18-1.538l9.648-3.74c.73-.284 1.37.18 1.116 1.15z" fill="currentColor"/></svg>;
const FacebookIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.35C0 23.407.593 24 1.325 24H12.82V14.706h-2.69V11.01h2.69V8.41c0-2.64 1.58-4.12 3.99-4.12 1.14 0 2.34.2 2.34.2v3.26h-1.6c-1.3 0-1.7.7-1.7 1.6v1.98h3.6l-.5 3.69h-3.1V24h5.45c.73 0 1.33-.593 1.33-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="currentColor"/></svg>;
const InstagramIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.784.305-1.457.718-2.123 1.385S.935 3.356.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 0 0 1.385 2.123 5.885 5.885 0 0 0 2.123 1.385c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.885 5.885 0 0 0 2.123-1.385 5.885 5.885 0 0 0 1.385-2.123c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.148-.558-2.913a5.885 5.885 0 0 0-1.385-2.123A5.885 5.885 0 0 0 19.053.63c-.765-.296-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.06 1.17-.249 1.805-.413 2.227a3.48 3.48 0 0 1-.896 1.382 3.48 3.48 0 0 1-1.382.896c-.422.164-1.057.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.585-.015-4.85-.074c-1.17-.06-1.805-.249-2.227-.413a3.48 3.48 0 0 1-1.382-.896 3.48 3.48 0 0 1-.896-1.382c-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.585.07-4.85c.06-1.17.249-1.805.413-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413C8.415 2.175 8.797 2.16 12 2.16zm0 2.713a7.127 7.127 0 1 0 0 14.254 7.127 7.127 0 0 0 0-14.254zm0 11.817a4.69 4.69 0 1 1 0-9.38 4.69 4.69 0 0 1 0 9.38zM16.95 6.581a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" fill="currentColor"/></svg>;
const TikTokIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-1.06-.63-1.9-1.48-2.5-2.5-.42-.71-.65-1.49-.75-2.28-.03-.25-.01-.5-.01-.76.01-2.92-.01-5.84.02-8.76.13-1.43.79-2.85 1.74-3.95 1.28-1.46 3.25-2.31 5.23-2.35 1.65-.03 3.3.39 4.67 1.33v-2.9c-.01-1.22-.52-2.42-1.34-3.34-.79-.88-1.82-1.38-2.89-1.48-.03-.01-.07-.02-.1-.02z" fill="currentColor"/></svg>;

function ContactoPage() {
    const [formData, setFormData] = useState({
        from_name: '',
        from_email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ msg: '', type: '' });
    
    const socialLinks = {
        whatsapp: 'https://wa.me/5217773367064',
        telegram: 'https://t.me/tu_usuario_tg',
        facebook: 'https://facebook.com/tu_pagina_real',
        instagram: 'https://instagram.com/tu_usuario_real',
        tiktok: 'https://tiktok.com/@tu_usuario_real'
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... (lógica de submit sin cambios)
    };

    return (
        <div className="bg-background-dark py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center">
                        {/* REPARACIÓN: Se eliminan clases de color. Heredarán de `body`. */}
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Contáctanos</h1>
                        <p className="mt-4 text-xl text-text-subtle">
                            ¿Tienes alguna pregunta, sugerencia o problema? Estamos aquí para ayudarte.
                        </p>
                    </div>
                    
                    <div className="mt-12 bg-background-light border border-border-color p-6 sm:p-8 rounded-2xl shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                {/* REPARACIÓN: Se elimina text-text-light. Heredará de `body`. */}
                                <label htmlFor="from_name" className="block text-sm font-medium">Tu Nombre</label>
                                <div className="mt-1">
                                    {/* REPARACIÓN: Se usa la clase .input-field para consistencia. */}
                                    <input type="text" name="from_name" id="from_name" value={formData.from_name} onChange={handleChange} required className="input-field" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="from_email" className="block text-sm font-medium">Tu Correo Electrónico</label>
                                <div className="mt-1">
                                    <input type="email" name="from_email" id="from_email" value={formData.from_email} onChange={handleChange} required className="input-field" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium">Mensaje</label>
                                <div className="mt-1">
                                    <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} required className="input-field"></textarea>
                                </div>
                            </div>
                            
                            {feedback.msg && <Alerta mensaje={feedback.msg} tipo={feedback.type} onClose={() => setFeedback({msg: '', type: ''})} />}

                            <div>
                                {/* REPARACIÓN: Se usa la clase .btn y .btn-primary para consistencia. */}
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
                        <div className="mt-8 flex justify-center items-center space-x-6">
                            <SocialIcon href={socialLinks.whatsapp} title="WhatsApp"><WhatsAppIcon/></SocialIcon>
                            <SocialIcon href={socialLinks.telegram} title="Telegram"><TelegramIcon/></SocialIcon>
                            <SocialIcon href={socialLinks.facebook} title="Facebook"><FacebookIcon/></SocialIcon>
                            <SocialIcon href={socialLinks.instagram} title="Instagram"><InstagramIcon/></SocialIcon>
                            <SocialIcon href={socialLinks.tiktok} title="TikTok"><TikTokIcon/></SocialIcon>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ContactoPage;
