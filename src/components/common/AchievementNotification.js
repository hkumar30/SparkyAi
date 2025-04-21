import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaMedal, FaTimes, FaBolt } from 'react-icons/fa';

const slideIn = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  10% {
    transform: translateX(0);
    opacity: 1;
  }
  90% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const shine = keyframes`
  0% {
    background-position: -100px;
  }
  40% {
    background-position: 200px;
  }
  100% {
    background-position: 200px;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  max-width: 350px;
  width: 100%;
  perspective: 1000px;
`;

const NotificationItem = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.darkPrimary});
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.boxShadow.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  color: white;
  display: flex;
  align-items: center;
  animation: ${slideIn} 5s ease-in-out forwards;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: ${shine} 2s infinite;
  }
`;

const IconContainer = styled.div`
  background-color: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.darkText};
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: ${props => props.theme.spacing.md};
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-family: ${props => props.theme.fonts.heading};
  margin-bottom: ${props => props.theme.spacing.xs};
  font-size: 1.1rem;
`;

const Description = styled.p`
  font-size: 0.9rem;
  margin-bottom: ${props => props.theme.spacing.xs};
  opacity: 0.9;
`;

const Points = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  
  svg {
    margin-right: ${props => props.theme.spacing.xs};
    color: ${props => props.theme.colors.secondary};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    color: white;
  }
`;

const AchievementNotification = ({ achievements = [], onClose }) => {
  const [visibleAchievements, setVisibleAchievements] = useState(achievements);
  
  // Remove notification after animation ends
  useEffect(() => {
    if (achievements.length > 0) {
      setVisibleAchievements(achievements);
      
      // Auto-dismiss after 5 seconds
      const timers = achievements.map((achievement, index) => {
        return setTimeout(() => {
          handleRemove(achievement.id);
        }, 5000 + (index * 500)); // Stagger dismissal of multiple achievements
      });
      
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [achievements]);
  
  const handleRemove = (id) => {
    setVisibleAchievements(prev => prev.filter(a => a.id !== id));
    if (onClose) {
      onClose(id);
    }
  };
  
  if (visibleAchievements.length === 0) return null;
  
  return (
    <NotificationContainer>
      {visibleAchievements.map((achievement) => (
        <NotificationItem key={achievement.id}>
          <IconContainer>
            <FaMedal />
          </IconContainer>
          <NotificationContent>
            <Title>Achievement Unlocked!</Title>
            <Description>{achievement.name}</Description>
            <Description>{achievement.description}</Description>
            <Points>
              <FaBolt /> {achievement.points} Points
            </Points>
          </NotificationContent>
          <CloseButton onClick={() => handleRemove(achievement.id)}>
            <FaTimes />
          </CloseButton>
        </NotificationItem>
      ))}
    </NotificationContainer>
  );
};

export default AchievementNotification;