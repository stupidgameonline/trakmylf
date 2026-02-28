/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        card: '#111111',
        cardAlt: '#1a1a1a',
        accent: '#f5a623',
        accentAlt: '#ff2d78',
        accentCyan: '#00e5ff',
        success: '#00ff88',
        danger: '#ff4444',
        borderSubtle: '#2a2a2a',
        textSecondary: '#888888'
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.3)',
        glowAccent: '0 0 0 1px rgba(245,166,35,0.5), 0 0 24px rgba(245,166,35,0.18)',
        glowCyan: '0 0 0 1px rgba(0,229,255,0.4), 0 0 24px rgba(0,229,255,0.14)',
        glowSuccess: '0 0 0 1px rgba(0,255,136,0.5), 0 0 24px rgba(0,255,136,0.15)'
      },
      borderRadius: {
        section: '16px'
      },
      keyframes: {
        pulseClock: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.75' }
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        }
      },
      animation: {
        pulseClock: 'pulseClock 2s ease-in-out infinite',
        fadeInUp: 'fadeInUp 0.45s ease-out',
        shake: 'shake 0.6s cubic-bezier(.36,.07,.19,.97) both'
      }
    }
  },
  plugins: []
};
