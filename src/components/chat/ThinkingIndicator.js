import React from 'react';
import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
`;

const ThinkingContainer = styled.div`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.sm};
  max-width: 70%;
  align-self: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const BubbleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: ${props => props.theme.spacing.sm};
`;

const Bubble = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${bounce} 1.4s infinite ease-in-out both;
  animation-delay: ${props => props.delay}s;
`;

const ThinkingText = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.lightText};
  font-weight: 500;
`;

const ThinkingIndicator = () => {
  return (
    <ThinkingContainer aria-live="polite" aria-label="Sparky AI is thinking">
      <BubbleContainer>
        <Bubble delay={0} />
        <Bubble delay={0.2} />
        <Bubble delay={0.4} />
      </BubbleContainer>
      <ThinkingText>Sparky is thinking...</ThinkingText>
    </ThinkingContainer>
  );
};

export default ThinkingIndicator;