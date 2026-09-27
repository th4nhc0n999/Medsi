/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7', // Primary Medical Blue
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        health: {
          green: '#10b981',
          emerald: '#059669',
          teal: '#14b8a6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(2, 132, 199, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -5px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.02)',
        'hover': '0 20px 35px -8px rgba(2, 132, 199, 0.16), 0 8px 16px -4px rgba(2, 132, 199, 0.08)',
      }
    },
  },
  plugins: [],
}
