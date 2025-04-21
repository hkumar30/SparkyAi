import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, doc, setDoc, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
import ChatLayout from '../components/chat/ChatLayout';
import { useAuth } from '../contexts/AuthContext';
import { sendMessageToOpenAI } from '../services/openaiService';
import styled from 'styled-components';
import { FaStopwatch, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../components/common/Button';

// Conversation starters for Quick Learning
const STARTERS = ["Review", "Revise", "Sprint Writing", "Process Writing"];

// Styled components for timer
const TimerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
  font-family: ${props => props.theme.fonts.heading};
`;

const TimerDisplay = styled.div`
  font-size: 4rem;
  margin-bottom: ${props => props.theme.spacing.lg};
  
  span {
    color: ${props => props.theme.colors.secondary};
  }
`;

const TimerPrompt = styled.div`
  max-width: 600px;
  background-color: white;
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.boxShadow.lg};
  text-align: center;
  
  h2 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;

const TimerTextarea = styled.textarea`
  width: 100%;
  min-height: 200px;
  margin: ${props => props.theme.spacing.md} 0;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.midGrey};
  font-family: ${props => props.theme.fonts.body};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => `${props.theme.colors.primary}30`};
  }
`;

const TimerActions = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
`;

// The actual component
const QuickLearning = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, updatePoints, updateMetrics, addAchievement } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Timer state for Sprint Writing
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes in seconds
  const [sprintPrompt, setSprintPrompt] = useState("");
  const [sprintResponse, setSprintResponse] = useState("");
  const [isGracePeriod, setIsGracePeriod] = useState(false);
  
  // State for Process Writing
  const [processWritingActive, setProcessWritingActive] = useState(false);
  const [processWritingStep, setProcessWritingStep] = useState(0);
  const [writingTopic, setWritingTopic] = useState("");
  
  const timerRef = useRef(null);

  // Load chat history when component mounts
  useEffect(() => {
    if (!currentUser) return;
    
    const loadChatHistory = async () => {
      try {
        const chatRef = collection(db, 'users', currentUser.uid, 'quickLearningChats');
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
  
  // Timer effect for Sprint Writing
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && !isGracePeriod) {
      // Start grace period
      setIsGracePeriod(true);
      setTimerSeconds(30); // 30 seconds grace period
    } else if (timerSeconds === 0 && isGracePeriod) {
      // End timer
      endSprintTimer();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerActive, timerSeconds, isGracePeriod]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Generate a random writing prompt
  const generateWritingPrompt = async () => {
    try {
      // Create system message for generating a writing prompt
      const systemMessage = "You are Sparky AI, an educational writing assistant. Generate a creative, interesting writing prompt for a college student to write about in a 10-minute sprint. Give only the prompt without any other text.";
      
      // Get prompt from OpenAI
      const promptText = await sendMessageToOpenAI(systemMessage, "Generate a writing prompt", 0.8);
      setSprintPrompt(promptText);
    } catch (error) {
      console.error('Error generating writing prompt:', error);
      setSprintPrompt("Write a short essay about a meaningful experience in your life.");
    }
  };
  
  // Start sprint writing timer
  const startSprintTimer = () => {
    setTimerActive(true);
    setTimerSeconds(600); // 10 minutes
    setIsGracePeriod(false);
    
    // Generate a random writing prompt
    generateWritingPrompt();
  };
  
  // Handle Sprint Writing form submission
  const endSprintTimer = async () => {
    setTimerActive(false);
    
    if (sprintResponse.trim()) {
      // Calculate actual time spent (10 minutes minus remaining time)
      const actualTimeSpent = Math.ceil((600 - timerSeconds) / 60); // Convert seconds to minutes
      
      await handleSendMessage(
        `Sprint Writing:\n\nPrompt: ${sprintPrompt}\n\nMy Response:\n${sprintResponse}\n\nPlease analyze my writing based on the prompt. Provide specific feedback on content, structure, style, and how well I addressed the prompt. Suggest improvements and highlight my strengths.`
      );
      
      // Award extra points for completing a sprint
      updatePoints(10);
      
      // Update metrics with actual time spent and word count
      const wordCount = sprintResponse.trim().split(/\s+/).length;
      updateMetrics({ 
        wordsWritten: wordCount, 
        timeSpent: actualTimeSpent // Use actual time instead of fixed 10 minutes
      });
      
      // Check for sprint writing achievement
      addAchievement({
        id: 'sprint_writer',
        name: 'Sprint Writer',
        description: 'Completed a timed writing sprint',
        points: 15
      });
    }
    
    // Reset sprint state
    setSprintPrompt("");
    setSprintResponse("");
  };
  
  // Process AI response
  const processAIResponse = async (userText) => {
    try {
      // Create system message for Quick Learning mode
      const systemMessage = `You are Sparky AI, an educational AI writing assistant designed to help college students improve their writing skills. You are in "Quick Learning" mode, which means you should provide more direct feedback and actual corrections compared to "Engaged Learning" mode. Still make your responses educational, but focus on efficiency and practical improvements. Be friendly, encouraging, and helpful.`;
      
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
      const chatRef = collection(db, 'users', currentUser.uid, 'quickLearningChats');
      await addDoc(chatRef, {
        content: aiResponse,
        sender: 'bot',
        timestamp: serverTimestamp()
      });
      
      // Award points for interaction
      updatePoints(2);
      
      return aiResponse;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  };
  
  // Process AI response specifically for Process Writing
  const processWritingResponse = async (userText, step) => {
    try {
      let systemMessage = "";
      let prompt = "";
      
      // Different prompts based on the current step of the process writing
      switch (step) {
        case 0: // Initial - User has provided topic
          systemMessage = `You are Sparky AI, an educational writing assistant helping a college student with process writing. The student has shared a potential topic. Ask ONE focused question to help them narrow down their topic. Focus on understanding the scope, purpose, or angle of their writing. Don't overwhelm them with multiple questions - just ONE clear question to help them refine their topic.`;
          prompt = `The student is interested in writing about: "${userText}". Ask ONE focused question to help them refine their topic.`;
          break;
          
        case 1: // Follow-up on topic refinement
          systemMessage = `You are Sparky AI, helping a student with process writing. The student has refined their topic. Now, ask ONE question about their intended audience and purpose for writing this piece.`;
          prompt = `Topic: "${writingTopic}". The student provided additional information: "${userText}". Ask ONE question about audience and purpose.`;
          break;
          
        case 2: // Getting information about audience/purpose
          systemMessage = `You are Sparky AI, helping with process writing. The student has provided information about their audience and purpose. Now, ask ONE question about what main points or arguments they're considering including.`;
          prompt = `Topic: "${writingTopic}". The student's audience/purpose: "${userText}". Ask ONE question about potential main points or arguments they want to make.`;
          break;
          
        case 3: // Getting main points/arguments
          systemMessage = `You are Sparky AI, helping with process writing. The student has shared their potential main points or arguments. Help them organize these ideas into a potential outline structure. Give them 3-5 main sections with brief explanations of what could go in each. Remember, you're guiding them, not writing the essay for them.`;
          prompt = `Topic: "${writingTopic}". Main points: "${userText}". Provide a helpful outline structure with 3-5 sections.`;
          break;
          
        case 4: // Providing final tips
          systemMessage = `You are Sparky AI, helping with process writing. The student has worked through the writing process. Provide them with 3-5 helpful tips specific to their topic for drafting their essay. Focus on organization, clarity, evidence, and style. Remind them that these are suggestions to guide their own writing, not to write the essay for them.`;
          prompt = `Topic: "${writingTopic}". The student is ready to start drafting. Provide 3-5 specific writing tips to help them with their draft. Focus on their specific topic and the information they've shared throughout this process.`;
          break;
          
        default:
          systemMessage = `You are Sparky AI, an educational writing assistant designed to help college students improve their writing skills. You are in "Quick Learning" mode, focusing on Process Writing. Be friendly, encouraging, and helpful.`;
          prompt = userText;
      }
      
      // Get AI response from OpenAI
      const aiResponse = await sendMessageToOpenAI(systemMessage, prompt);
      
      // Add AI message to state
      const botMessage = {
        id: `bot-${Date.now()}`,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Save bot message to Firestore
      const chatRef = collection(db, 'users', currentUser.uid, 'quickLearningChats');
      await addDoc(chatRef, {
        content: aiResponse,
        sender: 'bot',
        timestamp: serverTimestamp()
      });
      
      // Award points for interaction
      updatePoints(2);
      
      return aiResponse;
    } catch (error) {
      console.error('Error generating AI response for process writing:', error);
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
      const chatRef = collection(db, 'users', currentUser.uid, 'quickLearningChats');
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
      
      // Process AI response based on whether we're in process writing mode
      setIsLoading(true);
      
      if (processWritingActive) {
        // If we're just starting, save the topic
        if (processWritingStep === 0) {
          setWritingTopic(text);
        }
        
        // Get response for current step
        await processWritingResponse(text, processWritingStep);
        
        // Move to next step
        setProcessWritingStep(prevStep => {
          // If we're at the last step, end process writing mode
          if (prevStep >= 4) {
            setProcessWritingActive(false);
            return 0;
          }
          return prevStep + 1;
        });
      } else {
        // Regular response
        await processAIResponse(text);
      }
      
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
      case "Review":
        promptText = "Please review my writing. Focus on both strengths and areas for improvement, and suggest specific corrections.";
        await handleSendMessage(promptText);
        break;
        
      case "Revise":
        promptText = "Can you help me revise this text? Please suggest improvements for clarity, structure, and style.";
        await handleSendMessage(promptText);
        break;
        
      case "Sprint Writing":
        // Start sprint writing mode
        startSprintTimer();
        break;
        
      case "Process Writing":
        // Start process writing mode
        setProcessWritingActive(true);
        setProcessWritingStep(0);
        setWritingTopic("");
        
        // Send initial message to explain process writing
        const initialMessage = {
          id: `bot-${Date.now()}`,
          text: "Let's work through your writing process step by step. I'll guide you with questions to help develop your ideas. First, please share what topic or assignment you're working on. Be as specific as possible about what you want to write about.",
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, initialMessage]);
        
        // Save bot message to Firestore
        const chatRef = collection(db, 'users', currentUser.uid, 'quickLearningChats');
        await addDoc(chatRef, {
          content: initialMessage.text,
          sender: 'bot',
          timestamp: serverTimestamp()
        });
        break;
        
      default:
        promptText = `Let's talk about ${starter}.`;
        await handleSendMessage(promptText);
    }
  };
  
  // Check for achievements
  const checkForAchievements = () => {
    // Count total messages from user
    const userMessages = messages.filter(msg => msg.sender === 'user');
    
    // First message achievement
    if (userMessages.length === 1) {
      addAchievement({
        id: 'first_quick_message',
        name: 'Quick Starter',
        description: 'Sent your first message in Quick Learning',
        points: 5
      });
    }
    
    // Fifth message achievement
    if (userMessages.length === 5) {
      addAchievement({
        id: 'quick_regular',
        name: 'Quick Learner',
        description: 'Sent 5 messages in Quick Learning',
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
        id: 'all_quick_starters',
        name: 'Quick Explorer',
        description: 'Used all conversation starters in Quick Learning',
        points: 15
      });
    }
  };
  
  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <>
      <ChatLayout
        title="Quick Learning"
        starters={STARTERS}
        messages={messages}
        onSendMessage={handleSendMessage}
        onStarterClick={handleStarterClick}
        isThinking={isLoading}
      />
      
      {timerActive && (
        <TimerOverlay>
          <TimerDisplay>
            {isGracePeriod && <FaExclamationTriangle color="#FFC627" style={{ marginRight: '10px' }} />}
            <span>{formatTime(timerSeconds)}</span>
            {isGracePeriod && <div style={{ fontSize: '1rem', marginTop: '5px' }}>Grace Period</div>}
          </TimerDisplay>
          
          <TimerPrompt>
            <h2>Sprint Writing Challenge</h2>
            <p>{sprintPrompt}</p>
            
            <TimerTextarea
              placeholder="Write your response here..."
              value={sprintResponse}
              onChange={(e) => setSprintResponse(e.target.value)}
            />
            
            <TimerActions>
              <Button
                variant="secondary"
                onClick={endSprintTimer}
                icon={<FaCheckCircle />}
              >
                Submit
              </Button>
            </TimerActions>
          </TimerPrompt>
        </TimerOverlay>
      )}
    </>
  );
};

export default QuickLearning;