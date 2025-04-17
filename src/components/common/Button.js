import React from 'react';
import styled, { css } from 'styled-components';

const StyledButton = styled.button`
  font-family: ${props => props.theme.fonts.accent};
  font-weight: 600;
  font-size: ${props => props.size === 'large' ? '1.2rem' : props.size === 'small' ? '0.9rem' : '1rem'};
  padding: ${props => props.size === 'large' 
    ? `${props.theme.spacing.md} ${props.theme.spacing.xl}` 
    : props.size === 'small' 
      ? `${props.theme.spacing.xs} ${props.theme.spacing.md}` 
      : `${props.theme.spacing.sm} ${props.theme.spacing.lg}`};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  cursor: pointer;
  transition: ${props => props.theme.transition.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  ${props => props.variant === 'primary' && css`
    background-color: ${props.theme.colors.primary};
    color: white;
    
    &:hover, &:focus {
      background-color: ${props.theme.colors.lightPrimary};
      transform: translateY(-2px);
      box-shadow: ${props.theme.boxShadow.md};
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: ${props.theme.boxShadow.sm};
    }
  `}
  
  ${props => props.variant === 'secondary' && css`
    background-color: ${props.theme.colors.secondary};
    color: ${props.theme.colors.darkText};
    
    &:hover, &:focus {
      background-color: ${props.theme.colors.lightSecondary};
      transform: translateY(-2px);
      box-shadow: ${props.theme.boxShadow.md};
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: ${props.theme.boxShadow.sm};
    }
  `}
  
  ${props => props.variant === 'outline' && css`
    background-color: transparent;
    border: 2px solid ${props.theme.colors.primary};
    color: ${props.theme.colors.primary};
    
    &:hover, &:focus {
      background-color: ${props.theme.colors.lightGrey};
      transform: translateY(-2px);
      box-shadow: ${props.theme.boxShadow.md};
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: ${props.theme.boxShadow.sm};
    }
  `}
  
  ${props => props.variant === 'text' && css`
    background-color: transparent;
    color: ${props.theme.colors.primary};
    padding: ${props.theme.spacing.xs};
    
    &:hover, &:focus {
      background-color: rgba(140, 29, 64, 0.1);
    }
  `}
  
  ${props => props.disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover, &:focus {
      transform: none;
      box-shadow: none;
    }
  `}
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  disabled = false, 
  icon, 
  onClick, 
  type = 'button',
  ...rest 
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {icon && icon}
      {children}
    </StyledButton>
  );
};

export default Button;