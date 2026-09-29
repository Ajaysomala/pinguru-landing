/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1.05rem' }],
        xs:    ['0.8125rem', { lineHeight: '1.25rem' }],
        sm:    ['0.9375rem', { lineHeight: '1.4rem' }],
        base:  ['1.025rem', { lineHeight: '1.6rem' }],
        lg:    ['1.15rem', { lineHeight: '1.75rem' }],
        xl:    ['1.3rem', { lineHeight: '1.85rem' }],
        '2xl': ['1.6rem', { lineHeight: '2.1rem' }],
        '3xl': ['2rem', { lineHeight: '2.4rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.8rem' }],
      },
      colors: {
        canvas:   'var(--color-canvas, #09090B)',
        surface:  'var(--color-card, #121218)',
        primary: {
          DEFAULT: '#6366F1',
          hover:   '#4F46E5',
          light:   'rgba(99, 102, 241, 0.15)',
        },
        accent: {
          DEFAULT: '#06B6D4',
          hover:   '#0891B2',
          light:   'rgba(6, 182, 212, 0.15)',
        },
        sidebar:  'var(--color-sidebar, #09090B)',
        success:  '#10B981',
        danger:   '#F43F5E',
        warning:  '#F59E0B',
        chart: {
          indigo: '#6366F1',
          teal:   '#06B6D4',
          amber:  '#F59E0B',
          pink:   '#A855F7',
        }
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        xl:   '18px',
        '2xl':'24px',
      },
      boxShadow: {
        card:  '0 4px 24px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        modal: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        btn:   '0 4px 20px rgba(99, 102, 241, 0.35)',
        glow:  '0 0 24px rgba(6, 182, 212, 0.35)',
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
