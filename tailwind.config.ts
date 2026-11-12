import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#050505',
          pure: '#000000',
          sidebar: '#080808',
          secondary: '#0B0B0B',
        },
        card: {
          DEFAULT: '#101010',
          secondary: '#141414',
          elevated: '#181818',
          hover: '#1D1D1D',
          border: '#252525',
        },
        border: {
          DEFAULT: '#252525',
          subtle: '#1F1F1F',
          active: '#444444',
        },
        surface: {
          1: '#101010',
          2: '#141414',
          3: '#181818',
          hover: '#1D1D1D',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#A3A3A3',
          muted: '#737373',
          disabled: '#525252',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
