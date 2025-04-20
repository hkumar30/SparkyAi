import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBolt, FaSignOutAlt, FaTrophy, FaUserCircle, FaMedal } from 'react-icons/fa';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import Button from './Button';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background-color: white;
  box-shadow: ${props => props.theme.boxShadow.sm};
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-family: ${props => props.theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  
  svg {
    margin-right: ${props => props.theme.spacing.sm};
    color: ${props => props.theme.colors.secondary};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    display: ${props => props.mobileOpen ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    padding: ${props => props.theme.spacing.md};
    box-shadow: ${props => props.theme.boxShadow.md};
  }
`;

const NavLink = styled(Link)`
  font-family: ${props => props.theme.fonts.accent};
  font-weight: 600;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text};
  text-decoration: none;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: ${props => props.theme.transition.fast};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${props => props.theme.spacing.xs};
  }
  
  &:hover {
    color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.lightGrey};
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.colors.primary};
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const UserControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.colors.lightGrey};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${props => props.theme.colors.primary};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: ${props => props.theme.spacing.sm};
  }
  
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.darkText};
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: ${props => props.theme.spacing.sm};
  }
`;

const Navbar = ({ user }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <NavbarContainer>
      <Logo to="/">
        <FaBolt size={24} /> Sparky AI
      </Logo>
      
      <MobileMenuButton onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? '✕' : '☰'}
      </MobileMenuButton>
      
      <NavLinks mobileOpen={mobileOpen}>
        <NavLink to="/" active={isActive('/')}>
          Home
        </NavLink>
        
        <NavLink to="/leaderboard" active={isActive('/leaderboard')}>
          <FaTrophy size={16} /> Leaderboard
        </NavLink>
        
        <NavLink to="/achievements" active={isActive('/achievements')}>
          <FaMedal size={16} /> Achievements
        </NavLink>
        
        {user ? (
          <>
            <UserInfo>
              <div className="avatar">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="name">
                Welcome, {user.displayName || user.email.split('@')[0]}!
              </div>
            </UserInfo>
            
            <Button
              variant="outline"
              size="small"
              onClick={handleLogout}
              icon={<FaSignOutAlt />}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <NavLink to="/login" active={isActive('/login')}>
              Login
            </NavLink>
            <NavLink to="/register" active={isActive('/register')}>
              <Button variant="primary" size="small">Sign Up</Button>
            </NavLink>
          </>
        )}
      </NavLinks>
    </NavbarContainer>
  );
};

export default Navbar;