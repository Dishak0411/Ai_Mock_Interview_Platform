import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    // Fallback to Guest if token invalid
                    setGuestUser();
                }
            } else {
                // Default to Guest User immediately
                setGuestUser();
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const setGuestUser = () => {
        setUser({
            full_name: "Guest User",
            email: "guest@example.com",
            id: "guest_id" // Mock ID
        });
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', new URLSearchParams({
            username: email,
            password: password
        }));
        localStorage.setItem('token', response.data.access_token);
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
        return true;
    };

    const register = async (email, password, fullName) => {
        await api.post('/auth/register', {
            email,
            password,
            full_name: fullName
        });
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
