import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTrophy, FaBolt, FaStopwatch, FaPencilAlt, FaUser, FaMedal } from 'react-icons/fa';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const LeaderboardContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const LeaderboardHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fonts.heading};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: ${props => props.theme.colors.secondary};
    margin-right: ${props => props.theme.spacing.sm};
  }
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.lightText};
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.midGrey};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: ${props => props.theme.spacing.xs};
  }
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: none;
  border: none;
  font-family: ${props => props.theme.fonts.accent};
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.lightText};
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: ${props => props.theme.transition.fast};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
  
  svg {
    margin-right: ${props => props.theme.spacing.sm};
  }
`;

const LeaderboardTable = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.md};
  overflow: hidden;
`;

const LeaderboardHeader_Table = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px 120px;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.lightGrey};
  font-weight: 600;
  border-bottom: 1px solid ${props => props.theme.colors.midGrey};
  
  @media (max-width: 768px) {
    grid-template-columns: 60px 1fr 100px;
  }
`;

const LeaderboardHeaderCell = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${props => props.theme.spacing.xs};
    color: ${props => props.theme.colors.primary};
  }
  
  @media (max-width: 768px) {
    &.hide-mobile {
      display: none;
    }
  }
`;

const LeaderboardRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px 120px;
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.midGrey};
  align-items: center;
  transition: ${props => props.theme.transition.fast};
  background-color: ${props => props.isCurrentUser ? `${props.theme.colors.primary}10` : 'white'};
  
  &:hover {
    background-color: ${props => props.isCurrentUser ? 
      `${props.theme.colors.primary}15` : 
      props.theme.colors.lightGrey};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 60px 1fr 100px;
  }
`;

const RankCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: ${props => {
    switch(props.rank) {
      case 1: return props.theme.colors.secondary;
      case 2: return '#A8A8A8';
      case 3: return '#CD7F32';
      default: return props.theme.colors.text;
    }
  }};
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: ${props => props.theme.borderRadius.circle};
    background-color: ${props => props.theme.colors.primary};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${props => props.theme.spacing.md};
    font-weight: 600;
  }
  
  .user-name {
    font-weight: 600;
  }
`;

const StatCell = styled.div`
  font-weight: 600;
  display: flex;
  align-items: center;
  
  svg {
    color: ${props => props.theme.colors.primary};
    margin-right: ${props => props.theme.spacing.xs};
  }
  
  @media (max-width: 768px) {
    &.hide-mobile {
      display: none;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.md};
  
  svg {
    font-size: 3rem;
    color: ${props => props.theme.colors.midGrey};
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  h3 {
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  p {
    color: ${props => props.theme.colors.lightText};
    max-width: 500px;
    margin: 0 auto;
  }
`;

const Leaderboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tab, setTab] = useState('points');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        // Determine order field based on selected tab
        let orderField;
        switch (tab) {
          case 'points':
            orderField = 'points';
            break;
          case 'words':
            orderField = 'wordsWritten';
            break;
          case 'time':
            orderField = 'timeSpent';
            break;
          case 'achievements':
            orderField = 'achievements';
            break;
          default:
            orderField = 'points';
        }
        
        // Create query
        const usersRef = collection(db, 'users');
        let q;
        
        if (orderField === 'achievements') {
          // Special case for achievements which is an array
          q = query(usersRef);
        } else {
          q = query(usersRef, orderBy(orderField, 'desc'), limit(20));
        }
        
        const querySnapshot = await getDocs(q);
        let usersData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            ...data,
            // Ensure we have values for all fields
            points: data.points || 0,
            wordsWritten: data.wordsWritten || 0,
            timeSpent: data.timeSpent || 0,
            achievements: data.achievements || []
          });
        });
        
        // Special sorting for achievements
        if (orderField === 'achievements') {
          usersData.sort((a, b) => {
            return (b.achievements?.length || 0) - (a.achievements?.length || 0);
          });
          usersData = usersData.slice(0, 20);
        }
        
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [tab]);

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
  
  // Get initial of user name for avatar
  const getInitial = (name) => {
    if (!name) return 'U';
    
    return name.charAt(0).toUpperCase();
  };

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <LeaderboardContainer>
      <LeaderboardHeader>
        <Title>
          <FaTrophy />
          Leaderboard
        </Title>
        <Subtitle>
          See how you stack up against other writers. Earn points by writing, completing challenges, and earning achievements.
        </Subtitle>
      </LeaderboardHeader>
      
      <TabsContainer>
        <Tab 
          active={tab === 'points'} 
          onClick={() => setTab('points')}
        >
          <FaBolt /> Points
        </Tab>
        <Tab 
          active={tab === 'words'} 
          onClick={() => setTab('words')}
        >
          <FaPencilAlt /> Words Written
        </Tab>
        <Tab 
          active={tab === 'time'} 
          onClick={() => setTab('time')}
        >
          <FaStopwatch /> Time Spent
        </Tab>
        <Tab 
          active={tab === 'achievements'} 
          onClick={() => setTab('achievements')}
        >
          <FaMedal /> Achievements
        </Tab>
      </TabsContainer>
      
      <LeaderboardTable>
        <LeaderboardHeader_Table>
          <LeaderboardHeaderCell>Rank</LeaderboardHeaderCell>
          <LeaderboardHeaderCell><FaUser /> User</LeaderboardHeaderCell>
          
          {tab === 'points' && (
            <LeaderboardHeaderCell><FaBolt /> Points</LeaderboardHeaderCell>
          )}
          
          {tab === 'words' && (
            <LeaderboardHeaderCell><FaPencilAlt /> Words</LeaderboardHeaderCell>
          )}
          
          {tab === 'time' && (
            <LeaderboardHeaderCell><FaStopwatch /> Time</LeaderboardHeaderCell>
          )}
          
          {tab === 'achievements' && (
            <LeaderboardHeaderCell><FaMedal /> Badges</LeaderboardHeaderCell>
          )}
          
          <LeaderboardHeaderCell className="hide-mobile"><FaPencilAlt /> Words</LeaderboardHeaderCell>
          <LeaderboardHeaderCell className="hide-mobile"><FaStopwatch /> Time</LeaderboardHeaderCell>
        </LeaderboardHeader_Table>
        
        {loading ? (
          <EmptyState>
            <h3>Loading leaderboard data...</h3>
          </EmptyState>
        ) : users.length === 0 ? (
          <EmptyState>
            <FaTrophy />
            <h3>No data available</h3>
            <p>Start writing to see yourself on the leaderboard!</p>
          </EmptyState>
        ) : (
          users.map((user, index) => (
            <LeaderboardRow 
              key={user.id} 
              isCurrentUser={user.id === currentUser.uid}
            >
              <RankCell rank={index + 1}>
                {index === 0 ? <FaTrophy /> : index + 1}
              </RankCell>
              
              <UserCell>
                <div className="user-avatar">
                  {getInitial(user.displayName)}
                </div>
                <div className="user-name">
                  {user.displayName || user.email?.split('@')[0] || 'Anonymous'}
                </div>
              </UserCell>
              
              {tab === 'points' && (
                <StatCell>
                  <FaBolt />
                  {user.points}
                </StatCell>
              )}
              
              {tab === 'words' && (
                <StatCell>
                  <FaPencilAlt />
                  {user.wordsWritten.toLocaleString()}
                </StatCell>
              )}
              
              {tab === 'time' && (
                <StatCell>
                  <FaStopwatch />
                  {formatTime(user.timeSpent)}
                </StatCell>
              )}
              
              {tab === 'achievements' && (
                <StatCell>
                  <FaMedal />
                  {user.achievements?.length || 0}
                </StatCell>
              )}
              
              <StatCell className="hide-mobile">
                <FaPencilAlt />
                {user.wordsWritten.toLocaleString()}
              </StatCell>
              
              <StatCell className="hide-mobile">
                <FaStopwatch />
                {formatTime(user.timeSpent)}
              </StatCell>
            </LeaderboardRow>
          ))
        )}
      </LeaderboardTable>
    </LeaderboardContainer>
  );
};

export default Leaderboard;