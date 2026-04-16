/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover:   '#4338CA',
          light:   '#EEF2FF',
        },
        sidebar:  '#0F172A',
        canvas:   '#F8FAFC',
        success:  '#10B981',
        danger:   '#F43F5E',
        warning:  '#F59E0B',
        chart: {
          indigo: '#4F46E5',
          teal:   '#14B8A6',
          amber:  '#F59E0B',
        }
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        xl:   '16px',
        '2xl':'20px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
        btn:   '0 1px 2px rgba(79,70,229,0.3)',
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
