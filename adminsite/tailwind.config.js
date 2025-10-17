/** @type {import('tailwindcss').Config} */
const config = {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                ocean: {
                    50: '#f0faff', // rất nhạt
                    100: '#d6f0ff',
                    200: '#a8deff',
                    300: '#7accff',
                    400: '#4db8ff',
                    500: '#1aa3ff', // màu chính
                    600: '#008ae6',
                    700: '#006bb3',
                    800: '#004d80',
                    900: '#002e4d', // rất đậm (dùng dark)
                },
            },
            surface: {
                light: '#f9fafb', // tương đương gray-50
                dark: '#1f2937', // tương đương gray-800
            },
            card: {
                light: '#ffffff',
                dark: '#374151',
            },
            border: {
                light: '#e5e7eb',
                dark: '#4b5563',
            },
            text: {
                primary: {
                    light: '#111827',
                    dark: '#f9fafb',
                },
                secondary: {
                    light: '#6b7280',
                    dark: '#d1d5db',
                },
            },
            primary: {
                DEFAULT: '#2563eb', // blue-600
                light: '#3b82f6', // blue-500
                dark: '#1d4ed8', // blue-700
            },
        },
    },
    plugins: [],
};
export default config;
