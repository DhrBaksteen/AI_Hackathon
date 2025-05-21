import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import logo from './assets/dice_dictator.jpg';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { content: input, isUser: true }]);

    try {
      const response = await fetch('http://localhost:5062/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
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

  return (
    <div className="App">
      <div className="grid"></div>
      <div className="content">
        <div className="header">
          <img src={logo} alt="Dice Dictator Logo" className="app-logo" />
          <h1 className="neon-text">Dice Dictator</h1>
        </div>
        
        <div className="chat-container neon-box">
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}>
                <div className="message-content">
                  <span className="message-label">{message.isUser ? 'You' : 'AI'}</span>
                  {message.content}
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
