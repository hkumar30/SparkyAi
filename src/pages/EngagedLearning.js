import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, doc, setDoc, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
import ChatLayout from '../components/chat/ChatLayout';
import { useAuth } from '../contexts/AuthContext';
import { sendMessageToOpenAI } from '../services/openaiService';

// Conversation starters for Engaged Learning
const STARTERS = ["Gamification", "Quiz", "Peer Review"];

const EngagedLearning = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, updatePoints, updateMetrics, addAchievement } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat history when component mounts
  useEffect(() => {
    if (!currentUser) return;
    
    const loadChatHistory = async () => {
      try {
        const chatRef = collection(db, 'users', currentUser.uid, 'engagedLearningChats');
        const q = query(
          chatRef,
          orderBy('timestamp', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        const chatHistory = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          chatHistory.push({
            id: doc.id,
            ...data
          });
        });
        
        // Convert to the format expected by ChatLayout
        const formattedMessages = chatHistory.map(chat => ({
          id: chat.id,
          text: chat.content,
          sender: chat.sender,
          attachments: chat.attachments || [],
          timestamp: chat.timestamp
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    
    loadChatHistory();
  }, [currentUser]);

  // Process AI response
  const processAIResponse = async (userText) => {
    try {
      // Create system message for Engaged Learning mode
      const systemMessage = `You are Sparky AI, an educational AI writing assistant designed to help college students improve their writing skills. Your responses should be educational and focused on teaching writing concepts rather than just fixing mistakes. Remember that you are in the "Engaged Learning" mode which is more focused on deeper learning rather than quick fixes. Be encouraging, friendly, and provide specific feedback that helps students understand the principles behind good writing.`;
      
      // Get AI response from OpenAI
      const aiResponse = await sendMessageToOpenAI(systemMessage, userText);
      
      // Add AI message to state
      const botMessage = {
        id: `bot-${Date.now()}`,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Save bot message to Firestore
      const chatRef = collection(db, 'users', currentUser.uid, 'engagedLearningChats');
      await addDoc(chatRef, {
        content: aiResponse,
        sender: 'bot',
        timestamp: serverTimestamp()
      });
      
      // Award points for interaction
      updatePoints(2);
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  };

  // Handle sending messages
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    try {
      // Add user message to state
      const userMessage = {
        id: `user-${Date.now()}`,
        text,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Save message to Firestore
      const chatRef = collection(db, 'users', currentUser.uid, 'engagedLearningChats');
      await addDoc(chatRef, {
        content: text,
        sender: 'user',
        timestamp: serverTimestamp()
      });
      
      // Update metrics
      if (text) {
        // Count words
        const wordCount = text.trim().split(/\s+/).length;
        updateMetrics({ wordsWritten: wordCount });
      }
      
      // Process AI response
      setIsLoading(true);
      await processAIResponse(text);
      
      // Check for achievements
      checkForAchievements();
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: "Sorry, there was an error processing your message. Please try again.",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle conversation starter clicks
  const handleStarterClick = async (starter) => {
    // Generate specific prompts based on the starter selected
    let promptText = "";
    
    switch (starter) {
      case "Gamification":
        promptText = "I'd like to gamify my writing process. Can you help me create a fun writing exercise based on the text I've shared or create a new writing game to help me improve my skills?";
        break;
        
      case "Quiz":
        promptText = "I'd like to test my knowledge. Can you create a quiz with multiple-choice questions about writing concepts related to what I've shared or about general writing principles?";
        break;
        
      case "Peer Review":
        promptText = "Could you review my writing like a peer would? Please focus on teaching me about my writing patterns and areas for improvement rather than just fixing my mistakes.";
        break;
        
      default:
        promptText = `Let's talk about ${starter}.`;
    }
    
    // Send the starter prompt as a user message
    await handleSendMessage(promptText);
  };
  
  // Check for achievements
  const checkForAchievements = () => {
    // Count total messages from user
    const userMessages = messages.filter(msg => msg.sender === 'user');
    
    // First message achievement
    if (userMessages.length === 1) {
      addAchievement({
        id: 'first_message',
        name: 'First Steps',
        description: 'Sent your first message in Engaged Learning',
        points: 5
      });
    }
    
    // Fifth message achievement
    if (userMessages.length === 5) {
      addAchievement({
        id: 'engaged_regular',
        name: 'Engaged Learner',
        description: 'Sent 5 messages in Engaged Learning',
        points: 10
      });
    }
    
    // Check if used all starters
    const usedStarters = new Set();
    messages.forEach(msg => {
      if (msg.sender === 'user') {
        STARTERS.forEach(starter => {
          if (msg.text.includes(starter)) {
            usedStarters.add(starter);
          }
        });
      }
    });
    
    if (usedStarters.size === STARTERS.length) {
      addAchievement({
        id: 'all_starters',
        name: 'Conversation Master',
        description: 'Used all conversation starters in Engaged Learning',
        points: 15
      });
    }
  };
  
  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <ChatLayout
      title="Engaged Learning"
      starters={STARTERS}
      messages={messages}
      onSendMessage={handleSendMessage}
      onStarterClick={handleStarterClick}
    />
  );
};

export default EngagedLearning;