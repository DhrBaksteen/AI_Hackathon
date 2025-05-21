import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Message, ChatState } from '../types/Chat';
import { useAuth } from './AuthContext';

interface ChatContextType {
    messages: Message[];
    sendMessage: (content: string) => Promise<void>;
    clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'chat_histories';

const WELCOME_MESSAGE: Message = {
    content: "Welcome to Dice Dictator! Ask me anything about tabletop games and dice.",
    isUser: false,
    timestamp: Date.now()
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [chatState, setChatState] = useState<ChatState>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    });

    // Initialize chat with welcome message for new users
    useEffect(() => {
        if (user && !chatState[user.id]) {
            setChatState(prev => ({
                ...prev,
                [user.id]: [WELCOME_MESSAGE]
            }));
        }
    }, [user, chatState]);

    // Get current user's messages or empty array if no user or no messages
    const messages = user ? (chatState[user.id] || []) : [];

    // Save chat state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatState));
    }, [chatState]);

    const sendMessage = useCallback(async (content: string) => {
        if (!user) return;

        // Add user message
        const newUserMessage: Message = {
            content,
            isUser: true,
            timestamp: Date.now()
        };

        const updatedMessages = [...(chatState[user.id] || []), newUserMessage];
        
        setChatState(prev => ({
            ...prev,
            [user.id]: updatedMessages
        }));

        try {
            const response = await fetch('http://localhost:5062/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    conversationHistory: updatedMessages.map(msg => ({
                        content: msg.content,
                        role: msg.isUser ? 'user' : 'assistant'
                    })),
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        provider: user.provider,
                        role: user.role
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('API error');
            }

            const aiResponse = await response.text();
            
            // Add AI response
            setChatState(prev => ({
                ...prev,
                [user.id]: [...(prev[user.id] || []), {
                    content: aiResponse,
                    isUser: false,
                    timestamp: Date.now()
                }]
            }));
        } catch (error) {
            // Add error message
            setChatState(prev => ({
                ...prev,
                [user.id]: [...(prev[user.id] || []), {
                    content: 'Sorry, there was a problem contacting the AI backend.',
                    isUser: false,
                    timestamp: Date.now()
                }]
            }));
        }
    }, [user, chatState]);

    const clearHistory = useCallback(() => {
        if (!user) return;
        setChatState(prev => ({
            ...prev,
            [user.id]: [WELCOME_MESSAGE] // Reset to welcome message instead of empty array
        }));
    }, [user]);

    return (
        <ChatContext.Provider value={{ messages, sendMessage, clearHistory }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}; 