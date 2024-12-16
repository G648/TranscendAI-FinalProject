/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';
// import Inter_Bold from './src/assets/Font/Inter(1)/static/Inter_28pt-Bold'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '460px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        redG: '#EA4335',       // Vermelho Google
        orangeG: '#FF9D00',   // Laranja Google
        blueG: '#4285F4',      // Azul Google
        greenG: '#34A853',     // Verde Google
    
        orangeTrans: '#FA7B3B',    // Laranja Padrão
        greyTrans: '#383838',      // Cinza Padrão
        blackTrans: '#1E1E1E',     // Preto Padrão
        greyLightTrans: '#EEEEEE', // Cinza Claro Padrão
        whiteTrans: '#F9F9F9',     // Branco Padrão

      },
      fontFamily: {
        sans: ['Manrope', ...defaultTheme.fontFamily.sans],
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      screens: {
        tablet: '768px', // Começa em 768px e vai até antes de `md` (geralmente 1024px)
        surface: '540px', // Define o breakpoint para Surface Duo
        
      },
    },
  },
  plugins: [],
};
