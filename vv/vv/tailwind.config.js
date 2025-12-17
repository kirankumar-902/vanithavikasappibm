/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#FB923C',
          purple: '#6B46C1',
        },
        accent: {
          yellow: '#FCD34D',
          peach: '#FED7AA',
          lavender: '#E0E7FF',
          deepPurple: '#4C1D95',
        },
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
