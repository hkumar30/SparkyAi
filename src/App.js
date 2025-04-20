import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { setRedirectPath } from './utils/authUtils';
import AccessibilityControls from './components/common/AccessibilityControls';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EngagedLearning from './pages/EngagedLearning';
import QuickLearning from './pages/QuickLearning';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';

// Components
import Navbar from './components/common/Navbar';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // If not authenticated, save the current path and redirect to login
  if (!currentUser) {
    setRedirectPath(location.pathname);
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/engaged-learning" 
              element={
                <ProtectedRoute>
                  <EngagedLearning />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/quick-learning" 
              element={
                <ProtectedRoute>
                  <QuickLearning />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/achievements" 
              element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect any other route to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <AccessibilityControls />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;