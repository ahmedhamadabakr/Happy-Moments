import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['var(--font-arabic)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      direction: {
        rtl: 'rtl',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
