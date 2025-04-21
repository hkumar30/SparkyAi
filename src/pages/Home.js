import React, { useState } from 'react';
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

const VideoSection = styled.div`
  width: 100%;
  max-width: 800px;
  margin-bottom: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.boxShadow.md};
  position: relative;
  background-color: ${props => props.theme.colors.lightGrey};
  
  /* Create a fixed aspect ratio container using padding trick */
  &::before {
    content: "";
    display: block;
    padding-top: 56.25%; /* 16:9 Aspect Ratio */
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const PlayButtonWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
`;

const PlayButton = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${props => props.theme.boxShadow.md};
  transition: ${props => props.theme.transition.medium};
  animation: ${pulse} 2s infinite ease-in-out;
  
  svg {
    margin: 0; /* Remove any potential margin from the SVG */
    padding: 0; /* Remove any potential padding from the SVG */
    font-size: 1.5rem; /* Explicitly set the size of the icon */
  }
  
  &:hover {
    background-color: ${props => props.theme.colors.lightPrimary};
    transform: scale(1.1);
  }
`;

const ResponsiveIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
`;

const ThumbnailPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.colors.lightGrey};
  background-image: url("https://img.youtube.com/vi/0uKC5reBiqI/maxresdefault.jpg");
  background-size: cover;
  background-position: center;
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
  const [videoPlaying, setVideoPlaying] = useState(false);
  
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
  
  const handlePlayClick = () => {
    setVideoPlaying(true);
  };
  
  return (
    <HomeContainer>
      <HeroSection>
        <LogoContainer>
          <FaBolt size={48} />
          <Title>Sparky AI</Title>
        </LogoContainer>
        <Tagline>Make Writing Fun Again</Tagline>
        
        <VideoSection>
          {!videoPlaying && (
            <>
              <ThumbnailPlaceholder />
              <PlayButtonWrapper>
                <PlayButton onClick={handlePlayClick}>
                  <FaBolt />
                </PlayButton>
              </PlayButtonWrapper>
            </>
          )}
          {videoPlaying && (
            <ResponsiveIframe
              src="https://www.youtube.com/embed/0uKC5reBiqI?autoplay=1"
              title="Sparky AI Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </VideoSection>
        
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