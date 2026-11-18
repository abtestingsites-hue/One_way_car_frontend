/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#09090b', // Deep Onyx / True Dark
          900: '#121214', // Jet Black
          850: '#18181b', // Surface Dark
          800: '#27272a', // Borders / Accents Dark
          700: '#3f3f46',
        },
        red: {
          500: '#ef4444',
          600: '#dc2626', // Automotive Primary Red
          700: '#b91c1c',
          800: '#991b1b',
        },
        silver: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'enterprise': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'red-accent': '0 0 15px -3px rgba(220, 38, 38, 0.3)',
      }
    },
  },
  plugins: [],
}
