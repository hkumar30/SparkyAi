import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaMedal, FaBolt, FaTrophy, FaLock, FaCheckCircle, FaRegStar, FaStar, FaPencilAlt, FaStopwatch } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const AchievementsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const AchievementsHeader = styled.div`
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

const ProgressContainer = styled.div`
  background-color: white;
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProgressTitle = styled.h2`
  font-family: ${props => props.theme.fonts.heading};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${props => props.theme.spacing.sm};
    color: ${props => props.theme.colors.secondary};
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 600px;
  height: 20px;
  background-color: ${props => props.theme.colors.lightGrey};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress || 0}%;
    background-color: ${props => props.theme.colors.secondary};
    transition: width 0.5s ease-in-out;
  }
`;

const ProgressText = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 800px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    align-items: center;
  }
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.lightGrey};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
  min-width: 150px;
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.xs};
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      margin-right: ${props => props.theme.spacing.xs};
      color: ${props => props.theme.colors.secondary};
    }
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.lightText};
  }
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background-color: ${props => props.active ? props.theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.midGrey};
  border-radius: ${props => props.theme.borderRadius.md};
  margin: 0 ${props => props.theme.spacing.xs};
  font-family: ${props => props.theme.fonts.accent};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.lightGrey};
  }
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AchievementCard = styled.div`
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.md};
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  position: relative;
  transition: ${props => props.theme.transition.medium};
  
  ${props => props.unlocked ? `
    border: 2px solid ${props.theme.colors.secondary};
  ` : `
    opacity: 0.7;
  `}
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.boxShadow.lg};
  }
`;

const AchievementStatus = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  color: ${props => props.unlocked ? props.theme.colors.secondary : props.theme.colors.darkGrey};
  font-size: 1.5rem;
`;

const AchievementIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.unlocked ? 
    `${props.theme.colors.secondary}25` : 
    props.theme.colors.lightGrey};
  color: ${props => props.unlocked ? 
    props.theme.colors.secondary : 
    props.theme.colors.darkGrey};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const AchievementTitle = styled.h3`
  font-family: ${props => props.theme.fonts.heading};
  margin-bottom: ${props => props.theme.spacing.xs};
  color: ${props => props.unlocked ? 
    props.theme.colors.darkText : 
    props.theme.colors.darkGrey};
`;

const AchievementDescription = styled.p`
  color: ${props => props.unlocked ? 
    props.theme.colors.lightText : 
    props.theme.colors.darkGrey};
  margin-bottom: ${props => props.theme.spacing.md};
  flex-grow: 1;
`;

const AchievementPoints = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  color: ${props => props.unlocked ? 
    props.theme.colors.primary : 
    props.theme.colors.darkGrey};
  
  svg {
    margin-right: ${props => props.theme.spacing.xs};
    color: ${props => props.unlocked ? 
      props.theme.colors.secondary : 
      props.theme.colors.darkGrey};
  }
`;

const AchievementDate = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.lightText};
  margin-top: ${props => props.theme.spacing.sm};
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
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  p {
    color: ${props => props.theme.colors.lightText};
    max-width: 500px;
    margin: 0 auto;
  }
`;

// Define all possible achievements
const ALL_ACHIEVEMENTS = [
  {
    id: 'first_message',
    name: 'First Steps',
    description: 'Sent your first message in Engaged Learning',
    icon: <FaBolt />,
    points: 5,
    category: 'beginner'
  },
  {
    id: 'engaged_regular',
    name: 'Engaged Learner',
    description: 'Sent 5 messages in Engaged Learning',
    icon: <FaBolt />,
    points: 10,
    category: 'intermediate'
  },
  {
    id: 'all_starters',
    name: 'Conversation Master',
    description: 'Used all conversation starters in Engaged Learning',
    icon: <FaBolt />,
    points: 15,
    category: 'advanced'
  },
  {
    id: 'first_quick_message',
    name: 'Quick Starter',
    description: 'Sent your first message in Quick Learning',
    icon: <FaBolt />,
    points: 5,
    category: 'beginner'
  },
  {
    id: 'quick_regular',
    name: 'Quick Learner',
    description: 'Sent 5 messages in Quick Learning',
    icon: <FaBolt />,
    points: 10,
    category: 'intermediate'
  },
  {
    id: 'all_quick_starters',
    name: 'Quick Explorer',
    description: 'Used all conversation starters in Quick Learning',
    icon: <FaBolt />,
    points: 15,
    category: 'advanced'
  },
  {
    id: 'sprint_writer',
    name: 'Sprint Writer',
    description: 'Completed a timed writing sprint',
    icon: <FaStopwatch />,
    points: 15,
    category: 'intermediate'
  },
  {
    id: 'word_master_100',
    name: 'Word Master I',
    description: 'Wrote over 100 words',
    icon: <FaPencilAlt />,
    points: 5,
    category: 'beginner'
  },
  {
    id: 'word_master_500',
    name: 'Word Master II',
    description: 'Wrote over 500 words',
    icon: <FaPencilAlt />,
    points: 10,
    category: 'intermediate'
  },
  {
    id: 'word_master_1000',
    name: 'Word Master III',
    description: 'Wrote over 1,000 words',
    icon: <FaPencilAlt />,
    points: 15,
    category: 'advanced'
  },
  {
    id: 'time_master_10',
    name: 'Time Master I',
    description: 'Spent 10 minutes writing',
    icon: <FaStopwatch />,
    points: 5,
    category: 'beginner'
  },
  {
    id: 'time_master_30',
    name: 'Time Master II',
    description: 'Spent 30 minutes writing',
    icon: <FaStopwatch />,
    points: 10,
    category: 'intermediate'
  },
  {
    id: 'time_master_60',
    name: 'Time Master III',
    description: 'Spent 1 hour writing',
    icon: <FaStopwatch />,
    points: 15,
    category: 'advanced'
  }
];

const Achievements = () => {
  const navigate = useNavigate();
  const { currentUser, addAchievement } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [userAchievements, setUserAchievements] = useState([]);
  const [userStats, setUserStats] = useState({
    points: 0,
    wordsWritten: 0,
    timeSpent: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Fetch user achievements and check for new ones
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserAchievements(userData.achievements || []);
          setUserStats({
            points: userData.points || 0,
            wordsWritten: userData.wordsWritten || 0,
            timeSpent: userData.timeSpent || 0
          });
          
          // Check for word count achievements
          const wordsWritten = userData.wordsWritten || 0;
          const earnedAchievements = [...(userData.achievements || [])];
          let updated = false;
          
          if (wordsWritten >= 100 && !earnedAchievements.some(a => a.id === 'word_master_100')) {
            await addAchievement({
              id: 'word_master_100',
              name: 'Word Master I',
              description: 'Wrote over 100 words',
              points: 5
            });
            updated = true;
          }
          
          if (wordsWritten >= 500 && !earnedAchievements.some(a => a.id === 'word_master_500')) {
            await addAchievement({
              id: 'word_master_500',
              name: 'Word Master II',
              description: 'Wrote over 500 words',
              points: 10
            });
            updated = true;
          }
          
          if (wordsWritten >= 1000 && !earnedAchievements.some(a => a.id === 'word_master_1000')) {
            await addAchievement({
              id: 'word_master_1000',
              name: 'Word Master III',
              description: 'Wrote over 1,000 words',
              points: 15
            });
            updated = true;
          }
          
          // Check for time spent achievements
          const timeSpent = userData.timeSpent || 0; // in minutes
          
          if (timeSpent >= 10 && !earnedAchievements.some(a => a.id === 'time_master_10')) {
            await addAchievement({
              id: 'time_master_10',
              name: 'Time Master I',
              description: 'Spent 10 minutes writing',
              points: 5
            });
            updated = true;
          }
          
          if (timeSpent >= 30 && !earnedAchievements.some(a => a.id === 'time_master_30')) {
            await addAchievement({
              id: 'time_master_30',
              name: 'Time Master II',
              description: 'Spent 30 minutes writing',
              points: 10
            });
            updated = true;
          }
          
          if (timeSpent >= 60 && !earnedAchievements.some(a => a.id === 'time_master_60')) {
            await addAchievement({
              id: 'time_master_60',
              name: 'Time Master III',
              description: 'Spent 1 hour writing',
              points: 15
            });
            updated = true;
          }
          
          // If achievements were updated, fetch the latest
          if (updated) {
            const updatedUserSnap = await getDoc(userRef);
            if (updatedUserSnap.exists()) {
              setUserAchievements(updatedUserSnap.data().achievements || []);
              setUserStats({
                points: updatedUserSnap.data().points || 0,
                wordsWritten: updatedUserSnap.data().wordsWritten || 0,
                timeSpent: updatedUserSnap.data().timeSpent || 0
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user achievements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, addAchievement]);

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
  
  // Filter achievements based on active tab
  const filteredAchievements = ALL_ACHIEVEMENTS.filter(achievement => {
    if (activeTab === 'all') return true;
    return achievement.category === activeTab;
  });
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const totalAchievements = ALL_ACHIEVEMENTS.length;
    const userAchievementsCount = userAchievements.length;
    
    return Math.round((userAchievementsCount / totalAchievements) * 100);
  };
  
  // Check if user has unlocked an achievement
  const isUnlocked = (achievementId) => {
    return userAchievements.some(achievement => achievement.id === achievementId);
  };
  
  // Get achievement earned date
  const getEarnedDate = (achievementId) => {
    const achievement = userAchievements.find(a => a.id === achievementId);
    if (!achievement || !achievement.earnedAt) return null;
    
    // Format date
    const date = achievement.earnedAt.toDate ? 
      achievement.earnedAt.toDate() : 
      new Date(achievement.earnedAt);
      
    return date.toLocaleDateString();
  };
  
  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <AchievementsContainer>
      <AchievementsHeader>
        <Title>
          <FaMedal />
          Achievements
        </Title>
        <Subtitle>
          Track your progress and earn achievements as you improve your writing skills.
        </Subtitle>
      </AchievementsHeader>
      
      <ProgressContainer>
        <ProgressTitle>
          <FaTrophy />
          Your Progress
        </ProgressTitle>
        
        <ProgressBar progress={calculateProgress()} />
        
        <ProgressText>
          {userAchievements.length} / {ALL_ACHIEVEMENTS.length} Achievements Unlocked ({calculateProgress()}%)
        </ProgressText>
        
        <ProgressStats>
          <StatCard>
            <div className="stat-value">
              <FaBolt />
              {userStats.points}
            </div>
            <div className="stat-label">Points</div>
          </StatCard>
          
          <StatCard>
            <div className="stat-value">
              <FaPencilAlt />
              {userStats.wordsWritten.toLocaleString()}
            </div>
            <div className="stat-label">Words Written</div>
          </StatCard>
          
          <StatCard>
            <div className="stat-value">
              <FaStopwatch />
              {formatTime(userStats.timeSpent)}
            </div>
            <div className="stat-label">Time Spent</div>
          </StatCard>
        </ProgressStats>
      </ProgressContainer>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          All Achievements
        </Tab>
        <Tab 
          active={activeTab === 'beginner'} 
          onClick={() => setActiveTab('beginner')}
        >
          Beginner
        </Tab>
        <Tab 
          active={activeTab === 'intermediate'} 
          onClick={() => setActiveTab('intermediate')}
        >
          Intermediate
        </Tab>
        <Tab 
          active={activeTab === 'advanced'} 
          onClick={() => setActiveTab('advanced')}
        >
          Advanced
        </Tab>
      </TabsContainer>
      
      {loading ? (
        <EmptyState>
          <h3>Loading achievements...</h3>
        </EmptyState>
      ) : filteredAchievements.length === 0 ? (
        <EmptyState>
          <FaMedal />
          <h3>No achievements in this category</h3>
          <p>Check other categories or continue using the app to earn achievements.</p>
        </EmptyState>
      ) : (
        <AchievementsGrid>
          {filteredAchievements.map(achievement => {
            const unlocked = isUnlocked(achievement.id);
            
            return (
              <AchievementCard 
                key={achievement.id} 
                unlocked={unlocked}
              >
                <AchievementStatus>
                  {unlocked ? <FaCheckCircle /> : <FaLock />}
                </AchievementStatus>
                
                <AchievementIcon unlocked={unlocked}>
                  {achievement.icon}
                </AchievementIcon>
                
                <AchievementTitle unlocked={unlocked}>
                  {achievement.name}
                </AchievementTitle>
                
                <AchievementDescription unlocked={unlocked}>
                  {achievement.description}
                </AchievementDescription>
                
                <AchievementPoints unlocked={unlocked}>
                  <FaBolt />
                  {achievement.points} Points
                </AchievementPoints>
                
                {unlocked && getEarnedDate(achievement.id) && (
                  <AchievementDate>
                    Earned on {getEarnedDate(achievement.id)}
                  </AchievementDate>
                )}
              </AchievementCard>
            );
          })}
        </AchievementsGrid>
      )}
    </AchievementsContainer>
  );
};

export default Achievements;