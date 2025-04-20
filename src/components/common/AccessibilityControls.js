import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaAccessibleIcon, FaFont, FaAdjust, FaVolumeUp, FaChevronDown, FaTimes } from 'react-icons/fa';

const AccessibilityContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const AccessibilityButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  box-shadow: ${props => props.theme.boxShadow.md};
  transition: ${props => props.theme.transition.medium};
  position: relative;
  
  &:hover {
    background-color: ${props => props.theme.colors.lightPrimary};
    transform: scale(1.05);
  }
  
  &:focus {
    outline: 3px solid ${props => props.theme.colors.secondary};
    outline-offset: 2px;
  }

  .tooltip {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${props => props.theme.colors.darkText};
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.8rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  &:hover .tooltip {
    opacity: 1;
  }
`;

const AccessibilityPanel = styled.div`
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 280px;
  background-color: white;
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.boxShadow.lg};
  padding: ${props => props.theme.spacing.md};
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
  padding-bottom: ${props => props.theme.spacing.sm};
  border-bottom: 1px solid ${props => props.theme.colors.midGrey};
  
  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: ${props => props.theme.spacing.sm};
    }
  }
  
  button {
    background: none;
    border: none;
    color: ${props => props.theme.colors.darkGrey};
    cursor: pointer;
    
    &:hover {
      color: ${props => props.theme.colors.primary};
    }
  }
`;

const OptionGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
  
  h4 {
    font-size: 1rem;
    margin-bottom: ${props => props.theme.spacing.xs};
    display: flex;
    align-items: center;
    
    svg {
      margin-right: ${props => props.theme.spacing.xs};
      color: ${props => props.theme.colors.primary};
    }
  }
`;

const OptionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const OptionButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.lightGrey};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.midGrey};
  }
`;

// Create speech synthesis utterance with better voice selection
const speak = (text) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices
    let voices = window.speechSynthesis.getVoices();
    
    // Sort voice priority - first try to find these specific voices
    const preferredVoiceNames = [
      'Google US English', 'Google UK English Female',
      'Microsoft Zira', 'Microsoft David',
      'Samantha', 'Karen', 'Moira', 'Tessa',
      'Alex', 'Fiona', 'Daniel'
    ];
    
    // Log available voices to console for debugging
    console.log('Available voices:', voices.map(v => v.name));
    
    // Look for preferred voices
    let selectedVoice = null;
    
    // Try to find preferred voices
    for (const name of preferredVoiceNames) {
      const match = voices.find(voice => voice.name.includes(name));
      if (match) {
        selectedVoice = match;
        console.log('Selected voice:', match.name);
        break;
      }
    }
    
    // If no preferred voice is found, look for any English female voice
    if (!selectedVoice) {
      const englishFemaleVoice = voices.find(
        voice => voice.lang.includes('en') && voice.name.includes('Female')
      );
      
      if (englishFemaleVoice) {
        selectedVoice = englishFemaleVoice;
        console.log('Selected English female voice:', englishFemaleVoice.name);
      }
    }
    
    // If still no voice, try any English voice
    if (!selectedVoice) {
      const englishVoice = voices.find(voice => voice.lang.includes('en'));
      if (englishVoice) {
        selectedVoice = englishVoice;
        console.log('Selected English voice:', englishVoice.name);
      }
    }
    
    // Set the selected voice if found
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Adjust rate and pitch for more natural sound
    utterance.rate = 0.95;   // Slightly slower rate
    utterance.pitch = 1.05;  // Slightly higher pitch
    
    // Set language to English
    utterance.lang = 'en-US';
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  }
};

const AccessibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [contrast, setContrast] = useState('normal');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  
  // Ensure voices are loaded
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  
  // Load voices when component mounts
  useEffect(() => {
    // Function to load and log available voices
    const loadVoices = () => {
      // Get available voices
      const availableVoices = window.speechSynthesis.getVoices();
      
      if (availableVoices && availableVoices.length > 0) {
        console.log('Voices loaded:', availableVoices.length);
        console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
        setVoicesLoaded(true);
      } else {
        console.log('No voices available yet');
      }
    };
    
    // Try to load voices immediately
    loadVoices();
    
    // Some browsers (like Chrome) load voices asynchronously
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Create a backup timer in case the event doesn't fire
    const voiceTimer = setTimeout(() => {
      if (!voicesLoaded) {
        loadVoices();
      }
    }, 1000);
    
    return () => {
      // Clean up
      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      clearTimeout(voiceTimer);
      
      // Stop any ongoing speech when unmounting
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [voicesLoaded]);
  
  // Apply font size changes
  useEffect(() => {
    document.body.classList.remove('text-normal', 'text-large', 'text-xl');
    document.body.classList.add(`text-${fontSize}`);
    
    // Store preference
    localStorage.setItem('a11y-font-size', fontSize);
  }, [fontSize]);
  
  // Apply contrast changes
  useEffect(() => {
    if (contrast === 'high') {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Store preference
    localStorage.setItem('a11y-contrast', contrast);
  }, [contrast]);
  
  // Load stored preferences
  useEffect(() => {
    const storedFontSize = localStorage.getItem('a11y-font-size');
    const storedContrast = localStorage.getItem('a11y-contrast');
    const storedTts = localStorage.getItem('a11y-tts') === 'true';
    
    if (storedFontSize) setFontSize(storedFontSize);
    if (storedContrast) setContrast(storedContrast);
    if (storedTts) setTtsEnabled(storedTts);
  }, []);
  
  // Text-to-speech functionality
  useEffect(() => {
    if (!ttsEnabled) return;
    
    // Store preference
    localStorage.setItem('a11y-tts', ttsEnabled);
    
    // Add event listeners for TTS
    const handleTextSelection = () => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText && ttsEnabled) {
        speak(selectedText);
      }
    };
    
    document.addEventListener('mouseup', handleTextSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      // Stop any ongoing speech when unmounting
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [ttsEnabled]);
  
  return (
    <AccessibilityContainer>
      <AccessibilityButton 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility Options"
      >
        <FaAccessibleIcon size={24} />
        <div className="tooltip">Accessibility Options</div>
      </AccessibilityButton>
      
      <AccessibilityPanel isOpen={isOpen}>
        <PanelHeader>
          <h3>
            <FaAccessibleIcon /> Accessibility
          </h3>
          <button onClick={() => setIsOpen(false)} aria-label="Close accessibility panel">
            <FaTimes />
          </button>
        </PanelHeader>
        
        <OptionGroup>
          <h4><FaFont /> Text Size</h4>
          <OptionButtons>
            <OptionButton
              active={fontSize === 'normal'}
              onClick={() => setFontSize('normal')}
            >
              Normal
            </OptionButton>
            <OptionButton
              active={fontSize === 'large'}
              onClick={() => setFontSize('large')}
            >
              Large
            </OptionButton>
            <OptionButton
              active={fontSize === 'xl'}
              onClick={() => setFontSize('xl')}
            >
              Extra Large
            </OptionButton>
          </OptionButtons>
        </OptionGroup>
        
        <OptionGroup>
          <h4><FaAdjust /> Contrast</h4>
          <OptionButtons>
            <OptionButton
              active={contrast === 'normal'}
              onClick={() => setContrast('normal')}
            >
              Normal
            </OptionButton>
            <OptionButton
              active={contrast === 'high'}
              onClick={() => setContrast('high')}
            >
              High Contrast
            </OptionButton>
          </OptionButtons>
        </OptionGroup>
        
        <OptionGroup>
          <h4><FaVolumeUp /> Text-to-Speech</h4>
          <OptionButtons>
            <OptionButton
              active={ttsEnabled === false}
              onClick={() => setTtsEnabled(false)}
            >
              Off
            </OptionButton>
            <OptionButton
              active={ttsEnabled === true}
              onClick={() => setTtsEnabled(true)}
            >
              On
            </OptionButton>
          </OptionButtons>
          {ttsEnabled && (
            <p style={{ fontSize: '0.8rem', marginTop: '5px', color: '#666' }}>
              Select text to hear it read aloud
            </p>
          )}
        </OptionGroup>
      </AccessibilityPanel>
    </AccessibilityContainer>
  );
};

export default AccessibilityControls;