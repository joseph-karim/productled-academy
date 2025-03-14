/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'pl-yellow': '#FFD23F',
        'pl-dark': '#1C1C1C',
        'pl-gray': '#2A2A2A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundColor: {
        primary: '#1C1C1C',
        secondary: '#2A2A2A',
        accent: '#FFD23F',
      },
      borderColor: {
        primary: '#2A2A2A',
        accent: '#FFD23F',
      },
      textColor: {
        primary: '#FFFFFF',
        secondary: '#A0A0A0',
        accent: '#FFD23F',
      },
    },
  },
  plugins: [],
};