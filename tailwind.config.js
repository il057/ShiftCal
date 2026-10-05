/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zzz: {
          bg: '#111215',
          panel: '#1E2024',
          slot: '#181A1E',
          card: '#2A2E35',
          'card-hover': '#333740',
          yellow: '#E8F624',
          'yellow-hover': '#f0fc38',
          red: '#E03030',
          'red-hover': '#ef4444',
          cyan: '#00F0FF',
          border: '#181A1D',
          'border-dark': '#0f1012',
          'border-light': 'rgba(255, 255, 255, 0.08)',
          muted: '#9CA3AF',
          darkmuted: '#4B5563',
          text: '#FFFFFF',
        },
        brand: {
          500: '#E8F624',
          600: '#d9e61f',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
        unbounded: ['"Unbounded Sans"', '"Dela Gothic One"', 'Impact', '"Arial Black"', '"PingFang SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Chakra Petch"', '"DIN Alternate"', '"SF Mono"', 'Menlo', 'monospace'],
        tech: ['"JetBrains Mono"', '"Chakra Petch"', '"DIN Alternate"', '"SF Pro Display"', '"SF Mono"', 'Menlo', 'monospace'],
        display: ['"Unbounded Sans"', '"Dela Gothic One"', 'Impact', '"Arial Black"', '"PingFang SC"', 'sans-serif'],
      },
      boxShadow: {
        sunken: 'inset 0 2px 6px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06)',
        'sunken-deep': 'inset 0 3px 8px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.08)',
        'zzz-hard': '0 3px 0 #181A1D',
        'zzz-hard-sm': '0 2px 0 #181A1D',
        'zzz-yellow': '0 0 16px rgba(232, 246, 36, 0.35)',
        'zzz-yellow-active': '0 0 24px rgba(232, 246, 36, 0.6)',
      },
      borderRadius: {
        'folder-top': '16px 16px 0 0',
      }
    },
  },
  plugins: [],
}
