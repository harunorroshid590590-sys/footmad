/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FootMad dark-navy theme. Token names kept stable so existing
        // classes (bg-card, text-text-muted, border-border, etc.) re-theme automatically.
        primary: '#3B6FF6',
        'primary-dark': '#2554C7',
        'primary-light': '#6B93FF',
        accent: '#EF4444',        // LIVE red
        'accent-dark': '#B91C1C',
        background: '#060A14',     // deep navy-black
        surface: '#0B1120',
        card: '#0F1626',
        'card-hover': '#182236',
        text: '#FFFFFF',
        'text-muted': '#8B95AC',
        border: 'rgba(255,255,255,0.08)',
        'border-strong': 'rgba(255,255,255,0.16)',
        glow: '#3B6FF6',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(59,111,246,0.25)',
        'neon-strong': '0 0 30px rgba(59,111,246,0.45)',
        'card': '0 8px 28px rgba(0,0,0,0.55)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59,111,246,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(59,111,246,0.6)' },
        }
      }
    },
  },
  plugins: [],
}
