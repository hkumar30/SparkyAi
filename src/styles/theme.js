const theme = {
  colors: {
    primary: '#8C1D40',     // Maroon
    secondary: '#FFC627',   // Gold
    lightPrimary: '#a93858',
    darkPrimary: '#701832',
    lightSecondary: '#ffd152',
    darkSecondary: '#e6b01f',
    background: '#FFFFFF',
    text: '#333333',
    lightText: '#666666',
    darkText: '#111111',
    success: '#2E7D32',
    error: '#D32F2F',
    warning: '#ED6C02',
    info: '#0288D1',
    lightGrey: '#F5F5F5',
    midGrey: '#E0E0E0',
    darkGrey: '#9E9E9E',
  },
  fonts: {
    heading: "'Playfair Display', serif", // Classic font for headings
    body: "'Source Sans Pro', sans-serif", // Clean, readable font for body text
    accent: "'Montserrat', sans-serif", // Modern font for buttons and accents
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '2rem',
    circle: '50%',
  },
  boxShadow: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    xl: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
  },
  transition: {
    fast: 'all 0.2s ease',
    medium: 'all 0.3s ease',
    slow: 'all 0.5s ease',
  },
};

export default theme;