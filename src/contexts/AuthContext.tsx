import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken } from '@/services/api';
import { useLocation, useNavigate } from 'react-router-dom';

interface User {
    id: number;
    username: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Only try to verify if we have a token stored
            const token = getAuthToken();
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }
            const data = await api.me();
            setUser(data.user);
        } catch (error) {
            setUser(null);
            setAuthToken(null); // Clear invalid token
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (loginData: any) => {
        try {
            const data = await api.login(loginData);
            setUser(data.user);
            navigate('/');
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch {
            // Even if logout API fails, clear local state
        }
        setUser(null);
        setAuthToken(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};