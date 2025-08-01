import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{html,js}',
    './components/**/*.{html,js}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
        system: ['system-ui', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
        lexend: ['Lexend', 'sans-serif'],
        dancingscript: ['Dancing Script', 'cursive'],
        greatvibes: ['Great Vibes', 'cursive'],
        pacifico: ['Pacifico', 'cursive'],
        italianno: ['Italianno', 'cursive'],
        satisfy: ['Satisfy', 'cursive'],
        caveat: ['Caveat', 'cursive'],
        orbitron: ['Orbitron', 'sans-serif'],
        pressstart2p: ['"Press Start 2P"', 'cursive'],
        gloriahallelujah: ['"Gloria Hallelujah"', 'cursive'],
        shadowsintolight: ['"Shadows Into Light"', 'cursive'],
      },
    },
    screens: {
      'xxs': '320px', // for very small devices
      'xs': '375px',  // for iPhone SE, etc.
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ]
  }
}

