import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sendChatMessage } from '../utils/groqService';
import { usePanelFullscreen } from '../hooks/usePanelFullscreen';
import { renderRichText } from '../utils/richText';
import './HeritageChatbot.css';

/** Conversation starters, grouped so the empty state reads as a menu. */
const SUGGESTION_GROUPS = [
  {
    label: 'Monuments',
    icon: '🕌',
    items: ['Tell me about the Taj Mahal', 'Why was the Red Fort built?']
  },
  {
    label: 'Heritage',
    icon: '🏛️',
    items: ['Which UNESCO sites are in India?', 'Explain Dravidian temple architecture']
  },
  {
    label: 'Travel',
    icon: '🧭',
    items: ['Best time to visit Rajasthan forts', 'How do I reach Ajanta Caves?']
  }
];

const MAX_INPUT_LENGTH = 1000;

const HeritageChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);
  const { isExpanded, togglePanelFullscreen } = usePanelFullscreen(chatWindowRef);

  const hasMessages = messages.length > 0;

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isLoading, isOpen, scrollToBottom]);

  // Show a "jump to latest" pill when the user has scrolled away from the end.
  const handleScroll = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distanceFromBottom > 160);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    const handleExternalOpen = () => {
      setIsOpen(true);
      setError(null);
    };
    window.addEventListener('heritage-chatbot-open', handleExternalOpen);
    return () => window.removeEventListener('heritage-chatbot-open', handleExternalOpen);
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen((open) => !open);
    setError(null);
  };

  const formatTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleSendMessage = useCallback(
    async (messageText = null) => {
      const textToSend = (messageText ?? inputValue).trim();
      if (!textToSend || isLoading) return;

      const userMessage = { role: 'user', content: textToSend, timestamp: formatTime() };

      // Snapshot history BEFORE appending, so the request matches what the
      // model should see.
      const history = messages.map((msg) => ({ role: msg.role, content: msg.content }));

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);
      setError(null);

      // Reset the auto-grown textarea back to one row.
      if (inputRef.current) inputRef.current.style.height = 'auto';

      try {
        const response = await sendChatMessage(textToSend, history);

        if (response.success) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: response.message, timestamp: formatTime() }
          ]);
        } else if (response.isRateLimit) {
          setError('Too many requests right now. Please wait a few moments and try again.');
        } else {
          setError(response.error || 'Could not get a response. Please try again.');
        }
      } catch (err) {
        console.error('Error sending message:', err);
        setError(err?.message || 'Network error. Check your connection and try again.');
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [inputValue, isLoading, messages]
  );

  const handleInputChange = (e) => {
    const { value } = e.target;
    setInputValue(value.slice(0, MAX_INPUT_LENGTH));

    // Auto-grow the textarea up to a ceiling, then scroll internally.
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  };

  // onKeyDown (not the deprecated onKeyPress) so modifier combinations and
  // non-character keys behave correctly.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = () => {
    setError(null);
    const lastUser = [...messages].reverse().find((msg) => msg.role === 'user');
    if (!lastUser) return;
    // Drop the unanswered turn, then resend it so history stays consistent.
    setMessages((prev) => {
      const lastIndex = prev.map((m) => m.role).lastIndexOf('user');
      return lastIndex === -1 ? prev : prev.slice(0, lastIndex);
    });
    setTimeout(() => handleSendMessage(lastUser.content), 0);
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleCopy = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1600);
    } catch {
      // Clipboard can be blocked by permissions; failing silently is fine here.
    }
  };

  const charCount = inputValue.length;
  const nearLimit = charCount > MAX_INPUT_LENGTH * 0.85;

  const renderedMessages = useMemo(
    () =>
      messages.map((message, index) => {
        const isAssistant = message.role === 'assistant';
        return (
          <motion.div
            key={`${message.role}-${index}-${message.timestamp || ''}`}
            className={`chat-message ${message.role}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {isAssistant && (
              <div className="chat-avatar" aria-hidden="true">🏛️</div>
            )}
            <div className="chat-message__body">
              <div className="message-bubble">
                {isAssistant ? renderRichText(message.content) : message.content}
              </div>
              <div className="message-meta">
                <span className="message-timestamp">{message.timestamp}</span>
                {isAssistant && (
                  <button
                    type="button"
                    className="message-action"
                    onClick={() => handleCopy(message.content, index)}
                    aria-label="Copy response"
                  >
                    {copiedIndex === index ? '✓ Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      }),
    [messages, copiedIndex]
  );

  return (
    <div className="heritage-chatbot-container">
      {/* Floating launcher */}
      <button
        type="button"
        className={`chatbot-toggle-button${isOpen ? ' is-open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close Heritage Assistant' : 'Open Heritage Assistant'}
        aria-expanded={isOpen}
      >
        <span className="chatbot-toggle-button__icon" aria-hidden="true">{isOpen ? '×' : '💬'}</span>
        <span className="chatbot-toggle-button__label">{isOpen ? 'Close' : 'Ask AI'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            className={`chatbot-window${isExpanded ? ' is-expanded' : ''}`}
            role="dialog"
            aria-modal="false"
            aria-labelledby="chatbot-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <header className="chatbot-header">
              <div className="chatbot-identity">
                <div className="chatbot-identity__avatar" aria-hidden="true">🏛️</div>
                <div className="chatbot-identity__text">
                  <h2 className="chatbot-identity__name" id="chatbot-title">Heritage Assistant</h2>
                  <p className="chatbot-identity__status">
                    <span className={`chatbot-status-dot${isLoading ? ' is-busy' : ''}`} aria-hidden="true" />
                    {isLoading ? 'Thinking…' : 'Ready to help'}
                  </p>
                </div>
              </div>

              <div className="chatbot-header-actions">
                {hasMessages && (
                  <button
                    type="button"
                    className="chatbot-icon-btn gs-tip"
                    data-tip="Clear chat"
                    onClick={handleClearChat}
                    aria-label="Clear conversation"
                  >
                    ⟲
                  </button>
                )}
                <button
                  type="button"
                  className="chatbot-icon-btn gs-tip gs-hide-mobile"
                  data-tip={isExpanded ? 'Exit fullscreen' : 'Fullscreen'}
                  onClick={togglePanelFullscreen}
                  aria-label={isExpanded ? 'Exit fullscreen chat' : 'Expand chat to fullscreen'}
                >
                  {isExpanded ? '⤡' : '⛶'}
                </button>
                <button
                  type="button"
                  className="chatbot-icon-btn chatbot-icon-btn--close"
                  onClick={toggleChat}
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>
            </header>

            {/* Messages */}
            <div
              className="chatbot-messages gs-scroll"
              ref={messagesRef}
              onScroll={handleScroll}
              role="log"
              aria-live="polite"
              aria-label="Conversation"
            >
              {!hasMessages ? (
                <div className="chatbot-empty-state">
                  <div className="chatbot-empty-state__icon" aria-hidden="true">🕌</div>
                  <h3 className="chatbot-empty-state__title">Explore India&apos;s heritage</h3>
                  <p className="chatbot-empty-state__text">
                    Ask about monuments, temples, forts, history, architecture or travel tips.
                  </p>

                  <div className="suggestion-groups">
                    {SUGGESTION_GROUPS.map((group) => (
                      <div className="suggestion-group" key={group.label}>
                        <div className="suggestion-group__label">
                          <span aria-hidden="true">{group.icon}</span> {group.label}
                        </div>
                        <div className="suggestion-group__items">
                          {group.items.map((question) => (
                            <button
                              type="button"
                              key={question}
                              className="suggested-question"
                              onClick={() => handleSendMessage(question)}
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {renderedMessages}

                  {isLoading && (
                    <motion.div
                      className="chat-message assistant"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="chat-avatar" aria-hidden="true">🏛️</div>
                      <div className="chat-message__body">
                        <div className="message-bubble message-bubble--typing">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Error banner sits above the composer so it is never scrolled away */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="chatbot-error"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="chatbot-error__icon" aria-hidden="true">⚠️</span>
                  <span className="chatbot-error__text">{error}</span>
                  <button type="button" className="chatbot-error__action" onClick={handleRetry}>
                    Retry
                  </button>
                  <button
                    type="button"
                    className="chatbot-error__dismiss"
                    onClick={() => setError(null)}
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Jump to latest */}
            <AnimatePresence>
              {showScrollDown && hasMessages && (
                <motion.button
                  type="button"
                  className="chatbot-scroll-down"
                  onClick={() => scrollToBottom()}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  aria-label="Scroll to latest message"
                >
                  ↓ Latest
                </motion.button>
              )}
            </AnimatePresence>

            {/* Composer */}
            <div className="chatbot-composer">
              <textarea
                ref={inputRef}
                className="chatbot-input gs-scroll"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any heritage site…"
                rows={1}
                maxLength={MAX_INPUT_LENGTH}
                disabled={isLoading}
                aria-label="Message"
              />
              <button
                type="button"
                className="chatbot-send-btn"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                aria-label="Send message"
                title="Send (Enter)"
              >
                {isLoading ? <span className="gs-spinner gs-spinner--sm" /> : <span aria-hidden="true">↑</span>}
              </button>
            </div>

            <div className="chatbot-composer-hint">
              <span><kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line</span>
              {nearLimit && (
                <span className={charCount >= MAX_INPUT_LENGTH ? 'is-limit' : ''}>
                  {charCount}/{MAX_INPUT_LENGTH}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeritageChatbot;
