import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaLock, FaBolt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import { getRedirectPath } from '../utils/authUtils';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: ${props => props.theme.spacing.lg};
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.lg};
  padding: ${props => props.theme.spacing.xl};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  
  svg {
    color: ${props => props.theme.colors.secondary};
    margin-right: ${props => props.theme.spacing.sm};
  }
  
  h1 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FormIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.darkGrey};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  padding-left: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.error ? props.theme.colors.error : props.theme.colors.midGrey};
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: ${props => props.theme.fonts.body};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? props.theme.colors.error : props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.error ? 
      `${props.theme.colors.error}30` : 
      `${props.theme.colors.primary}30`};
  }
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.error};
  font-size: 0.875rem;
  margin-top: ${props => props.theme.spacing.xs};
  margin-bottom: 0;
`;

const ForgotPassword = styled(Link)`
  align-self: flex-end;
  font-size: 0.875rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FormActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.md};
  font-size: 0.9rem;
  
  a {
    color: ${props => props.theme.colors.primary};
    font-weight: 600;
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    try {
      setLoading(true);
      await login(formData.email, formData.password);
      
      // Navigate to the stored path or home if none exists
      const redirectPath = getRedirectPath();
      navigate(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setErrors({ general: 'Invalid email or password' });
      } else {
        setErrors({ general: 'Failed to sign in. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <FaBolt size={30} />
          <h1>Sparky AI</h1>
        </Logo>
        
        <Form onSubmit={handleSubmit}>
          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
          
          <FormGroup>
            <FormIcon>
              <FaEnvelope />
            </FormIcon>
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormIcon>
              <FaLock />
            </FormIcon>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>
          
          <ForgotPassword to="/forgot-password">Forgot Password?</ForgotPassword>
          
          <FormActions>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </FormActions>
          
          <RegisterLink>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </RegisterLink>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;