/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0faff',
          100: '#d6f0ff',
          200: '#a8deff',
          300: '#7accff',
          400: '#4db8ff',
          500: '#1aa3ff',
          600: '#008ae6',
          700: '#006bb3',
          800: '#004d80',
          900: '#002e4d',
        },
        grayneu: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}
export default config