/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a', // Slate 900
        darkCard: '#1e293b', // Slate 800
      }
    },
  },
  plugins: [],
}

