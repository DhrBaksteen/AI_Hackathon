import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export const Login: React.FC = () => {
    const { login, loading } = useAuth();
    const [showGoogleAccounts, setShowGoogleAccounts] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const googleAccounts = [
        {
            email: 'john.doe@gmail.com',
            name: 'John Doe',
            picture: 'https://lh3.googleusercontent.com/a/default-user=s64-c'
        },
        {
            email: 'alice.smith@gmail.com',
            name: 'Alice Smith',
            picture: 'https://lh3.googleusercontent.com/a/default-user-2=s64-c'
        }
    ];

    const handleGoogleClick = () => {
        setError(null);
        setShowGoogleAccounts(true);
    };

    const handleAccountSelect = async (email: string) => {
        try {
            await login('google', email);
        } catch (error) {
            setError((error as Error).message);
            setShowGoogleAccounts(false);
        }
    };

    const handleMicrosoftLogin = async () => {
        try {
            setError(null);
            await login('microsoft');
        } catch (error) {
            setError((error as Error).message);
        }
    };

    return (
        <div className="login-container neon-box">
            <h2 className="neon-text">Welcome to Dice Dictator</h2>
            {error && <div className="error-message">{error}</div>}
            
            <div className="login-buttons">
                {!showGoogleAccounts ? (
                    <button
                        className="login-button google-button"
                        onClick={handleGoogleClick}
                        disabled={loading}
                    >
                        <div className="button-content">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                                alt="Google Logo"
                                className="provider-logo"
                            />
                            <span>Sign in with Google</span>
                        </div>
                    </button>
                ) : (
                    <div className="google-accounts">
                        <h3>Choose an account</h3>
                        {googleAccounts.map(account => (
                            <button
                                key={account.email}
                                className="account-button"
                                onClick={() => handleAccountSelect(account.email)}
                                disabled={loading}
                            >
                                <img
                                    src={account.picture}
                                    alt={account.name}
                                    className="account-picture"
                                />
                                <div className="account-info">
                                    <span className="account-name">{account.name}</span>
                                    <span className="account-email">{account.email}</span>
                                </div>
                            </button>
                        ))}
                        <button
                            className="back-button"
                            onClick={() => setShowGoogleAccounts(false)}
                            disabled={loading}
                        >
                            Back
                        </button>
                    </div>
                )}
                
                <button
                    className="login-button microsoft-button"
                    onClick={handleMicrosoftLogin}
                    disabled={loading}
                >
                    <div className="button-content">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
                            alt="Microsoft Logo"
                            className="provider-logo"
                        />
                        <span>{loading ? 'Signing in...' : 'Sign in with Microsoft (Admin)'}</span>
                    </div>
                </button>
            </div>
        </div>
    );
}; 