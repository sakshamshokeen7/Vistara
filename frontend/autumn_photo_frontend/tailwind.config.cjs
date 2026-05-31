module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'dark-page': '#0a0a0a',
        'dark-surface': '#111111',
        'dark-border': 'rgba(255,255,255,0.07)',
        'dark-border-hover': 'rgba(255,255,255,0.15)',
        'dark-border-focus': 'rgba(59,130,246,0.45)',
        'dark-text-primary': '#f5f5f5',
        'dark-text-secondary': '#a3a3a3',
        'dark-text-muted': '#525252',
        'dark-text-disabled': '#3a3a3a',
        'accent-soft-bg': 'rgba(59,130,246,0.10)',
        'accent-soft-border': 'rgba(59,130,246,0.20)',
        'accent-soft-text': '#93c5fd',
        'accent-strong-text': '#1d4ed8',
      },
      fontFamily: {
        'serif': ['Instrument Serif', 'serif'],
        'sans': ['Geist', 'sans-serif'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', fontWeight: '400', letterSpacing: '-0.02em' }],
        'h2': ['32px', { lineHeight: '1.2', fontWeight: '400' }],
        'card-title': ['15px', { lineHeight: '1.3', fontWeight: '400' }],
        'eyebrow': ['11px', { lineHeight: '1', fontWeight: '500', letterSpacing: '0.1em' }],
        'filter-label': ['10px', { lineHeight: '1.2', fontWeight: '500', letterSpacing: '0.12em' }],
        'body': ['13px', { lineHeight: '1.6', fontWeight: '400' }],
        'btn': ['12px', { lineHeight: '1', fontWeight: '500', letterSpacing: '0.01em' }],
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        cardIn: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease both',
        cardIn: 'cardIn 0.45s ease both',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(.22,.68,0,1.2)',
      },
    },
  },
};
