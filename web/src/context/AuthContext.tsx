import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, AuthState } from '../types/User';

interface AuthContextType extends AuthState {
    login: (provider: 'google' | 'microsoft', email?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        loading: false
    });

    const mockUserData: { [key: string]: User } = {
        'john.doe@gmail.com': {
            id: '123456789',
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            picture: 'https://lh3.googleusercontent.com/a/default-user=s64-c',
            provider: 'google',
            role: 'user'
        },
        'alice.smith@gmail.com': {
            id: '987654321',
            name: 'Alice Smith',
            email: 'alice.smith@gmail.com',
            picture: 'https://lh3.googleusercontent.com/a/default-user-2=s64-c',
            provider: 'google',
            role: 'user'
        },
        'admin@microsoft.com': {
            id: 'admin123',
            name: 'System Administrator',
            email: 'admin@microsoft.com',
            picture: 'https://graph.microsoft.com/v1.0/me/photo/$value',
            provider: 'microsoft',
            role: 'admin'
        }
    };

    const login = useCallback(async (provider: 'google' | 'microsoft', email?: string) => {
        setAuthState(prev => ({ ...prev, loading: true }));
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            let userData: User | null = null;

            if (provider === 'google') {
                if (!email) {
                    throw new Error('Email is required for Google login');
                }
                userData = mockUserData[email];
                if (!userData || userData.provider !== 'google') {
                    throw new Error('Invalid Google account');
                }
            } else if (provider === 'microsoft') {
                // For Microsoft, always log in as admin
                userData = mockUserData['admin@microsoft.com'];
            }

            if (!userData) {
                throw new Error('User not found');
            }
            
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            
            setAuthState({
                isAuthenticated: true,
                user: userData,
                loading: false
            });
        } catch (error) {
            setAuthState(prev => ({ ...prev, loading: false }));
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
        });
    }, []);

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 