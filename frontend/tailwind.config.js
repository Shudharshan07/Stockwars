/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
        },
      },
    },
  },
  plugins: [],
}
