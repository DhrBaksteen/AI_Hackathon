export interface User {
    id: string;
    name: string;
    email: string;
    picture?: string;
    provider: 'google' | 'microsoft';
    role: 'user' | 'admin';
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
} 