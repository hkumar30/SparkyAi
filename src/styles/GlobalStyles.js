import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Montserrat:wght@400;500;600;700&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${theme.fonts.body};
    color: ${theme.colors.text};
    background-color: ${theme.colors.background};
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.fonts.heading};
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: ${theme.spacing.md};
    color: ${theme.colors.darkText};
  }

  h1 {
    font-size: 2.5rem;
  }

  h2 {
    font-size: 2rem;
  }

  h3 {
    font-size: 1.75rem;
  }

  h4 {
    font-size: 1.5rem;
  }

  p {
    margin-bottom: ${theme.spacing.md};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: ${theme.transition.fast};
    
    &:hover {
      color: ${theme.colors.lightPrimary};
    }
  }

  button, .button {
    font-family: ${theme.fonts.accent};
    font-weight: 600;
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.borderRadius.md};
    border: none;
    cursor: pointer;
    transition: ${theme.transition.medium};
    background-color: ${theme.colors.primary};
    color: white;
    
    &:hover {
      background-color: ${theme.colors.lightPrimary};
    }
    
    &.secondary {
      background-color: ${theme.colors.secondary};
      color: ${theme.colors.darkText};
      
      &:hover {
        background-color: ${theme.colors.lightSecondary};
      }
    }
    
    &.outline {
      background-color: transparent;
      border: 2px solid ${theme.colors.primary};
      color: ${theme.colors.primary};
      
      &:hover {
        background-color: ${theme.colors.lightGrey};
      }
    }
  }

  input, textarea, select {
    font-family: ${theme.fonts.body};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    border: 1px solid ${theme.colors.midGrey};
    width: 100%;
    margin-bottom: ${theme.spacing.md};
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};
  }

  .card {
    background: ${theme.colors.background};
    border-radius: ${theme.borderRadius.md};
    box-shadow: ${theme.boxShadow.md};
    padding: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.lg};
  }

  .flex {
    display: flex;
  }

  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .grid {
    display: grid;
    grid-gap: ${theme.spacing.md};
  }
`;

export default GlobalStyles;