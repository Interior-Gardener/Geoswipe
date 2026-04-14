import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sendChatMessage } from '../utils/groqService';
import { usePanelFullscreen } from '../hooks/usePanelFullscreen';
import './HeritageChatbot.css';

const HeritageChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);
  const { isExpanded, togglePanelFullscreen } = usePanelFullscreen(chatWindowRef);

  // Suggested questions for first-time users
  const suggestedQuestions = [
    "Tell me about the Taj Mahal 🕌",
    "What are UNESCO World Heritage Sites in India? 🏛️",
    "Which are the most famous forts in Rajasthan? 🏰",
    "Describe the temples of Khajuraho"
  ];

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleExternalOpen = () => {
      setIsOpen(true);
      setError(null);
    };

    window.addEventListener('heritage-chatbot-open', handleExternalOpen);
    return () => window.removeEventListener('heritage-chatbot-open', handleExternalOpen);
  }, []);

  // Handle ESC key to close chat
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setError(null);
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputValue.trim();
    
    if (!textToSend) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: formatTime()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Prepare conversation history (exclude timestamps)
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call Groq API
      const response = await sendChatMessage(textToSend, history);

      if (response.success) {
        // Add assistant message
        const assistantMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: formatTime()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Handle API errors
        if (response.isRateLimit) {
          setError('⚠️ Service temporarily unavailable. API rate limit exceeded. Please try again in a few moments.');
        } else {
          setError(`⚠️ ${response.error || 'Failed to get response. Please try again.'}`);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('⚠️ Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  const clearError = () => {
    setError(null);
  };

  const handleRetry = () => {
    clearError();
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        // Remove the failed attempt and retry
        setMessages(prev => prev.filter(msg => msg !== lastUserMessage));
        handleSendMessage(lastUserMessage.content);
      }
    }
  };

  return (
    <div className="heritage-chatbot-container">
      {/* Floating Toggle Button */}
      <button 
        className="chatbot-toggle-button"
        onClick={toggleChat}
        aria-label={isOpen ? "Close Heritage Chatbot" : "Open Heritage Chatbot"}
        title={isOpen ? "Close Chat" : "Ask about Heritage Sites"}
      >
        <span role="img" aria-label="chat">💬</span>
        <span>{isOpen ? 'Close Chat' : 'Ask AI'}</span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={chatWindowRef}
          className={`chatbot-window heritage-animated-panel ${isExpanded ? 'is-expanded' : ''}`}
          role="dialog"
          aria-labelledby="chatbot-title"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-title" id="chatbot-title">
              <span role="img" aria-label="heritage">🏛️</span>
              <span>Heritage Assistant</span>
            </div>
            <div className="chatbot-header-actions">
              <button
                className="chatbot-expand-btn"
                onClick={togglePanelFullscreen}
                aria-label={isExpanded ? 'Exit fullscreen chat' : 'Fullscreen chat'}
                title={isExpanded ? 'Exit fullscreen' : 'Open in fullscreen'}
              >
                {isExpanded ? '🡼' : '⛶'}
              </button>
              <button 
                className="chatbot-close-btn"
                onClick={toggleChat}
                aria-label="Close chat"
                title="Close (ESC)"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              // Empty state with suggestions
              <div className="chatbot-empty-state">
                <div className="chatbot-empty-state-icon">🕌</div>
                <div className="chatbot-empty-state-text">
                  Ask me about Indian Heritage Sites!
                </div>
                <div className="chatbot-empty-state-subtext">
                  I can help you learn about monuments, temples, forts, and more.
                </div>
                
                <div className="suggested-questions">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="suggested-question"
                      onClick={() => handleSuggestedQuestion(question)}
                      aria-label={`Ask: ${question}`}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Messages
              <>
                {messages.map((message, index) => (
                  <motion.div
                    key={`${message.role}-${index}-${message.timestamp || ''}`}
                    className={`chat-message ${message.role}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <div className="message-bubble">
                      {message.content}
                    </div>
                    <div className="message-timestamp">
                      {message.timestamp}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <motion.div
                    className="chat-message assistant"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </motion.div>
                )}

                {/* Error message */}
                {error && (
                  <div className="error-message">
                    <span>{error}</span>
                    <button onClick={handleRetry}>Retry</button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask about any heritage site..."
              rows="1"
              disabled={isLoading}
              aria-label="Type your message"
            />
            <button
              className="chatbot-send-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
              title="Send (Enter)"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default HeritageChatbot;
