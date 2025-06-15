// src/emailjsConfig.js

const EMAIL_CONFIG = {
  serviceID: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  // Este es para la confirmación de pago
  templateID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  // Este es el nuevo, para el formulario de contacto
  contactTemplateID: process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID, 
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
};

export default EMAIL_CONFIG;