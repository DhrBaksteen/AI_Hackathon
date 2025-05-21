import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import logo from './assets/dice_dictator.jpg';
import ReactMarkdown from 'react-markdown';
import TetrisBackground from './TetrisBackground';

interface Message {
  content: string;
  isUser: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { content: "Welcome to Dice Dictator! Ask me anything about tabletop games and dice.", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(true);

  const scrollToBottom = () => {
    if (shouldScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle manual scrolling
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
      setShouldScroll(isScrolledToBottom);
    }
  };

  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();  // Prevent event bubbling
    if (!input.trim()) return;

    setLoading(true);
    // Add user message
    const newUserMessage = { content: input, isUser: true };
    setMessages(prev => [...prev, newUserMessage]);
    setShouldScroll(true);

    try {
      const response = await fetch('http://localhost:5062/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.concat(newUserMessage).map(msg => ({
            content: msg.content,
            role: msg.isUser ? 'user' : 'assistant'
          }))
        }),
      });
      if (!response.ok) {
        throw new Error('API error');
      }
      const data = await response.text();
      setMessages(prev => [...prev, {
        content: data,
        isUser: false
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        content: 'Sorry, there was a problem contacting the AI backend.',
        isUser: false
      }]);
    }

    setInput('');
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();  // Prevent default Enter behavior
      handleSubmit(e as any);
    }
  };

  return (
    <div className="App">
      <TetrisBackground />
      <div className="grid"></div>
      <div className="content" style={{ background: 'rgba(26,26,46,0.85)', borderRadius: '16px', boxShadow: '0 0 30px #01cdfe55', backdropFilter: 'blur(2px)' }}>
        <div className="header">
          <img src={logo} alt="Dice Dictator Logo" className="app-logo" />
          <h1 className="neon-text">Dice Dictator</h1>
        </div>
        
        <div className="chat-container neon-box">
          <div 
            className="messages" 
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}>
                <div className="message-content">
                  <span className="message-label">{message.isUser ? 'You' : 'Dice Dictator'}</span>
                  {message.isUser ? (
                    message.content
                  ) : (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="message-input"
              disabled={loading}
            />
            <button type="submit" className="send-button" disabled={loading}>
              {loading ? (
                <span className="dice-loader">
                  <svg className="dice" width="24" height="24" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="4" fill="#fff" stroke="#222" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="2" fill="#222"/>
                    <circle cx="7" cy="7" r="1.5" fill="#222"/>
                    <circle cx="17" cy="7" r="1.5" fill="#222"/>
                    <circle cx="7" cy="17" r="1.5" fill="#222"/>
                    <circle cx="17" cy="17" r="1.5" fill="#222"/>
                  </svg>
                  <svg className="dice dice2" width="24" height="24" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="4" fill="#fff" stroke="#222" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="2" fill="#222"/>
                    <circle cx="7" cy="7" r="1.5" fill="#222"/>
                    <circle cx="17" cy="7" r="1.5" fill="#222"/>
                    <circle cx="7" cy="17" r="1.5" fill="#222"/>
                    <circle cx="17" cy="17" r="1.5" fill="#222"/>
                  </svg>
                </span>
              ) : (
                "Send"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
