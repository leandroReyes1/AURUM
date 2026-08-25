/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}", "./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        aurum: {
          purple: '#4A154B',
          'purple-light': '#6A2D6B',
          'purple-dark': '#350E36',
          pink: '#E91E63',
          'pink-light': '#F48FB1',
          'pink-dark': '#C2185B',
          bg: '#FAFAFD',
        }
      },
      fontFamily: {
        title: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
