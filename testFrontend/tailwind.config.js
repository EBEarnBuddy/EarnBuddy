/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}", // This will scan App.tsx, main.tsx, etc.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}