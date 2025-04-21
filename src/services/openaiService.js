import axios from 'axios';

// OpenAI API configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Fallback responses if the API fails
const FALLBACK_RESPONSES = [
  "I'm having trouble connecting. Please try again shortly.",
  "Hmm, I seem to be having a brief technical hiccup. Let's try again.",
  "My writing circuits need a moment to recharge. Please try again."
];

// Create axios instance with default headers
const openaiAPI = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  }
});

/**
 * Send a message to OpenAI with full conversation history
 * @param {string} systemPrompt - Instructions for the AI assistant
 * @param {string} userMessage - User's current message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {number} temperature - Controls randomness (0-1)
 * @returns {Promise<string>} - AI's response text
 */
export const sendMessageToOpenAI = async (systemPrompt, userMessage, conversationHistory = [], temperature = 0.7) => {
  try {
    // Format conversation history into messages array
    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];
    
    // Add conversation history (if provided)
    if (conversationHistory && conversationHistory.length > 0) {
      // Filter to last 10 messages to avoid token limits
      const recentMessages = conversationHistory.slice(-10);
      
      // Add each message with the correct role
      recentMessages.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }
    
    // Add the current message
    messages.push({
      role: "user",
      content: userMessage
    });
    
    const response = await openaiAPI.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini", // or "gpt-3.5-turbo" for a more economical option
        messages: messages,
        temperature: temperature,
        max_tokens: 1500
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    // Handle specific API errors
    if (error.response) {
      if (error.response.status === 429) {
        // Rate limit exceeded
        return "I'm currently experiencing high demand. Please try again in a moment.";
      } else if (error.response.status === 400) {
        // Bad request - likely token limit
        return "Your message is too long for me to process. Please try a shorter message.";
      }
    }
    
    // Return a random fallback response
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }
};

export default {
  sendMessageToOpenAI
};