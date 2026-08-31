/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--jc-canvas) / <alpha-value>)',
        surface: 'rgb(var(--jc-surface) / <alpha-value>)',
        foreground: 'rgb(var(--jc-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--jc-primary) / <alpha-value>)',
          foreground: 'rgb(var(--jc-primary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--jc-muted) / <alpha-value>)',
          background: 'rgb(var(--jc-muted-background) / <alpha-value>)',
        },
        border: 'rgb(var(--jc-border) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
