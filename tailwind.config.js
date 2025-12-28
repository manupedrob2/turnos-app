/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'lato': ['Lato', 'sans-serif'],
      },
      colors: {
        'gold': '#D4AF37',
        'gold-dim': 'rgba(212, 175, 55, 0.1)',
        'bg-body': '#050505',
        'bg-surface': '#121212',
        'bg-card': '#1A1A1A',
      }
    },
  },
  plugins: [],
}