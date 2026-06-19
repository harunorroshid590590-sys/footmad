/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7F25D3',
        'primary-dark': '#5A1A94',
        'primary-light': '#A855F7',
        background: '#050507',
        card: '#0D0D12',
        'card-hover': '#15151A',
        text: '#FFFFFF',
        'text-muted': '#9A9AA5',
        border: 'rgba(127,37,211,0.45)',
        glow: '#7F25D3',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(127,37,211,0.3)',
        'neon-strong': '0 0 30px rgba(127,37,211,0.5)',
        'card': '0 4px 20px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(127,37,211,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(127,37,211,0.6)' },
        }
      }
    },
  },
  plugins: [],
}
