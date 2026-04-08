/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff272a',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#ffd4d4',
          foreground: '#ff272a',
        },
        background: '#ffffff',
        foreground: '#000000',
        card: {
          DEFAULT: '#fbfaf9',
          foreground: '#000000',
        },
        muted: {
          DEFAULT: '#e8e8e8',
          foreground: '#949494',
        },
        success: {
          DEFAULT: '#00c417',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#ff7308',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '24px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
