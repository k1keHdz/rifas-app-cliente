/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
      },
      colors: {
        'background-dark': 'rgb(var(--background-dark) / <alpha-value>)',
        'background-light': 'rgb(var(--background-light) / <alpha-value>)',
        'text-light': 'rgb(var(--text-light) / <alpha-value>)',
        'text-dark': 'rgb(var(--text-dark) / <alpha-value>)',
        'text-subtle': 'rgb(var(--text-subtle) / <alpha-value>)',
        'white': 'rgb(var(--color-white) / <alpha-value>)',
        
        /* --- El Traductor Universal en Acción --- */
        'accent-start': 'rgb(var(--color-accent-start) / <alpha-value>)',
        'accent-end': 'rgb(var(--color-accent-end) / <alpha-value>)',
        'accent-primary': 'rgb(var(--color-accent-primary) / <alpha-value>)',
        'accent-secondary': 'rgb(var(--color-accent-secondary) / <alpha-value>)',

        'success': 'rgb(var(--color-success) / <alpha-value>)',
        'danger': 'rgb(var(--color-danger) / <alpha-value>)',
        'warning': 'rgb(var(--color-warning) / <alpha-value>)',
        'border-color': 'rgb(var(--border-color) / <alpha-value>)',
      },
      boxShadow: {
        'glow-md': 'var(--shadow-glow-md)',
        'glow-lg': 'var(--shadow-glow-lg)',
      },
      borderRadius: {
        'app': 'var(--border-radius-base)',
        'app-lg': 'var(--border-radius-lg)',
      },
    },
  },
  plugins: [],
}
