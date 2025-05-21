import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import logo from './assets/dice_dictator.jpg';
import ReactMarkdown from 'react-markdown';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();  // Prevent event bubbling
    if (!input.trim()) return;

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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();  // Prevent default Enter behavior
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
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
