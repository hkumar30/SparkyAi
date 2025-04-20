import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaBolt, FaMedal, FaPencilAlt, FaStopwatch, FaCog } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 600;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.h1`
  font-family: ${props => props.theme.fonts.heading};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Email = styled.p`
  color: ${props => props.theme.colors.lightText};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const JoinDate = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.lightText};
`;

const ProfileContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.md};
  padding: ${props => props.theme.spacing.lg};
  
  h2 {
    font-family: ${props => props.theme.fonts.heading};
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.md};
    display: flex;
    align-items: center;
    
    svg {
      margin-right: ${props => props.theme.spacing.sm};
      color: ${props => props.theme.colors.secondary};
    }
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
`;

const Stat = styled.div`
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.lightGrey};
  border-radius: ${props => props.theme.borderRadius.md};
  
  .value {
    font-size: 1.8rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: ${props => props.theme.spacing.xs};
      color: ${props => props.theme.colors.secondary};
    }
  }
  
  .label {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.lightText};
  }
`;

const AchievementsList = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const Achievement = styled.div`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.midGrey};
  
  &:last-child {
    border-bottom: none;
  }
  
  .badge {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${props => props.theme.colors.secondary}25;
    color: ${props => props.theme.colors.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${props => props.theme.spacing.md};
  }
  
  .info {
    flex: 1;
  }
  
  .name {
    font-weight: 600;
    margin-bottom: 3px;
  }
  
  .description {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.lightText};
  }
  
  .points {
    font-weight: 600;
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 3px;
      color: ${props => props.theme.colors.secondary};
    }
  }
`;

const RecentActivity = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const ActivityItem = styled.div`
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.midGrey};
  
  &:last-child {
    border-bottom: none;
  }
  
  .activity-type {
    font-weight: 600;
    margin-bottom: 3px;
  }
  
  .activity-description {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.lightText};
    margin-bottom: 3px;
  }
  
  .activity-time {
    font-size: 0.8rem;
    color: ${props => props.theme.colors.darkGrey};
  }
`;

// Format time spent (minutes to hours and minutes)
const formatTime = (minutes) => {
  if (!minutes) return '0m';
  
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours}h ${mins}m`;
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const Profile = () => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (loading) {
    return <ProfileContainer>Loading profile...</ProfileContainer>;
  }
  
  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar>
          {currentUser.displayName 
            ? currentUser.displayName.charAt(0).toUpperCase() 
            : currentUser.email.charAt(0).toUpperCase()}
        </Avatar>
        
        <UserInfo>
          <Username>{currentUser.displayName || currentUser.email.split('@')[0]}</Username>
          <Email>{currentUser.email}</Email>
          <JoinDate>Joined {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'recently'}</JoinDate>
        </UserInfo>
      </ProfileHeader>
      
      <ProfileContent>
        <Card>
          <h2><FaBolt /> Writing Stats</h2>
          <StatGrid>
            <Stat>
              <div className="value">
                <FaBolt />
                {userProfile?.points || 0}
              </div>
              <div className="label">Total Points</div>
            </Stat>
            
            <Stat>
              <div className="value">
                <FaPencilAlt />
                {userProfile?.wordsWritten?.toLocaleString() || 0}
              </div>
              <div className="label">Words Written</div>
            </Stat>
            
            <Stat>
              <div className="value">
                <FaStopwatch />
                {formatTime(userProfile?.timeSpent || 0)}
              </div>
              <div className="label">Time Spent</div>
            </Stat>
            
            <Stat>
              <div className="value">
                <FaMedal />
                {userProfile?.achievements?.length || 0}
              </div>
              <div className="label">Achievements</div>
            </Stat>
          </StatGrid>
        </Card>
        
        <Card>
          <h2><FaMedal /> Recent Achievements</h2>
          <AchievementsList>
            {userProfile?.achievements?.length > 0 ? (
              userProfile.achievements
                .slice(0, 5)
                .map((achievement, index) => (
                  <Achievement key={index}>
                    <div className="badge">
                      <FaMedal />
                    </div>
                    <div className="info">
                      <div className="name">{achievement.name}</div>
                      <div className="description">{achievement.description}</div>
                    </div>
                    <div className="points">
                      <FaBolt />
                      {achievement.points}
                    </div>
                  </Achievement>
                ))
            ) : (
              <p>No achievements yet. Start writing to earn some!</p>
            )}
          </AchievementsList>
        </Card>
        
        <Card>
          <h2><FaCog /> Account Settings</h2>
          <p>This section is under development. Soon you'll be able to update your profile information and preferences.</p>
        </Card>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default Profile;