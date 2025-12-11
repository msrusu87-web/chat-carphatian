/**
 * Theme Configuration
 * 
 * Dark-first design system with professional color palette.
 * This defines our brand colors, typography, and visual identity.
 * 
 * Color Strategy:
 * - Primary (Indigo-600): Trust, technology, professional
 * - Success (Emerald-500): Positive actions, confirmations
 * - Destructive (Rose-500): Errors, warnings, dangerous actions
 * - Muted: Background layers for dark mode
 */

export const theme = {
  // Brand Colors (Tailwind compatible)
  colors: {
    primary: {
      DEFAULT: '#4F46E5', // Indigo-600
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
    },
    success: {
      DEFAULT: '#10B981', // Emerald-500
      light: '#34D399',
      dark: '#059669',
    },
    destructive: {
      DEFAULT: '#F43F5E', // Rose-500
      light: '#FB7185',
      dark: '#E11D48',
    },
    warning: {
      DEFAULT: '#F59E0B', // Amber-500
      light: '#FCD34D',
      dark: '#D97706',
    },
  },

  // Typography
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },

  // Breakpoints (mobile-first)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  // Border radius
  radius: {
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px',
  },

  // Shadows (for depth)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },

  // Animation durations
  animation: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
} as const;

export default theme;
