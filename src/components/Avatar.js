// src/components/Avatar.js
import React from 'react';

/**
 * Genera un color de fondo consistente a partir de un string.
 * @param {string} str - El string de entrada, como un nombre de usuario.
 * @returns {string} Un color hexadecimal.
 */
const stringToColor = (str) => {
  if (!str || str.length === 0) return '#a0aec0'; // Color por defecto

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

/**
 * REPARACIÓN: Nueva función para obtener un color de texto de alto contraste.
 * Determina si el texto sobre un color de fondo debe ser oscuro o claro.
 * @param {string} hexColor - El color de fondo en formato hexadecimal (ej. "#RRGGBB").
 * @returns {string} La clase de Tailwind para el color del texto ('text-black' o 'text-white').
 */
const getContrastColor = (hexColor) => {
    if (!hexColor) return 'text-white';
    // Quita el '#' si está presente
    const hex = hexColor.replace('#', '');
    // Convierte a RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Fórmula para calcular la "luminancia" percibida
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    // Si el fondo es claro (YIQ >= 128), usa texto negro. De lo contrario, usa texto blanco.
    return (yiq >= 128) ? 'text-black' : 'text-white';
};


/**
 * Componente reutilizable para mostrar un avatar de usuario.
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
  // REPARACIÓN: Se determina dinámicamente el color del texto para garantizar el contraste.
  const textColorClass = getContrastColor(avatarColor);

  return (
    <div
      // REPARACIÓN: Se elimina 'text-white' y se usa la clase de color dinámica.
      className={`${className} flex items-center justify-center ${textColorClass} font-bold uppercase`}
      style={{ backgroundColor: avatarColor }}
      title={name}
    >
      {initial}
    </div>
  );
};

export default Avatar;
