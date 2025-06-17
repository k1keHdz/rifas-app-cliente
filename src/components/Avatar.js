// src/components/Avatar.js
import React from 'react';

/**
 * Genera un color de fondo consistente y legible a partir de un string.
 * @param {string} str - El string de entrada, como un nombre de usuario.
 * @returns {string} Un color hexadecimal.
 */
const stringToColor = (str) => {
  if (!str || str.length === 0) return '#a0aec0'; // Tailwind's gray-400

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generar un color que no sea demasiado oscuro para que el texto blanco sea legible
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    // Aseguramos que el componente de color sea al menos 100 para evitar colores muy oscuros
    const adjustedValue = Math.min(Math.max(value, 100), 200); 
    color += ('00' + adjustedValue.toString(16)).substr(-2);
  }
  return color;
};

/**
 * Componente reutilizable para mostrar un avatar de usuario.
 * Muestra la imagen del usuario si está disponible (photoURL).
 * De lo contrario, muestra un círculo de color con la inicial del nombre.
 * @param {{photoURL: string, name: string, className: string}} props
 */
const Avatar = ({ photoURL, name, className }) => {
  // Si se proporciona una photoURL válida, se renderiza la imagen.
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={`Avatar de ${name}`}
        className={className}
      />
    );
  }

  // Si no, se renderiza el avatar con la inicial.
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const avatarColor = stringToColor(name);

  // El tamaño del texto se hereda del className (ej. text-2xl) para ser flexible.
  return (
    <div
      className={`${className} flex items-center justify-center text-white font-bold uppercase`}
      style={{ backgroundColor: avatarColor }}
      title={name}
    >
      {initial}
    </div>
  );
};

export default Avatar;
