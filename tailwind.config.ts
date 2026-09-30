import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '20px', md: '32px', lg: '40px' },
      screens: { lg: '1200px' },
    },
    extend: {
      colors: {
        paper: '#FAFBFC',
        surface: '#FFFFFF',
        sunken: '#EFF2F6',
        mist: '#DFE4EA',
        silver: '#B8C0CB',
        slate: '#3A4658',
        navy: '#0A1930',
        signal: '#0A5FFF',
        'signal-tint': '#E7EFFF',
        danger: '#B42318',
        success: '#067647',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '28px',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
} satisfies Config;