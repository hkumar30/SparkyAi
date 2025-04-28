import React from 'react';
import styled from 'styled-components';
import { FaTrophy } from 'react-icons/fa';

const BannerContainer = styled.div`
  background: linear-gradient(to right, ${props => props.theme.colors.primary}10, ${props => props.theme.colors.primary}20);
  border-left: 4px solid ${props => props.theme.colors.primary};
  margin: ${props => props.theme.spacing.md} 0;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  box-shadow: ${props => props.theme.boxShadow.sm};
`;

const IconContainer = styled.div`
  color: ${props => props.theme.colors.secondary};
  font-size: 1.8rem;
  margin-right: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
`;

const AwardText = styled.div`
  flex: 1;
  
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.xs};
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  p {
    color: ${props => props.theme.colors.lightText};
    margin: 0;
    font-size: 0.9rem;
  }
`;

const LogoImg = styled.img`
  height: 36px;
  margin-left: ${props => props.theme.spacing.md};
`;

const AwardBanner = () => {
  return (
    <BannerContainer>
      <IconContainer>
        <FaTrophy />
      </IconContainer>
      <AwardText>
        <h3>Winner - The Future of Writing Support</h3>
        <p>2025 ASN + PIA Design Competition</p>
      </AwardText>
      <LogoImg src="https://aci.az.gov/sites/default/files/media/ASU-logo.png" alt="ASN + PIA Logo" />
    </BannerContainer>
  );
};

export default AwardBanner;