import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Create auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Add state for achievement notifications
  const [recentAchievements, setRecentAchievements] = useState([]);

  // Register a new user
  const register = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName,
        email,
        createdAt: new Date(),
        points: 0,
        achievements: [],
        timeSpent: 0,
        wordsWritten: 0
      });
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Login an existing user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
        return userDoc.data();
      } else {
        console.error('No user profile found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Update user points
  const updatePoints = async (points) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newPoints = (userData.points || 0) + points;
        
        await setDoc(userRef, { ...userData, points: newPoints }, { merge: true });
        
        setUserProfile(prev => ({
          ...prev,
          points: newPoints
        }));
        
        return newPoints;
      }
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

  // Update user metrics (words written, time spent)
  const updateMetrics = async (metrics) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedData = {
          ...userData,
        };
        
        if (metrics.wordsWritten) {
          updatedData.wordsWritten = (userData.wordsWritten || 0) + metrics.wordsWritten;
        }
        
        if (metrics.timeSpent) {
          updatedData.timeSpent = (userData.timeSpent || 0) + metrics.timeSpent;
        }
        
        await setDoc(userRef, updatedData, { merge: true });
        setUserProfile(prev => ({
          ...prev,
          ...updatedData
        }));
        
        return updatedData;
      }
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  const addAchievement = async (achievement) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const achievements = userData.achievements || [];
        
        // Check if achievement already exists
        if (!achievements.some(a => a.id === achievement.id)) {
          const newAchievement = {
            ...achievement,
            earnedAt: new Date()
          };
          
          const newAchievements = [...achievements, newAchievement];
          
          await setDoc(userRef, { 
            ...userData, 
            achievements: newAchievements,
            points: (userData.points || 0) + (achievement.points || 0)
          }, { merge: true });
          
          setUserProfile(prev => ({
            ...prev,
            achievements: newAchievements,
            points: (prev.points || 0) + (achievement.points || 0)
          }));
          
          // Add to recent achievements for notification
          setRecentAchievements(prev => [...prev, newAchievement]);
          
          return newAchievements;
        }
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
    }
  };
  
  // Add a function to dismiss achievement notifications
  const dismissAchievementNotification = (achievementId) => {
    setRecentAchievements(prev => prev.filter(a => a.id !== achievementId));
  };
  
  // Observer for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }));
        
        await fetchUserProfile(user.uid);
      } else {
        localStorage.removeItem('user');
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    userProfile,
    register,
    login,
    resetPassword,
    updatePoints,
    updateMetrics,
    addAchievement,
    recentAchievements,
    dismissAchievementNotification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;