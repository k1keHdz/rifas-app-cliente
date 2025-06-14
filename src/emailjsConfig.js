// src/emailjsConfig.js

const EMAIL_CONFIG = {
  serviceID: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  templateID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
};

export default EMAIL_CONFIG;