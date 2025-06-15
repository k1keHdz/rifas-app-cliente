// src/pages/ContactoPage.js

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import Alerta from '../components/Alerta';
import EMAIL_CONFIG from '../emailjsConfig'; // Importamos la configuración centralizada

function ContactoPage() {
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ msg: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.from_name || !formData.from_email || !formData.message) {
        setFeedback({ msg: 'Por favor, completa todos los campos.', type: 'error' });
        return;
    }
    // Verificamos que la nueva clave exista
    if (!EMAIL_CONFIG.contactTemplateID) {
        setFeedback({ msg: 'La configuración para enviar correos no está completa. Contacta al administrador.', type: 'error' });
        return;
    }

    setIsSubmitting(true);
    setFeedback({ msg: '', type: '' });

    try {
      // Usamos la nueva clave para la plantilla de contacto
      await emailjs.send(
        EMAIL_CONFIG.serviceID,
        EMAIL_CONFIG.contactTemplateID,
        formData,
        EMAIL_CONFIG.publicKey
      );
      setFeedback({ msg: '¡Gracias por tu mensaje! Te responderemos pronto.', type: 'exito' });
      setFormData({ from_name: '', from_email: '', message: '' });
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setFeedback({ msg: 'Ocurrió un error al enviar tu mensaje. Por favor, intenta de nuevo.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Contáctanos</h1>
            <p className="mt-4 text-xl text-gray-600">
              ¿Tienes alguna pregunta, sugerencia o problema? Estamos aquí para ayudarte.
            </p>
          </div>
          
          <div className="mt-12 bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="from_name" className="block text-sm font-medium text-gray-700">Tu Nombre</label>
                <div className="mt-1">
                  <input type="text" name="from_name" id="from_name" value={formData.from_name} onChange={handleChange} required className="w-full border-gray-300 rounded-md shadow-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="from_email" className="block text-sm font-medium text-gray-700">Tu Correo Electrónico</label>
                <div className="mt-1">
                  <input type="email" name="from_email" id="from_email" value={formData.from_email} onChange={handleChange} required className="w-full border-gray-300 rounded-md shadow-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje</label>
                <div className="mt-1">
                  <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} required className="w-full border-gray-300 rounded-md shadow-sm"></textarea>
                </div>
              </div>
              
              {feedback.msg && <Alerta mensaje={feedback.msg} tipo={feedback.type} onClose={() => setFeedback({msg: '', type: ''})} />}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactoPage;