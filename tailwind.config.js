/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cognitive: {
          primary: 'var(--primary)',
          'primary-container': 'var(--primary-container)',
          'on-primary-container': 'var(--on-primary-container)',
          secondary: 'var(--secondary)',
          'secondary-container': 'var(--secondary-container)',
          'on-secondary-container': 'var(--on-secondary-container)',
          surface: 'var(--surface)',
          'surface-dim': 'var(--surface-dim)',
          'on-surface': 'var(--on-surface)',
          'on-surface-variant': 'var(--on-surface-variant)',
          outline: 'var(--outline)',
          'outline-variant': 'var(--outline-variant)',
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        slate: {
          50: 'rgba(var(--slate-50), <alpha-value>)',
          100: 'rgba(var(--slate-100), <alpha-value>)',
          200: 'rgba(var(--slate-200), <alpha-value>)',
          300: 'rgba(var(--slate-300), <alpha-value>)',
          400: 'rgba(var(--slate-400), <alpha-value>)',
          500: 'rgba(var(--slate-500), <alpha-value>)',
          600: 'rgba(var(--slate-600), <alpha-value>)',
          700: 'rgba(var(--slate-700), <alpha-value>)',
          800: 'rgba(var(--slate-800), <alpha-value>)',
          850: 'rgba(var(--slate-850), <alpha-value>)',
          900: 'rgba(var(--slate-900), <alpha-value>)',
          950: 'rgba(var(--slate-950), <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'wave': 'wave 1.2s infinite ease-in-out',
        'spring': 'spring 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'press': 'press 0.2s cubic-bezier(0.2, 0, 0, 1) forwards',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1.0)' },
        },
        spring: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        press: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.97)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
