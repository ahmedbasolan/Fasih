/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Fasih brand palette — mirrors C tokens for className use
        jade: {
          DEFAULT: '#00FF95',
          dim: 'rgba(0,255,149,0.12)',
          2: '#00CC78',
        },
        gold: {
          DEFAULT: '#F5C842',
          cultural: '#D4A017',
        },
        surface: '#1A1A2E',
        card: '#12122A',
        border: 'rgba(255,255,255,0.08)',
        error: '#FF4D4D',
      },
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular'],
        semibold: ['PlusJakartaSans_600SemiBold'],
        bold: ['PlusJakartaSans_700Bold'],
        arabic: ['Tajawal_400Regular'],
      },
    },
  },
  plugins: [],
};
