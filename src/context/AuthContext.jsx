import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';
import axiosInstance from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Проверяем наличие токена и инициализируем состояние
        if (token) {
            try {
                // Если мы распарсим токен, или достанем юзера из localStorage.
                // Временно будем хранить юзера в localStorage тоже.
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                } else {
                    // Если токен есть, а пользователя нет - сбрасываем (или можно сделать запрос на whoami, если такой есть)
                    logout();
                }
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                logout();
            }
        }
        setIsLoading(false);
    }, [token]);

    const login = async (loginName, password) => {
        setIsLoading(true);
        try {
            const data = await authService.login(loginName, password);

            // data format according to Swagger:
            // { token: string, login: string, userId: int, email: string, roles: ["string"] }

            const newToken = data.token;
            const newRefreshToken = data.refreshToken; // Добавлено получение refreshToken

            // Убираем токен из объекта user перед сохранением
            const userData = {
                login: data.login,
                userId: data.userId,
                email: data.email,
                roles: data.roles || []
            };

            setToken(newToken);
            setUser(userData);
            setIsAuthenticated(true);

            localStorage.setItem('token', newToken);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }
            localStorage.setItem('user', JSON.stringify(userData));

            return userData;
        } catch (error) {
            console.error("Login Error:", error);
            throw error; // Бросаем ошибку дальше, чтобы обработать её на странице логина
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken'); // Добавлено удаление
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasRole: (role) => user?.roles?.includes(role)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
