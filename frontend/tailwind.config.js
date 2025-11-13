/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fia-navy': '#1C3D5A',
        'fia-navy-light': '#2C4D6A',
        'fia-navy-dark': '#0C2D4A',
        'fia-teal': '#2C7A7B',
        'fia-teal-dark': '#1C6A6B',
        'fia-gold': '#D4AF37',
        'fia-gold-light': '#E4BF47',
      },
    },
  },
  plugins: [],
}
