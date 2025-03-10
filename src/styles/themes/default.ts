export const theme = {
    colors: {
      primary: {
        main: '#002451',    // Dunkelblau
        hover: '#003366'
      },
      secondary: {
        main: '#D4AF37',    // Gold
        hover: '#E5C76B'
      },
      border: 'rgba(212,175,55,0.2)',
      background: '#f8f9fa',
      white: '#ffffff',
      status: {
        success: '#2e7d32',
        warning: '#e65100',
        error: '#d32f2f',
        info: '#0288d1'
      }
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '2.5rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px'
    }
  } as const;
  
  export type Theme = typeof theme;
  