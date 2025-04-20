import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaBolt, FaMedal, FaPencilAlt, FaStopwatch, FaCog, FaTrophy, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const ProfileContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const ProfileHeader = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.md};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  
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
  box-shadow: ${props => props.theme.boxShadow.md};
  flex-shrink: 0;
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
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const JoinDate = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.lightText};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${props => props.theme.spacing.xs};
    color: ${props => props.theme.colors.secondary};
  }
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ProfileContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  
  h2 {
    font-family: ${props => props.theme.fonts.heading};
    color: white;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: ${props => props.theme.spacing.sm};
    }
  }
`;

const CardContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.lightGrey};
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
  transition: ${props => props.theme.transition.medium};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.boxShadow.sm};
  }
  
  .icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: ${props => props.iconBg || props.theme.colors.primary}20;
    color: ${props => props.iconColor || props.theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin: 0 auto ${props => props.theme.spacing.md};
  }
  
  .value {
    font-size: 2rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
    margin-bottom: 5px;
  }
  
  .label {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.lightText};
    font-weight: 500;
  }
`;

const AchievementsList = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
`;

const Achievement = styled.div`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.lightGrey};
  transition: ${props => props.theme.transition.fast};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme.colors.lightGrey};
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
    flex-shrink: 0;
  }
  
  .info {
    flex: 1;
  }
  
  .name {
    font-weight: 600;
    margin-bottom: 3px;
  }
  
  .description {
    font-size: 0.85rem;
    color: ${props => props.theme.colors.lightText};
  }
  
  .points {
    font-weight: 600;
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    flex-shrink: 0;
    
    svg {
      margin-right: 3px;
      color: ${props => props.theme.colors.secondary};
    }
  }
  
  .date {
    font-size: 0.75rem;
    color: ${props => props.theme.colors.darkGrey};
    margin-top: 3px;
  }
`;

const ViewMoreLink = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.lightGrey};
  
  a {
    color: ${props => props.theme.colors.primary};
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      text-decoration: underline;
    }
    
    svg {
      margin-left: ${props => props.theme.spacing.xs};
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.darkGrey};
  
  svg {
    font-size: 2.5rem;
    margin-bottom: ${props => props.theme.spacing.md};
    opacity: 0.5;
  }
  
  p {
    font-size: 1.1rem;
    text-align: center;
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
    return (
      <ProfileContainer>
        <EmptyState>
          <FaUser />
          <p>Loading profile information...</p>
        </EmptyState>
      </ProfileContainer>
    );
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
          <JoinDate>
            <FaCalendarAlt />
            Joined {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'recently'}
          </JoinDate>
        </UserInfo>
      </ProfileHeader>
      
      <ProfileContent>
        <div className="main-content">
          {/* Writing Stats Card */}
          <Card>
            <CardHeader>
              <h2><FaChartLine /> Writing Stats</h2>
            </CardHeader>
            <CardContent>
              <StatsContainer>
                <StatCard iconColor={props => props.theme.colors.secondary} iconBg={props => props.theme.colors.secondary}>
                  <div className="icon"><FaBolt /></div>
                  <div className="value">{userProfile?.points || 0}</div>
                  <div className="label">Total Points</div>
                </StatCard>
                
                <StatCard iconColor={props => props.theme.colors.primary} iconBg={props => props.theme.colors.primary}>
                  <div className="icon"><FaTrophy /></div>
                  <div className="value">{userProfile?.achievements?.length || 0}</div>
                  <div className="label">Achievements</div>
                </StatCard>
                
                <StatCard iconColor="#4CAF50" iconBg="#4CAF50">
                  <div className="icon"><FaPencilAlt /></div>
                  <div className="value">{userProfile?.wordsWritten?.toLocaleString() || 0}</div>
                  <div className="label">Words Written</div>
                </StatCard>
                
                <StatCard iconColor="#FF9800" iconBg="#FF9800">
                  <div className="icon"><FaStopwatch /></div>
                  <div className="value">{formatTime(userProfile?.timeSpent || 0)}</div>
                  <div className="label">Time Spent</div>
                </StatCard>
              </StatsContainer>
            </CardContent>
          </Card>
          
          {/* Account Settings Card */}
          <Card>
            <CardHeader>
              <h2><FaCog /> Account Settings</h2>
            </CardHeader>
            <CardContent>
              <p>Account settings will be available soon. You'll be able to update your profile information and preferences.</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="side-content">
          {/* Recent Achievements Card */}
          <Card>
            <CardHeader>
              <h2><FaMedal /> Recent Achievements</h2>
            </CardHeader>
            
            <CardContent>
              {userProfile?.achievements?.length > 0 ? (
                <AchievementsList>
                  {userProfile.achievements
                    .slice(-3) // Get the most recent 3 achievements
                    .reverse() // Show newest first
                    .map((achievement, index) => (
                      <Achievement key={index}>
                        <div className="badge">
                          <FaMedal />
                        </div>
                        <div className="info">
                          <div className="name">{achievement.name}</div>
                          <div className="description">{achievement.description}</div>
                          {achievement.earnedAt && (
                            <div className="date">Earned on {formatDate(achievement.earnedAt)}</div>
                          )}
                        </div>
                        <div className="points">
                          <FaBolt />
                          {achievement.points}
                        </div>
                      </Achievement>
                    ))}
                </AchievementsList>
              ) : (
                <EmptyState>
                  <FaMedal />
                  <p>You haven't earned any achievements yet. Start writing to unlock some!</p>
                </EmptyState>
              )}
            </CardContent>
            
            {userProfile?.achievements?.length > 3 && (
              <ViewMoreLink>
                <a href="/achievements">View All Achievements</a>
              </ViewMoreLink>
            )}
          </Card>
        </div>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default Profile;