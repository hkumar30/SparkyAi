import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaBolt, FaRocket, FaLightbulb, FaTrophy } from 'react-icons/fa';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { setRedirectPath } from '../utils/authUtils';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Styled Components
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${props => props.theme.spacing.xxl} ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  animation: ${fadeIn} 1s ease-out;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};
  
  svg {
    color: ${props => props.theme.colors.secondary};
    margin-right: ${props => props.theme.spacing.sm};
    font-size: 3rem;
  }
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fonts.heading};
  font-size: 3.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Tagline = styled.p`
  font-size: 1.5rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xl};
  max-width: 600px;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const VideoPlaceholder = styled.div`
  width: 100%;
  max-width: 800px;
  height: 450px;
  background-color: ${props => props.theme.colors.lightGrey};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.boxShadow.md};
  overflow: hidden;
  position: relative;
  
  &::after {
    content: 'Video Placeholder';
    font-size: 1.25rem;
    color: ${props => props.theme.colors.darkGrey};
  }
  
  @media (max-width: 768px) {
    height: 300px;
  }

  .play-button {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: ${props => props.theme.colors.primary};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    cursor: pointer;
    box-shadow: ${props => props.theme.boxShadow.md};
    transition: ${props => props.theme.transition.medium};
    animation: ${pulse} 2s infinite ease-in-out;
    
    &:hover {
      background-color: ${props => props.theme.colors.lightPrimary};
      transform: scale(1.1);
    }
  }
`;

const ModesSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
  background-color: white;
`;

const SectionTitle = styled.h2`
  font-family: ${props => props.theme.fonts.heading};
  font-size: 2rem;
  margin-bottom: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.primary};
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const ModesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.lg};
  width: 100%;
  max-width: 1000px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ModeCard = styled.div`
  flex: 1;
  max-width: 450px;
  padding: ${props => props.theme.spacing.xl};
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.md};
  text-align: center;
  transition: ${props => props.theme.transition.medium};
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.boxShadow.lg};
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ModeIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${props => props.color === 'primary' ? 
    `${props.theme.colors.primary}15` : 
    `${props.theme.colors.secondary}25`};
  color: ${props => props.color === 'primary' ? 
    props.theme.colors.primary : 
    props.theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ModeTitle = styled.h3`
  font-family: ${props => props.theme.fonts.heading};
  font-size: 1.5rem;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.darkText};
`;

const ModeDescription = styled.p`
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.lightText};
  flex-grow: 1;
`;

const FeaturesList = styled.ul`
  text-align: left;
  margin-bottom: ${props => props.theme.spacing.lg};
  width: 100%;
  padding-left: ${props => props.theme.spacing.lg};
  
  li {
    margin-bottom: ${props => props.theme.spacing.sm};
    color: ${props => props.theme.colors.text};
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const handleModeSelect = (mode) => {
    const path = `/${mode.toLowerCase().replace(' ', '-')}`;
    
    if (currentUser) {
      navigate(path);
    } else {
      // Store the intended destination and redirect to login
      setRedirectPath(path);
      navigate('/login');
    }
  };
  
  return (
    <HomeContainer>
      <HeroSection>
        <LogoContainer>
          <FaBolt size={48} />
          <Title>Sparky AI</Title>
        </LogoContainer>
        <Tagline>Make Writing Fun Again</Tagline>
        
        <VideoPlaceholder>
          <div className="play-button">
            <FaBolt />
          </div>
        </VideoPlaceholder>
        
        <ModesContainer>
          <ModeCard>
            <ModeIcon color="primary">
              <FaRocket />
            </ModeIcon>
            <ModeTitle>Engaged Learning</ModeTitle>
            <ModeDescription>
              Dive deep into your writing with interactive gamification, quizzes, and peer-style feedback. Perfect for mastering the art of writing.
            </ModeDescription>
            <FeaturesList>
              <li>Gamified writing exercises</li>
              <li>Interactive quizzes to test knowledge</li>
              <li>Detailed peer-style feedback</li>
            </FeaturesList>
            <Button 
              variant="primary" 
              size="large"
              fullWidth
              onClick={() => handleModeSelect('Engaged Learning')}
            >
              Start Engaged Learning
            </Button>
          </ModeCard>
          
          <ModeCard>
            <ModeIcon color="secondary">
              <FaLightbulb />
            </ModeIcon>
            <ModeTitle>Quick Learning</ModeTitle>
            <ModeDescription>
              Get rapid feedback and improvement suggestions for your writing. Ideal for quick revisions and timed writing practice.
            </ModeDescription>
            <FeaturesList>
              <li>Rapid review and revision assistance</li>
              <li>Timed sprint writing sessions</li>
              <li>Process-oriented writing guidance</li>
            </FeaturesList>
            <Button 
              variant="secondary" 
              size="large"
              fullWidth
              onClick={() => handleModeSelect('Quick Learning')}
            >
              Start Quick Learning
            </Button>
          </ModeCard>
        </ModesContainer>
      </HeroSection>
    </HomeContainer>
  );
};

export default Home;