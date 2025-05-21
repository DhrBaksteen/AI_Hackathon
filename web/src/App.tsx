import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import logo from './assets/dice_dictator.jpg';
import { Login } from './components/Login';
import { useAuth } from './context/AuthContext';
import { useChat } from './context/ChatContext';
import { Message } from './types/Chat';
import ReactMarkdown from 'react-markdown';

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(true);
  const [loading, setLoading] = useState(false);

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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!input.trim()) return;

    setLoading(true);
    try {
      await sendMessage(input);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setInput('');
    setLoading(false);
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="App">
      <div className="grid"></div>
      <div className="content">
        <div className="header">
          <img src={logo} alt="Dice Dictator Logo" className="app-logo" />
          <h1 className="neon-text">Dice Dictator</h1>
          <div className="user-info">
            {user?.picture && (
              <img src={user.picture} alt="Profile" className="profile-picture" />
            )}
            <span className="user-name">
              {user?.name}
              {user?.role === 'admin' && <span className="admin-badge">Admin</span>}
            </span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        
        <div className="chat-container neon-box">
          <div 
            className="messages" 
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {messages.map((message: Message, index: number) => (
              <div key={`${message.timestamp}-${index}`} className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}>
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
