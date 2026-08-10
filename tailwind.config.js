/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          hover:   '#6D28D9',
          light:   '#EDE9FE',
        },
        accent: {
          DEFAULT: '#DB2777',
          hover:   '#BE185D',
          light:   '#FCE7F3',
        },
        sidebar:  '#0D0B1E',
        canvas:   '#F8F7FF',
        success:  '#10B981',
        danger:   '#F43F5E',
        warning:  '#F59E0B',
        chart: {
          indigo: '#7C3AED',
          teal:   '#06B6D4',
          amber:  '#F59E0B',
          pink:   '#DB2777',
        }
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        xl:   '18px',
        '2xl':'24px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(15,10,30,0.08), 0 1px 2px rgba(15,10,30,0.04)',
        modal: '0 24px 60px rgba(15,10,30,0.2)',
        btn:   '0 4px 14px rgba(124,58,237,0.35)',
      },
      animation: {
        'slide-in':   'slideIn 0.25s ease-out',
        'fade-in':    'fadeIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        }
      }
    }
  },
  plugins: []
}
