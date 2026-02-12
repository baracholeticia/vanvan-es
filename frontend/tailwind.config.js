/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#F66B0E",
        "secondary": "#557D96",
        "tetiary": "#E1C69A",
        "dark": "#353535",
        "text": "#112B3C",
        "subtle-text": "#646464",
        "accent": "#B1B1B1",
        "light": "#EEEEEF",
        "success": "#31D0AA",
        "white": '#FAFAFA'
      },
      fontFamily: {
        "google-sans-flex": "Google Sans Flex",
        sans: ['"Google Sans Flex"', 'sans-serif'],
      },
      screens: {
        'short': { 'raw': '(max-height: 800px)' },
      },
      fontSize: {
        'title': ['8rem', {
          lineHeight: '0.8',
          letterSpacing: '-0.08rem',
          fontWeight: '700',
        }],        
        'header-1': ['4rem', {
          lineHeight: '0.85',
          letterSpacing: '-0.08rem',
          fontWeight: '700',
        }],
        'header-2': ['2.5rem', {
          lineHeight: '0.9',
          letterSpacing: '-0.05rem',
          fontWeight: '700',
        }],
        'header-3': ['1.5rem', {
          lineHeight: '0.9',
          letterSpacing: '-0.03rem',
          fontWeight: '700',
        }],
        'subtitle': ['1.5rem', {
          lineHeight: 'normal',
          fontWeight: '500',
        }],
        'medium': ['1.25rem', {
          lineHeight: '1.5rem',
          fontWeight: '500',
        }],
        'body': ['1rem', {
          lineHeight: '1.4rem',
          fontWeight: '500',
        }],
        'bold': ['1rem', {
          lineHeight: 'normal',
          fontWeight: 'bold',
        }],
        'small': ['0.875rem', {
          lineHeight: 'normal',
          fontWeight: '500',
        }],
        'pre-title': ['0.75rem', {
          lineHeight: 'normal',
          fontWeight: '700',
          letterSpacing: '0.0225rem',
          textTransform: 'uppercase',
        }],
        'button-text': ['1rem', {
          lineHeight: 'normal',
          fontWeight: '700',
          letterSpacing: '0.04rem',
          textTransform: 'uppercase',
        }],
        'link-text': ['1rem', {
          lineHeight: 'normal',
          fontWeight: '700',
          letterSpacing: '0.04rem',
        }],
      },
      letterSpacing: {
        "narrow": "-0.02em",
        "normal": "0em",
        "wider": "0.03em",
      },
      boxShadow: {
        "secondary": " 0px 4px 10px rgba(246, 107, 14, 0.3)",
        "primary": " 0px 4px 10px rgba(102, 138, 161, 0.1)",
      },
    },
  },
  plugins: [],
}