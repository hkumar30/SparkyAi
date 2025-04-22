import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaBolt, FaTimes, FaBars, FaFile, FaImage, FaPaperclip, FaGlobe } from 'react-icons/fa';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import ThinkingIndicator from './ThinkingIndicator';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  background-color: ${props => props.theme.colors.background};
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background-color: white;
  border-bottom: 1px solid ${props => props.theme.colors.midGrey};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    color: ${props => props.theme.colors.secondary};
    margin-right: ${props => props.theme.spacing.sm};
  }
  
  h2 {
    font-family: ${props => props.theme.fonts.heading};
    color: ${props => props.theme.colors.primary};
    margin: 0;
  }
`;

const ChatPoints = styled.div`
  background-color: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.darkText};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  font-family: ${props => props.theme.fonts.accent};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.colors.primary};
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const ChatContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ChatMessagesWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.sm};
  line-height: 1.5;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: ${props.theme.colors.primary};
    color: white;
  ` : `
    align-self: flex-start;
    background-color: white;
    color: ${props.theme.colors.text};
  `}
  
  /* Formatting for links */
  a {
    color: ${props => props.isUser ? 'white' : props.theme.colors.primary};
    text-decoration: underline;
  }
  
  /* Formatting for paragraphs */
  p {
    margin-bottom: 0.8em;
  }
  
  /* Formatting for lists */
  ul, ol {
    margin-left: 1.5em;
    margin-bottom: 0.8em;
  }
  
  li {
    margin-bottom: 0.3em;
  }
  
  /* Formatting for headings */
  h3, h4 {
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  
  /* Formatting for code */
  code {
    font-family: monospace;
    background-color: ${props => props.isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }
  
  pre {
    background-color: ${props => props.isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
    padding: 0.8em;
    border-radius: 5px;
    overflow-x: auto;
    margin-bottom: 0.8em;
  }
  
  /* Formatting for blockquotes */
  blockquote {
    border-left: 3px solid ${props => props.isUser ? 'rgba(255, 255, 255, 0.5)' : props.theme.colors.midGrey};
    padding-left: 1em;
    margin-left: 0;
    margin-bottom: 0.8em;
    font-style: italic;
  }
`;

const MessageAttachment = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background-color: ${props => props.isUser ? 
    `rgba(255,255,255,0.1)` : 
    `rgba(0,0,0,0.05)`};
  border-radius: ${props => props.theme.borderRadius.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  a {
    color: ${props => props.isUser ? 'white' : props.theme.colors.primary};
    text-decoration: underline;
    word-break: break-all;
  }
`;

const ChatInputContainer = styled.div`
  padding: ${props => props.theme.spacing.md};
  background-color: white;
  border-top: 1px solid ${props => props.theme.colors.midGrey};
`;

const InputActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background-color: ${props => props.active ? `${props.theme.colors.lightPrimary}30` : 'transparent'};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.midGrey};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.darkGrey};
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? `${props.theme.colors.lightPrimary}30` : props.theme.colors.lightGrey};
    border-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.darkGrey};
  }
  
  svg {
    font-size: 1rem;
  }
`;

const UploadButton = styled(ActionButton)`
  padding: ${props => props.theme.spacing.xs};
  width: 36px;
  height: 36px;
  justify-content: center;
`;

const ChatInputWrapper = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  position: relative;
  border: 1px solid ${props => props.theme.colors.midGrey};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xs};
  transition: border-color 0.2s ease;
  
  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => `${props.theme.colors.primary}20`};
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  font-family: ${props => props.theme.fonts.body};
  resize: none;
  height: 24px;
  min-height: 24px;
  max-height: 150px;
  transition: ${props => props.theme.transition.fast};
  
  &:focus {
    outline: none;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  z-index: 100;
  pointer-events: none;
  margin-bottom: 6px;
  
  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  
  &:hover ${Tooltip} {
    opacity: 1;
    visibility: visible;
  }
`;

const AttachmentPreview = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const AttachmentItem = styled.div`
  position: relative;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.lightGrey};
  border-radius: ${props => props.theme.borderRadius.sm};
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  gap: ${props => props.theme.spacing.sm};
  
  .remove-btn {
    cursor: pointer;
    color: ${props => props.theme.colors.error};
    margin-left: ${props => props.theme.spacing.sm};
  }
`;

const ConversationStarters = styled.div`
  width: 280px;
  border-left: 1px solid ${props => props.theme.colors.midGrey};
  background-color: white;
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  overflow-y: auto;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    right: 0;
    top: 80px;
    bottom: 0;
    z-index: 10;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  }
`;

const StarterTitle = styled.h3`
  font-family: ${props => props.theme.fonts.heading};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StarterButton = styled.button`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.midGrey};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.lightGrey};
  cursor: pointer;
  transition: ${props => props.theme.transition.fast};
  text-align: left;
  font-family: ${props => props.theme.fonts.body};
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    color: white;
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => `${props.theme.colors.primary}30`};
  }
`;

const AttachmentInput = styled.input`
  display: none;
`;

// Format message for display
const formatMessage = (text) => {
  // First handle the hash-based headings properly
  let formattedText = text;
  
  // Convert heading formats (h1, h2, h3, etc)
  formattedText = formattedText.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  formattedText = formattedText.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  formattedText = formattedText.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  
  // Convert line breaks to paragraphs
  formattedText = formattedText
    .split('\n\n')
    .map(paragraph => {
      // Skip if already wrapped in HTML tags
      if (paragraph.trim().startsWith('<') && paragraph.trim().endsWith('>')) {
        return paragraph;
      }
      return paragraph.trim() ? `<p>${paragraph}</p>` : '';
    })
    .join('');
  
  // Convert single line breaks within paragraphs
  formattedText = formattedText.replace(/<p>(.*?)\n(.*?)<\/p>/gs, '<p>$1<br />$2</p>');
  
  // Convert bold text
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic text
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert bullet lists
  formattedText = formattedText.replace(/<p>- (.*?)<\/p>/g, '<li>$1</li>');
  formattedText = formattedText.replace(/<p>• (.*?)<\/p>/g, '<li>$1</li>');
  
  // Wrap consecutive list items in <ul> tags
  let hasLists = formattedText.includes('<li>');
  if (hasLists) {
    // Split by <li> and <p> or heading tags
    const parts = formattedText.split(/(?=<li>|<p>|<h[1-6]>)/);
    let inList = false;
    let result = '';
    
    for (const part of parts) {
      if (part.startsWith('<li>')) {
        if (!inList) {
          result += '<ul>';
          inList = true;
        }
        result += part;
      } else {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        result += part;
      }
    }
    
    if (inList) {
      result += '</ul>';
    }
    
    formattedText = result;
  }
  
  // Convert numbered lists
  formattedText = formattedText.replace(/<p>(\d+)\. (.*?)<\/p>/g, '<li>$2</li>');
  
  // Wrap consecutive numbered list items in <ol> tags
  hasLists = formattedText.includes('<li>') && /\d+\.\s/.test(text);
  if (hasLists) {
    // Create a temporary marker for numbered list items
    formattedText = formattedText.replace(/<p>(\d+)\. (.*?)<\/p>/g, '<num-li>$2</num-li>');
    
    // Split by <num-li> and <p> or heading tags
    const parts = formattedText.split(/(?=<num-li>|<p>|<h[1-6]>)/);
    let inList = false;
    let result = '';
    
    for (const part of parts) {
      if (part.startsWith('<num-li>')) {
        if (!inList) {
          result += '<ol>';
          inList = true;
        }
        // Convert back to normal <li>
        result += part.replace('<num-li>', '<li>').replace('</num-li>', '</li>');
      } else {
        if (inList) {
          result += '</ol>';
          inList = false;
        }
        result += part;
      }
    }
    
    if (inList) {
      result += '</ol>';
    }
    
    formattedText = result;
  }
  
  return formattedText;
};

const ChatLayout = ({ 
  title, 
  starters, 
  messages, 
  onSendMessage, 
  onStarterClick,
  isThinking = false
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, userProfile, updatePoints, updateMetrics } = useAuth();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  
  // Add state for button toggles
  const [asuLibraryActive, setAsuLibraryActive] = useState(false);
  
  // Add time tracking state
  const [isTyping, setIsTyping] = useState(false);
  const [typingStartTime, setTypingStartTime] = useState(null);
  const [totalTypingSeconds, setTotalTypingSeconds] = useState(0);
  const typingTimerRef = useRef(null);
  const TYPING_TIMEOUT = 3000; // 3 seconds of inactivity to consider typing stopped
  const MINIMUM_TRACKING_THRESHOLD = 10; // Minimum seconds to track (to avoid micro-interactions)
  
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    const currentTime = Date.now();
    
    // Start tracking typing time if not already tracking
    if (!isTyping) {
      console.log('Typing started');
      setIsTyping(true);
      setTypingStartTime(currentTime);
    }
    
    // Clear existing timer and set a new one
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    // Set a timer to track when typing stops
    typingTimerRef.current = setTimeout(() => {
      // User stopped typing for TYPING_TIMEOUT ms
      if (isTyping && typingStartTime) {
        const endTime = Date.now();
        const sessionSeconds = Math.floor((endTime - typingStartTime) / 1000);
        
        console.log(`Typing stopped. Session duration: ${sessionSeconds} seconds`);
        
        // Only count sessions longer than the minimum threshold
        if (sessionSeconds >= MINIMUM_TRACKING_THRESHOLD) {
          const newTotalSeconds = totalTypingSeconds + sessionSeconds;
          setTotalTypingSeconds(newTotalSeconds);
          
          console.log(`Total typing time: ${newTotalSeconds} seconds`);
          
          // Only update the database every 60 seconds to reduce writes
          if (Math.floor(newTotalSeconds / 60) > Math.floor(totalTypingSeconds / 60)) {
            const minutesToRecord = Math.floor(sessionSeconds / 60);
            if (minutesToRecord > 0 && updateMetrics) {
              console.log(`Recording ${minutesToRecord} minutes to database`);
              updateMetrics({ timeSpent: minutesToRecord });
            }
          }
        }
        
        // Reset typing state
        setIsTyping(false);
        setTypingStartTime(null);
      }
    }, TYPING_TIMEOUT);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (!messageInput.trim() || isUploading) return;
    
    setIsUploading(true);
    
    try {
      // Call the parent component's handler with just the text (no attachments)
      if (onSendMessage) {
        onSendMessage(messageInput);
      }
      
      // Clear inputs
      setMessageInput('');
      
      // Add points for sending a message
      if (updatePoints) {
        updatePoints(1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        name: file.name,
        type: type,
        file,
      }));
      
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    
    // Clear the input value so the same file can be selected again
    e.target.value = null;
  };
  
  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleStarterClick = (starter) => {
    if (onStarterClick) {
      onStarterClick(starter);
    }
    
    // Close menu on mobile after selecting a starter
    if (window.innerWidth <= 768) {
      setIsMenuOpen(false);
    }
  };
  
  // Handle file upload click
  const handleUploadClick = () => {
    // For now just log a message as this is a visual-only feature
    console.log('Upload button clicked');
    // In the future, this would trigger the file input
    // fileInputRef.current.click();
  };
  
  // Handle ASU Library click
  const handleLibraryClick = () => {
    setAsuLibraryActive(!asuLibraryActive);
    console.log('ASU Library button clicked, active state:', !asuLibraryActive);
  };
  
  // Clean up typing timer on unmount
  useEffect(() => {
    return () => {
      // Clean up typing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        
        // Handle case where component unmounts while user is typing
        if (isTyping && typingStartTime) {
          const endTime = Date.now();
          const sessionSeconds = Math.floor((endTime - typingStartTime) / 1000);
          
          // Only count sessions longer than the minimum threshold
          if (sessionSeconds >= MINIMUM_TRACKING_THRESHOLD) {
            const minutesToRecord = Math.floor(sessionSeconds / 60);
            if (minutesToRecord > 0 && updateMetrics) {
              console.log(`Recording ${minutesToRecord} minutes on unmount`);
              updateMetrics({ timeSpent: minutesToRecord });
            }
          }
        }
      }
    };
  }, [isTyping, typingStartTime, totalTypingSeconds, updateMetrics]);
  
  // Scroll to the bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  return (
    <ChatContainer>
      <ChatHeader>
        <HeaderTitle>
          <FaBolt size={24} />
          <h2>{title}</h2>
        </HeaderTitle>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {userProfile && (
            <ChatPoints>
              <FaBolt />
              {userProfile.points || 0} Points
            </ChatPoints>
          )}
          
          <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <FaBars />
          </MobileMenuButton>
        </div>
      </ChatHeader>
      
      <ChatContent>
        <ChatMessagesWrapper>
          <MessagesContainer>
            {messages.map((message, index) => (
              <MessageBubble key={index} isUser={message.sender === 'user'}>
                {message.sender === 'bot' ? (
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }} />
                ) : (
                  message.text
                )}
                
                {message.attachments && message.attachments.length > 0 && (
                  <div>
                    {message.attachments.map((attachment, i) => (
                      <MessageAttachment key={i} isUser={message.sender === 'user'}>
                        {attachment.type === 'file' ? <FaFile /> : <FaImage />}
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          {attachment.name}
                        </a>
                      </MessageAttachment>
                    ))}
                  </div>
                )}
              </MessageBubble>
            ))}
            
            {isThinking && <ThinkingIndicator />}
            
            <div ref={messagesEndRef} />
          </MessagesContainer>
          
          <ChatInputContainer>
            {attachments.length > 0 && (
              <AttachmentPreview>
                {attachments.map((attachment, index) => (
                  <AttachmentItem key={index}>
                    {attachment.type === 'file' ? <FaFile /> : <FaImage />}
                    {attachment.name}
                    <FaTimes 
                      className="remove-btn" 
                      onClick={() => handleRemoveAttachment(index)} 
                    />
                  </AttachmentItem>
                ))}
              </AttachmentPreview>
            )}
            
            <InputActionsRow>
              <TooltipWrapper>
                <UploadButton onClick={handleUploadClick}>
                  <FaPaperclip />
                  <Tooltip>Upload files</Tooltip>
                </UploadButton>
              </TooltipWrapper>
              
              <TooltipWrapper>
                <ActionButton 
                  active={asuLibraryActive}
                  onClick={handleLibraryClick}
                >
                  <FaGlobe />
                  ASU Library
                  <Tooltip>Search ASU Library resources</Tooltip>
                </ActionButton>
              </TooltipWrapper>
            </InputActionsRow>
            
            <ChatInputWrapper>
              <TextArea
                placeholder="Type your message..."
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isUploading}
                icon={<FaPaperPlane />}
              >
                Send
              </Button>
            </ChatInputWrapper>
            
            {/* Hidden file inputs for future functionality */}
            <AttachmentInput 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, 'file')}
            />
          </ChatInputContainer>
        </ChatMessagesWrapper>
        
        <ConversationStarters isOpen={isMenuOpen}>
          <StarterTitle>Conversation Starters</StarterTitle>
          {starters.map((starter, index) => (
            <StarterButton
              key={index}
              onClick={() => handleStarterClick(starter)}
            >
              {starter}
            </StarterButton>
          ))}
        </ConversationStarters>
      </ChatContent>
    </ChatContainer>
  );
};

export default ChatLayout;